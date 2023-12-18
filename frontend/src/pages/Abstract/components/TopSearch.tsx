import { Card, Table } from 'antd';
import React from 'react';


const columns = [
  {
    title: '异常流',
    dataIndex: 'flow_id',
    valueType: 'textarea',
  },
  {
    title: '归属任务',
    dataIndex: 'task_id',
    valueType: 'textarea',
  },
  {
    title: '异常时间',
    dataIndex: 'latest_time',
    valueType: 'dateTime',
  },
];

const TopSearch = ({loading, abnormalEvent}: { loading: boolean; abnormalEvent: API_Detail.ueFlowListItem[]; }) => {
  return (
    <Card
      loading={loading}
      bordered={false}
      title="异常事件"
      style={{
        height: '100%',
      }}
    >
      <Table<any>
        rowKey={(record) => record.flowId}
        size="small"
        columns={columns}
        dataSource={abnormalEvent}
        pagination={{
          style: {marginBottom: 0},
          pageSize: 5,
          showSizeChanger: false
        }}
      />
    </Card>
  );
}

export default TopSearch;
