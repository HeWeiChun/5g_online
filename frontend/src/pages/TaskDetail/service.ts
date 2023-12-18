// @ts-ignore
/* eslint-disable */
import {request} from '@umijs/max';

// 获取所有任务ID
export async function task(params: API_Task.taskParams, options?: { [key: string]: any }) {
    return request<API_Task.taskList>('/api/task/getAllTask', {
        method: 'GET',
        params: {
            ...params,
        },
        ...(options || {}),
    });
}

// 获取所有流量包
export async function packet(params: API_Detail.packetParams, options?: { [key: string]: any }) {
    return request<API_Detail.packetList>('/api/packet/getAllPacket', {
        method: 'GET',
        params: {
            ...params,
        },
        ...(options || {}),
    });
}

// 获取指定taskid的流
export async function flowByTask(body: API_Detail.flowListByTask) {
    if (body.Model == 1) {
        return request<API_Detail.ueFlowList>(`/api/timeflow/getTimeFlowByTaskId?taskId=${body.TaskID}`, {
            method: 'GET',
        });
    }
    else {
        return request<API_Detail.ueFlowList>(`/api/ueflow/getUEFlowByTaskId?taskId=${body.TaskID}`, {
            method: 'GET',
        });
    }
}

// 获取指定flowid的数据包
export async function packetByueid(body: API_Detail.packetListByFlow) {
    return request<API_Detail.packetList>(`/api/packet/getPacketByFlowId?flowId=${body.FlowId}&model=${body.Model}`, {
        method: 'GET',
    });
}

// 获取指定taskid的摘要
export async function abstractById(body: API_Detail.abstractByTask) {
    return request<API_Detail.abstractList>(`/api/abstract/getAbstractByID?taskId=${body.TaskID}`, {
        method: 'GET',
    });
}
