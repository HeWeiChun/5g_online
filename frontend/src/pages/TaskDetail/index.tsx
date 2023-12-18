import React, {useState, useRef, useEffect, Suspense} from 'react';
import {Col, Divider, Row, Space} from 'antd';
import {
    GridContent,
    ProTable,
    ActionType,
    ProColumns,
} from '@ant-design/pro-components';
import {task, flowByTask, packetByueid, abstractById} from './service';
import PageLoading from "@/pages/OurCharts/components/PageLoading";
import IntroduceRow from "@/pages/TaskDetail/components/IntroduceRow";


const TaskDetailPage: React.FC = () => {
    const taskRef = useRef<ActionType>();
    const flowRef = useRef<ActionType>();
    const packetRef = useRef<ActionType>();
    const [abstractValue, setAbstractValue] = useState<API_Detail.abstract>({
        abnormalFlowBinary: {abnormal: 0, normal: 0},
        abnormalFlowMulti: {abnormal: 0, normal: 0},
        activeDetectedFlows: 0,
        activePendingFlows: 0
    });

    const [selectedTaskId, setSelectedTaskId] = useState('');
    const [selectedModel, setSelectedModel] = useState(0);

    // 未选择任务id时, 显示更详细的任务信息
    const taskid_columns_detail: ProColumns<API_Task.taskListItem>[] = [
        {
            title: '任务ID',
            dataIndex: 'task_id',
            valueType: 'textarea',
            ellipsis: true,
        },
        {
            title: '离线检测文件名',
            dataIndex: 'pcap_path',
            valueType: 'textarea',
        },
        {
            title: '检测模型',
            dataIndex: 'model',
            renderText: (val: number) => {
                return val === 0 ? 'XGBoost(UEID聚合)' : (val === 1 ? 'XGBoost(时间片聚合)' : 'Whisper(UEID聚合)');
            },
        },
        {
            title: '任务创建时间',
            dataIndex: 'create_time',
            valueType: 'dateTime',
        },
        {
            title: '任务开始时间',
            dataIndex: 'start_time',
            valueType: 'dateTime',
        },
        {
            title: '任务结束时间',
            dataIndex: 'end_time',
            valueType: 'dateTime',
        },
        {
            title: '状态',
            dataIndex: 'status',
            valueEnum: {
                100: {
                    text: '错误',
                    status: 'Error',
                },
                200: {
                    text: '已停止',
                    status: 'Error',
                },
                0: {
                    text: '未开始',
                    status: 'Default',
                },
                1: {
                    text: '待解析',
                    status: 'Processing',
                },
                2: {
                    text: '解析并检测中',
                    status: 'Processing',
                },
                3: {
                    text: '检测中',
                    status: 'Processing',
                },
                4: {
                    text: '检测完成',
                    status: 'Success',
                },
            },
        }
    ]
    // 选择任务id后只显示任务id
    const taskid_columns: ProColumns<API_Task.taskListItem>[] = [
        {
            title: '任务ID',
            dataIndex: 'task_id',
            valueType: 'textarea',
            ellipsis: true,
        },
    ]
    // 选择任务id后, 显示对应的流信息
    const ueflow_columns: ProColumns<API_Detail.ueFlowListItem>[] = [
        {
            title: '流ID',
            dataIndex: 'flow_id',
            valueType: 'textarea',
            ellipsis: true,
        },
        // {
        //     title: 'UEID',
        //     dataIndex: 'ran_ue_ngap_id',
        //     valueType: 'textarea',
        // },
        {
            title: '数据包数',
            dataIndex: 'total_num',
            valueType: 'textarea',
        },
        {
            title: '开始时间',
            dataIndex: 'begin_time',
        },
        {
            title: '结束时间',
            dataIndex: 'latest_time',
        },
        {
            title: '流状态',
            dataIndex: 'status_flow',
            filters: true,
            onFilter: true,
            valueEnum: {
                100: {
                    text: '正常',
                    status: 'Success',
                },
                200: {
                    text: '异常',
                    status: 'Error',
                },
                0: {
                    text: '待解析',
                    status: 'Default',
                },
            },
        },
        {
            title: '任务ID',
            dataIndex: 'task_id',
            valueType: 'textarea',
            ellipsis: true,
        }
    ]
    // 选择流id后, 显示对应的数据包信息
    const packet_columns: ProColumns<API_Detail.packetListItem>[] = [
        {
            title: 'UE_ID',
            dataIndex: 'ran_ue_ngap_id',
            valueType: 'textarea',
        },
        {
            title: 'NGAP类型',
            dataIndex: 'ngap_type',
            valueType: 'textarea',
        },
        {
            title: 'NGAP消息码',
            dataIndex: 'ngap_procedure_code',
            valueType: 'textarea',
        },
        {
            title: '包长度',
            dataIndex: 'packet_len',
            valueType: 'textarea',
        },
        {
            title: '到达时间US',
            dataIndex: 'arrive_time_us',
            valueType: 'textarea',
            hideInTable: true,
        },
        {
            title: '到达时间',
            dataIndex: 'arrive_time',
        },
        {
            title: '时间间隔',
            dataIndex: 'time_interval',
            valueType: 'textarea',
            hideInTable: true,
        },
        {
            title: '校验码',
            dataIndex: 'verification_tag',
            valueType: 'textarea',
            hideInTable: true,
        },
        {
            title: '源IP',
            dataIndex: 'src_ip',
            valueType: 'textarea',
        },
        {
            title: '目的IP',
            dataIndex: 'dst_ip',
            valueType: 'textarea',
        },
        {
            title: '方向',
            dataIndex: 'dir_seq',
            valueType: 'textarea',
            hideInTable: true,
        },
        {
            title: 'UEID流ID',
            dataIndex: 'flow_ue_id',
            valueType: 'textarea',
            hideInTable: true,
        },
        {
            title: '时间流ID',
            dataIndex: 'flow_time_id',
            valueType: 'textarea',
            hideInTable: true,
        },
        {
            title: '包状态',
            dataIndex: 'status_packet',
            valueType: 'textarea',
            hideInTable: true,
        }
    ]

    useEffect(() => {
        const fetchData = async () => {
            const msg = await abstractById({TaskID: selectedTaskId});
            setAbstractValue(msg.data);
        };
        if (selectedTaskId) {
            fetchData();
        } else {
            setAbstractValue({
                abnormalFlowBinary: {abnormal: 0, normal: 0},
                abnormalFlowMulti: {abnormal: 0, normal: 0},
                activeDetectedFlows: 0,
                activePendingFlows: 0
            });
        }
    }, [selectedTaskId]);

    return (
        <GridContent>
            <Row gutter={16}>

                <Col span={selectedTaskId ? (4) : (24)}>
                    {/* 左侧菜单 */}
                    <ProTable<API_Task.taskListItem, API_Task.taskParams>
                        columns={selectedTaskId ? (taskid_columns) : (taskid_columns_detail)}
                        rowKey="task_id"
                        rowSelection={{
                            type: "radio", onChange: (_, selectedRows) => {
                                if (selectedRows.length > 0) {
                                    setSelectedTaskId(selectedRows[0].task_id);
                                    setSelectedModel(selectedRows[0].model);
                                    if(flowRef.current) {
                                        flowRef.current.reload();
                                    }
                                } else {
                                    setSelectedTaskId('');
                                    setSelectedModel(0);
                                }
                                if (taskRef.current) {
                                    taskRef.current.reload();
                                }
                            },
                            alwaysShowAlert: true,
                        }}
                        tableAlertRender={({
                                               selectedRowKeys,
                                               onCleanSelected,
                                           }) => {
                            return (
                                <Space size={24}>
                                  <span>
                                    {selectedRowKeys.length > 0 ? ("当前选择" + selectedRowKeys[0]) : ("请选择要查看的任务")}
                                      <a style={{marginInlineStart: 8}} onClick={onCleanSelected}>
                                      {selectedRowKeys.length > 0 ? ("取消选择") : ("")}
                                    </a>
                                  </span>
                                </Space>
                            );
                        }}
                        tableAlertOptionRender={false}
                        search={false}
                        request={task}
                    />
                </Col>

                {/* 任务详细信息 */}
                <Col span={20}>
                    {/* 显示任务详细信息 */}
                    {selectedTaskId ? (
                        <>
                            <Divider>任务概况</Divider>
                            <GridContent>
                                <>
                                    <Suspense fallback={<PageLoading/>}>
                                        <IntroduceRow loading={false} introduceData={abstractValue}/>
                                    </Suspense>
                                </>
                            </GridContent>
                            <Divider>安全事件</Divider>
                            <ProTable<API_Detail.ueFlowListItem, API_Detail.packetParams>
                                headerTitle="异常流列表"
                                actionRef={flowRef}
                                columns={ueflow_columns}
                                rowKey="flow_id"
                                rowSelection={false}
                                search={false}
                                request={
                                    async (params: {
                                        pageSize?: number;
                                        current?: number;
                                    },) => {
                                        const msg = await flowByTask({
                                            TaskID: selectedTaskId,
                                            Model: selectedModel,
                                        });
                                        return {
                                            data: msg.data,
                                            success: msg.success,
                                        };
                                    }
                                }

                                expandable={{
                                    expandedRowRender: (record) => (
                                        <ProTable<API_Detail.packetListItem, API_Detail.packetParams>
                                            headerTitle={false}
                                            options={false}
                                            actionRef={packetRef}
                                            columns={packet_columns}
                                            rowSelection={false}
                                            search={false}
                                            request={async (params: {
                                                pageSize?: number;
                                                current?: number;
                                            },) => {
                                                const msg = await packetByueid({
                                                    FlowId: record.flow_id,
                                                    Model: selectedModel,
                                                });

                                                return {
                                                    data: msg.data,
                                                    success: msg.success,
                                                };
                                            }}
                                        />
                                    ),
                                }}
                            /></>
                    ) : (
                        <div style={{textAlign: 'center'}}>
                        </div>
                    )}
                </Col>
            </Row>
        </GridContent>
    )
        ;
};

export default TaskDetailPage;
