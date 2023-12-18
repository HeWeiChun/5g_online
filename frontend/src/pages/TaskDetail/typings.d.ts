declare namespace API_Detail {
  type packetParams = {
    current?: number;
    pageSize?: number;
  };

  type packetList = {
    data?: packetListItem[];
    total?: number;
    success?: boolean;
  }

  // 获取所有数据包
  type packetListItem = {
    ngap_type: string;
    ngap_procedure_code: string;
    ran_ue_ngap_id:number;
    packet_len: number;
    arrive_time_us: number;
    arrive_time: string;
    time_interval: number;
    verification_tag: number;
    src_ip: string;
    dst_ip: string;
    dir_seq: number;
    flow_ue_id: string;
    flow_time_id: string;
    status_packet: number;
  }

  type ueFlowList = {
    data?: ueFlowListItem[];
    total?: number;
    success?: boolean;
  }

  // 获取所有流
  type ueFlowListItem = {
    flow_id: string;
    ran_ue_ngap_id: number;
    total_num: number;
    start_second: number;
    end_second: number;
    begin_time: string;
    last_time: string;
    verification_tag: number;
    src_ip: string;
    dst_ip: string;
    status_flow: number;
    task_id: string;
  }
  // 获取特定流的所有包
  type packetListByFlow = {
    FlowId: string;
    Model: number;
  }
  // 获取特定任务的所有流
  type flowListByTask = {
    TaskID: string;
    Model: number;
  }
  // 获取特点任务的摘要
  type abstractByTask = {
    TaskID: string;
  }
  // 介绍栏
  type abstractList = {
    code: number;
    message: string;
    type: string;
    success: boolean;
    data: API_Detail.abstract;
  }
  // 分页
  type abnormalParams = {
    current?: number;
    pageSize?: number;
  };


  // 异常流量类别占比(二分类)
  type abnormalFlowBinary = {
    normal: number;
    abnormal: number;
  }

  // 异常流量类别占比(多分类)
  type abnormalFlowMulti = {
    normal: number;
    abnormal: number;
  }

  // 概况页
  type abstract = {
    activeDetectedFlows: number;
    activePendingFlows: number;
    abnormalFlowBinary: abnormalFlowBinary;
    abnormalFlowMulti: abnormalFlowMulti;
  }
}
