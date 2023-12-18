# -*- coding: UTF-8 -*-
import argparse
import datetime
import os
import subprocess
import sys
import threading

from clickhouse_driver import Client

client = Client(host='10.3.242.84', port=9000, user='default', password='password')
database = "sctp_test"


def go_script(taskid, model, mode, update_status):
    # 执行Go脚本
    aggregate_method = "Time" if model == "1" else "UE"
    taskid_param = {'taskid': taskid}
    select_pcap = "SELECT true_pcap_path FROM " + database + ".task WHERE task_id = %(taskid)s"
    select_port = "SELECT port FROM " + database + ".task WHERE task_id = %(taskid)s"
    if mode == "0":
        pcapPath = f"../upload/{client.execute(select_pcap, taskid_param)[0][0]}"
    else:
        pcapPath = "lo"
    go_cmd = [
        "go",
        "run",
        "main.go",
        "--pcap_path",
        pcapPath,
        "--taskid",
        taskid,
        "--mode",
        mode,
        "--aggregate",
        aggregate_method
    ]
    go_process = subprocess.Popen(go_cmd, cwd="/home/whe/5gngap/backend/core/goonline",
                                  stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    print(f"Go脚本进程PID为: {go_process.pid}")

    while True:
        line = go_process.stdout.readline()
        if not line:
            break
        print("脚本输出: (Go) " + line.strip().decode('utf-8'))

    go_exit_code = go_process.wait()

    print(f"Go脚本执行完毕, 退出码: {go_exit_code}")
    if go_exit_code == 0:
        task_status = 3
    else:
        task_status = 100

    go_update_params = {'taskid': taskid, 'status': task_status}
    client.execute(update_status, go_update_params)
    if go_exit_code == 0:
        print("解析完成")
    else:
        print("解析失败")
        return


def python_script(taskid, model):
    python_cmd = [
        "/home/whe/anaconda3/envs/xgboost39/bin/python",
        os.path.join(os.getcwd(), "core", "python", "springboot.py"),
        "--taskid",
        taskid,
        "--model",
        model
    ]
    python_process = subprocess.Popen(python_cmd, cwd="/home/whe/5gngap/backend",
                                      stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    print(f"Python脚本进程的PID为: {python_process.pid}")

    while True:
        line = python_process.stdout.readline()
        if not line:
            break
        print("(Python) " + line.strip().decode('utf-8'))

    python_exit_code = python_process.wait()
    print(f"Python脚本执行完毕, 退出码：{python_exit_code}")

    current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    taskid_param = {'taskid': taskid}
    if model == '1':
        get_abnormal_flow = "SELECT COUNT(*) FROM " + database + ".time_flow WHERE task_id = %(taskid)s AND status_flow = 200"
        get_normal_flow = "SELECT COUNT(*) FROM " + database + ".time_flow WHERE task_id = %(taskid)s AND status_flow = 100"
    else:
        get_abnormal_flow = "SELECT COUNT(*) FROM " + database + ".ue_flow WHERE task_id = %(taskid)s AND status_flow = 200"
        get_normal_flow = "SELECT COUNT(*) FROM " + database + ".ue_flow WHERE task_id = %(taskid)s AND status_flow = 100"
    update_info = "ALTER TABLE " + database + ".task UPDATE status = %(status)s, normal = %(normal)s, " \
                                              "abnormal = %(abnormal)s, total = %(total)s, end_time = %(endtime)s WHERE task_id = %(taskid)s"

    if python_exit_code == 0:
        task_status = 4
    else:
        task_status = 100

    abnormal_flow = client.execute(get_abnormal_flow, taskid_param)[0][0]
    normal_flow = client.execute(get_normal_flow, taskid_param)[0][0]

    update_info_params = {
        'status': task_status,
        'normal': normal_flow,
        'abnormal': abnormal_flow,
        'total': abnormal_flow + normal_flow,
        'endtime': current_time,
        'taskid': taskid
    }
    client.execute(update_info, update_info_params)

    if task_status == 4:
        print("检测完成")
    else:
        print("检测失败")


def run_go_script(args, update_status):
    try:
        go_script(args.taskid, args.model, args.mode, update_status)
    except Exception as e:
        print("Go脚本错误: " + str(e))
        task_status = 100
        fail_params = {'taskid': args.taskid, 'status': task_status}
        client.execute(update_status, fail_params)
        print("Go脚本检测失败")


def run_python_script(args, update_status):
    try:
        python_script(args.taskid, args.model)
    except Exception as e:
        print("Python脚本错误: " + str(e))
        task_status = 100
        fail_params = {'taskid': args.taskid, 'status': task_status}
        client.execute(update_status, fail_params)
        print("Python脚本检测失败")


def main(args):
    update_status = "ALTER TABLE " + database + ".task UPDATE status = %(status)s WHERE task_id = %(taskid)s"

    # 创建并启动两个线程
    go_thread = threading.Thread(target=run_go_script, args=(args, update_status))
    python_thread = threading.Thread(target=run_python_script, args=(args, update_status))

    go_thread.start()
    python_thread.start()

    # 等待两个线程执行完毕
    go_thread.join()
    python_thread.join()

    sys.exit(0)


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
    parser = argparse.ArgumentParser()
    parser.add_argument('--model', required=True, type=str)
    parser.add_argument('--taskid', required=True, type=str)
    parser.add_argument('--mode', required=True, type=str)
    args = parser.parse_args()
    main(args)
