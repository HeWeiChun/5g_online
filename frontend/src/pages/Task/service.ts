// @ts-ignore
import { request } from '@umijs/max';

// 获取任务列表
export async function task(params: API_Task.taskParams, options?: { [key: string]: any }) {
  return request<API_Task.taskList>('/api/task/getAllTask', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

// 添加离线任务
export async function addOfflineTask(body: API_Task.taskListItemAdd, options?: { [key: string]: any }) {
  let params = new FormData();
  params.append('taskId', body.task_id)
  params.append('createTime', body.create_time)
  params.append('mode', body.mode);
  params.append('model', body.model)
  params.append('status', body.status);
  params.append('pcapFile', body.pcap_file);
  return request<API_Task.taskListItemAdd>('/api/task/createOfflineTask', {
    method: 'POST',
    data: params,
    ...(options || {}),
  });
}

// 添加在线任务
export async function addOnlineTask(body: API_Task.taskListItemAdd, options?: { [key: string]: any }) {
  let params = new FormData();
  params.append('taskId', body.task_id)
  params.append('createTime', body.create_time)
  params.append('mode', body.mode);
  params.append('model', body.model)
  params.append('status', body.status);
  params.append('port', body.port);
  return request<API_Task.taskListItemAdd>('/api/task/createOnlineTask', {
    method: 'POST',
    data: params,
    ...(options || {}),
  });
}

// 删除任务
export async function removeTask(body: API_Task.taskListItemKeys, options?: { [key: string]: any }) {
  let params = new FormData();
  body.taskIds.forEach((taskId) => {
    params.append('taskId', taskId);
  });
  return request<Record<string, any>>('/api/task/deleteTask', {
    method: 'POST',
    data: params,
    ...(options || {}),
  });
}

// 开始任务
export async function startTask(body: API_Task.taskListItemKeys, options?: { [key: string]: any }) {
  let params = new FormData();
  body.taskIds.forEach((taskId) => {
    params.append('taskId', taskId);
  });
  return request<Record<string, any>>('/api/task/startTask', {
    method: 'POST',
    data: params,
    ...(options || {}),
  });
}

// 停止任务
export async function stopTask(body: API_Task.taskListItemKeys, options?: { [key: string]: any }) {
  let params = new FormData();
  body.taskIds.forEach((taskId) => {
    params.append('taskId', taskId);
  });
  return request<Record<string, any>>('/api/task/stopTask', {
    method: 'POST',
    data: params,
    ...(options || {}),
  });
}
