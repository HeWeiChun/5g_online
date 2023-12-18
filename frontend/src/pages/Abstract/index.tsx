import React, {Suspense, useEffect, useState} from 'react';
import {Col, Row} from 'antd';
import {GridContent} from '@ant-design/pro-components';
import type {RadioChangeEvent} from 'antd/es/radio';

import IntroduceRow from './components/IntroduceRow';
import TopSearch from './components/TopSearch';
import ProportionSales from './components/ProportionSales';

import {abstractData} from './service';
import PageLoading from '@/pages/OurCharts/components/PageLoading';

type SalesType = 'all' | 'offline' | 'online';


const Analysis: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [salesType, setSalesType] = useState<SalesType>('all');
  const [abstractValue, setAbstractValue] = useState<API_Abstract.abstract>({
    abnormalEvent: [],
    abnormalFlowBinary: {abnormal: 0, normal: 0},
    abnormalFlowMulti: {abnormal: 0, normal: 0},
    introduce: {
      activeTask: {online: 0, offline: 0},
      completedTask: [],
      n2Abnormal: [],
      n2Normal: [],}
  });
  const [salesPieData, setSalesPieData] = useState<any>([]);

  useEffect(() => {
    const fetchData = async () => {
      const msg = await abstractData();
      setAbstractValue(msg.data);
      setSalesPieData([
        {
          x: '正常流量',
          y: msg.data?.abnormalFlowBinary?.normal,
        },
        {
          x: '异常流量',
          y: msg.data?.abnormalFlowBinary?.abnormal,
        },
      ]);
    };
    setLoading(false);
    fetchData();
  },[]);

  // useEffect(() => {
  //   window.location.reload();
  // },[JSON.stringify(abstractValue)])

  const handleChangeSalesType = (e: RadioChangeEvent) => {
    setSalesType(e.target.value);
  };
  // 等待数据加载完成后再渲染页面
  if (loading) {
    return <PageLoading />;
  }
  else {
    return (
      <GridContent>
        <>

        {abstractValue.introduce &&
          <Suspense fallback={<PageLoading />}>
            <IntroduceRow loading={false} introduceData={abstractValue.introduce} />
          </Suspense>
        }


          <Row
            gutter={24}
            style={{
              marginTop: 24,
            }}
          >
            {/*异常流量类别占比!*/}
            <Col xl={12} lg={24} md={24} sm={24} xs={24}>
              <Suspense fallback={null}>
                <ProportionSales
                  salesType={salesType}
                  loading={loading}
                  salesPieData={salesPieData}
                  handleChangeSalesType={handleChangeSalesType}
                />
              </Suspense>
            </Col>

            {/*异常事件*/}
            <Col xl={12} lg={24} md={24} sm={24} xs={24}>
              <Suspense fallback={null}>
                <TopSearch
                  loading={loading}
                  abnormalEvent={abstractValue.abnormalEvent}
                />
              </Suspense>
            </Col>
          </Row>
        </>
      </GridContent>
    );
  }
};

export default Analysis;
