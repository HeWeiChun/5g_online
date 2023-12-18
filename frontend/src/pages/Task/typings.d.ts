declare namespace API_Task {
  type taskParams = {
    current?: number;
    pageSize?: number;
  };

  type taskList = {
    data?: taskListItem[];
    total?: number;
    success?: boolean;
  }

  // 获取所有任务
  type taskListItem = {
    task_id: string;
    create_time: string;
    start_time?: string;
    end_time?: string;
    mode: number;
    pcap_path?: string;
    normal?: number;
    abnormal?: number;
    total?: number;
    status: number;
    model: number;
  }

  // 添加任务
  type taskListItemAdd = {
    task_id: string;
    create_time: string;
    mode: number;
    status: number;
    model: number;
    pcap_file?: File;
    port?: number;
  }

  // 多个任务
  type taskListItemKeys = {
    taskIds: string[];
  }
}
