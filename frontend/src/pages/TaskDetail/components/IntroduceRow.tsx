import {Progress} from '@ant-design/plots';
import {Col, Row} from 'antd';

import {ChartCard, Field} from '../../OurCharts/components/Charts';
import styles from '../style.less';

const topColResponsiveProps = {
  xs: 24,
  sm: 12,
  md: 12,
  lg: 12,
  xl: 6,
  style: {marginBottom: 24},
};

const IntroduceRow = ({loading, introduceData}: { loading: boolean; introduceData: API_Detail.abstract }) => {
  const normal = introduceData.abnormalFlowBinary.normal;
  const abnormal = introduceData.abnormalFlowBinary.abnormal;
  const activeDetectedFlows = introduceData.activeDetectedFlows;
  const activePendingFlows = introduceData.activePendingFlows;
  return (
    <Row gutter={24}>
      {/*已检测*/}
      <Col {...topColResponsiveProps}>
        <ChartCard
          bordered={false}
          loading={loading}
          title="检测进度"
          total={activeDetectedFlows/(activeDetectedFlows+activePendingFlows) * 100 + '%' }
          footer={<Field label="已完成检测" value={activeDetectedFlows}/>}
          contentHeight={46}
        >
          <Progress
            height={46}
            percent={activeDetectedFlows/(activeDetectedFlows+activePendingFlows)}
            color="#13C2C2"
          />
        </ChartCard>
      </Col>

      {/*异常率*/}
      <Col {...topColResponsiveProps}>
        <ChartCard
          loading={loading}
          bordered={false}
          title="检测异常率"
          total={(abnormal/(abnormal+normal) * 100).toFixed(3)+'%'}
          footer={
            <div style={{whiteSpace: 'nowrap', overflow: 'hidden'}}>
              异常数
              <span className={styles.trendText}>{abnormal}</span>
            </div>
          }
          contentHeight={46}
        >
          <Progress
            height={46}
            percent={abnormal/(abnormal+normal)}
            color="#13C2C2"
          />
        </ChartCard>
      </Col>
    </Row>
  );
};

export default IntroduceRow;
