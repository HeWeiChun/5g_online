import argparse
import pickle
import random
import sys

import joblib
import numpy as np
import pandas as pd
from clickhouse_driver import Client

import module.feature_extraction as fe
import module.whisper_feature_extraction as whisper

sys.stdout.reconfigure(encoding='utf-8')
client = Client(host='10.3.242.84', port=9000, user='default', password='password')
database = "sctp_test"


def detect_taskid(model_type, taskid):
    # 加载模型
    loss_p = 60000
    if model_type == '0':  # XGBoost(UEID聚合)
        model_path = "core/python/model/ueid_XGBoost1010.pkl"
        print("当前使用模型: XGBoost(UEID)")
    elif model_type == '1':  # XGBoost(Time聚合)
        model_path = "core/python/model/time_XGBoost1010.pkl"
        print("当前使用模型: XGBoost(Time)")
    elif model_type == '2':  # Whipser模型(UEID聚合)
        model_path = "core/python/model/kmeans.pkl"
        print("当前使用模型: Whipser(UEID)")
    else:
        model_path = "core/python/model/ueid_XGBoost1010.pkl"
        print("不合法的模型类型. 使用默认模型: XGBoost(UEID)")
    model = joblib.load(model_path)
    random.seed(27)
    taskid_params = {'taskid': taskid}
    select = "SELECT status FROM " + database + ".task WHERE task_id = %(taskid)s"
    print(model_type)
    if model_type == '1':
        get_abnormal_flow = ("SELECT COUNT(*) FROM " +
                             database + ".time_flow WHERE task_id = %(taskid)s AND status_flow = 200")
        get_normal_flow = ("SELECT COUNT(*) FROM " +
                           database + ".time_flow WHERE task_id = %(taskid)s AND status_flow = 100")
    else:
        get_abnormal_flow = ("SELECT COUNT(*) FROM " +
                             database + ".ue_flow WHERE task_id = %(taskid)s AND status_flow = 200")
        get_normal_flow = ("SELECT COUNT(*) FROM " +
                           database + ".ue_flow WHERE task_id = %(taskid)s AND status_flow = 100")
        update_info = ("ALTER TABLE " + database + ".task UPDATE "
                                                   "normal = %(normal)s, "
                                                   "abnormal = %(abnormal)s, "
                                                   "total = %(total)s "
                                                   "WHERE task_id = %(taskid)s")

    while True:
        # 在线检测 100:错误 200:已停止 0:未开始 1:待开始 2:解析并检测中 3:检测中 4:已完成
        task_status = client.execute(select, taskid_params)[0][0]

        # 获取当前任务的所有未检测的流ID
        if model_type == '1':
            flow = "SELECT flow_id FROM " + database + ".time_flow WHERE task_id = %(taskid)s AND status_flow = 0"
            packet = "SELECT * FROM " + database + ".packet WHERE flow_time_id = %(flowid)s ORDER BY arrive_time"
            update_flow_query = "ALTER TABLE " + database + ".time_flow UPDATE status_flow = %(ypredict)s WHERE flow_id = %(flowid)s"
        else:
            flow = "SELECT flow_id FROM " + database + ".ue_flow WHERE task_id = %(taskid)s AND status_flow = 0"
            packet = "SELECT * FROM " + database + ".packet WHERE flow_ue_id = %(flowid)s ORDER BY arrive_time"
            update_flow_query = "ALTER TABLE " + database + ".ue_flow UPDATE status_flow = %(ypredict)s WHERE flow_id = %(flowid)s"
        flow_id = client.execute(flow, taskid_params)
        # Whisper模型
        if model_type == '2':
            for id in flow_id:
                # 获取当前流的所有包
                packet = ("SELECT packet_len,time_interval,ngap_type FROM " + database + ".packet "
                                                                                         "WHERE flow_ue_id = %(flowid)s ORDER BY arrive_time")
                packet_params = {'flowid': id}
                result = client.execute(packet, packet_params)
                # 特征提取 & 模型检测
                feature = whisper.extraction(result)
                feature = np.array(feature)
                f = open("core/python/model/train_loss.data", 'rb')
                train_loss = pickle.load(f)
                centers = model.cluster_centers_
                labels = model.predict(feature)
                prediction = []
                # print("开始测试数据...")
                # print(train_loss)
                predict_code = 100
                for i in range(len(feature)):
                    temp = feature[i] - centers[labels[i]]
                    if np.linalg.norm(temp) > train_loss * loss_p:
                        # ANORMAL
                        prediction.append(0)
                        predict_code = 200
                    else:
                        # NORMAL
                        prediction.append(1)
                # 更新检测结果
                result_params = {
                    'ypredict': predict_code,
                    'flowid': id
                }
                client.execute(update_flow_query, result_params)
        # XGBoost模型
        else:

            for id in flow_id:
                # 获取当前流的所有包
                packet_params = {'flowid': id}
                result = client.execute(packet, packet_params)

                # 提取原始特征(包长, 时间戳, 序列方向)
                X = []
                for row in result:
                    X.append([row[1], row[2], row[3], row[5], row[10], row[13], row[14], row[15]])
                df = pd.DataFrame(X, columns=["ProcedureCode", "RAN-UE-NGAP-ID", "PacketLen", "Time", "DirSeq",
                                              "InitiatingMessage", "SuccessfulOutcome", "UnsuccessfulOutcome"])
                df['Time'] = df['Time'].astype('int64') / 10 ** 9

                # 特征提取 & 模型检测
                if len(df) > 1:
                    feature = fe.ngap_feature_extract(df)
                    y_predict = model.predict([feature])[0]
                else:
                    y_predict = 0
                if y_predict == 0:
                    predict_code = 100
                else:
                    predict_code = 200
                # 更新检测结果
                result_params = {
                    'ypredict': predict_code,
                    'flowid': id
                }
                client.execute(update_flow_query, result_params)
        taskid_param = {'taskid': taskid}

        abnormal_flow = client.execute(get_abnormal_flow, taskid_param)[0][0]
        normal_flow = client.execute(get_normal_flow, taskid_param)[0][0]
        update_info_params = {
            'normal': normal_flow,
            'abnormal': abnormal_flow,
            'total': abnormal_flow + normal_flow,
            'taskid': taskid
        }
        client.execute(update_info, update_info_params)
        if task_status == 3:
            client.disconnect()
            sys.exit(0)
        elif task_status == 100:
            client.disconnect()
            sys.exit(100)
        elif task_status == 200:
            client.disconnect()
            sys.exit(200)


def main(parser):
    args = parser.parse_args()
    detect_taskid(args.model, args.taskid)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--model', required=True, type=str)
    parser.add_argument('--taskid', required=True, type=str)
    main(parser)
