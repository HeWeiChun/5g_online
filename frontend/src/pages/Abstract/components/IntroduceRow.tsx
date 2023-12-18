import {TinyArea, TinyColumn, Progress} from '@ant-design/plots';
import {Col, Row} from 'antd';

import {ChartCard, Field} from '@/pages/OurCharts/components/Charts';
import styles from '../style.less';

const topColResponsiveProps = {
  xs: 24,
  sm: 12,
  md: 12,
  lg: 12,
  xl: 6,
  style: {marginBottom: 24},
};

const IntroduceRow = ({loading, introduceData}: { loading: boolean; introduceData: API_Abstract.introduce }) => {
  const today = new Date();
  const pastDates:string[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const dateString = date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    pastDates.push(dateString.split('/').join('-'));
  }

  const completedTaskByDate = pastDates.map(date => {
    const item = introduceData.completedTask.find(item => item.dateByDay === date);
    return item ? item.completeTaskByDay : 0;
  });
  const n2NormalByDate = pastDates.map(date => {
    const item = introduceData.n2Normal.find(item => item.dateByDay === date);
    return item ? item.n2NormalByDay : 0;
  });
  const n2AbNormalByDate = pastDates.map(date => {
    const item = introduceData.n2Abnormal.find(item => item.dateByDay === date);
    return item ? item.n2AbnormalByDay : 0;
  });
  const completedTaskSum = introduceData.completedTask.reduce((sum, value) => sum + value.completeTaskByDay, 0);
  const n2NormalSum = introduceData.n2Normal.reduce((sum, value) => sum + value.n2NormalByDay, 0);
  const n2AbNormalSum = introduceData.n2Abnormal.reduce((sum, value) => sum + value.n2AbnormalByDay, 0);

  const todayCompletedTask = introduceData.completedTask.find(item => item.dateByDay === pastDates[6]);
  const todayn2Abnormal = introduceData.n2Abnormal.find(item => item.dateByDay === pastDates[6]);
  const todayn2Normal = introduceData.n2Normal.find(item => item.dateByDay === pastDates[6]);
  return (
    <Row gutter={24}>
      {/*活跃任务*/}
      <Col {...topColResponsiveProps}>
        <ChartCard
          bordered={false}
          title="活跃任务"
          loading={loading}
          total={() => introduceData?.activeTask?.offline + introduceData?.activeTask?.online}
          footer={
            <div>
              离线任务: {introduceData?.activeTask?.offline}
            </div>
          }
          contentHeight={46}
        >
          <TinyColumn height={46} data={[introduceData?.activeTask?.online, introduceData?.activeTask?.offline]}/>
        </ChartCard>
      </Col>

      {/*已完成任务*/}
      <Col {...topColResponsiveProps}>
        <ChartCard
          bordered={false}
          loading={loading}
          title="已完成任务"
          total={() => completedTaskSum}
          footer={<Field label="今日完成任务数" value={todayCompletedTask?todayCompletedTask.completeTaskByDay:0}/>}
          contentHeight={46}
        >
          <TinyArea
            height={46}
            autoFit={false}
            smooth={false}
            data={completedTaskByDate}
          />
        </ChartCard>
      </Col>

      {/*N2口异常数*/}
      <Col {...topColResponsiveProps}>
        <ChartCard
          bordered={false}
          loading={loading}
          title="N2口异常数"
          color={'#E5EDFE'}
          total={() => n2AbNormalSum}
          footer={<Field label="今日异常数" value={todayn2Abnormal?todayn2Abnormal.n2AbnormalByDay:0}/>}
          contentHeight={46}
        >
          <TinyColumn height={46} data={n2AbNormalByDate}/>
        </ChartCard>
      </Col>

      {/*N2口正常数*/}
      <Col {...topColResponsiveProps}>
        <ChartCard
          loading={loading}
          bordered={false}
          title="N2口正常率"
          total={(n2NormalSum/(n2AbNormalSum+n2NormalSum)*100).toFixed(3)+'%'}
          footer={
            <div style={{whiteSpace: 'nowrap', overflow: 'hidden'}}>
              今日正常数
              <span className={styles.trendText}>{todayn2Normal?todayn2Normal.n2NormalByDay:0}</span>
            </div>
          }
          contentHeight={46}
        >
          <Progress
            height={46}
            percent={n2NormalSum/(n2AbNormalSum+n2NormalSum)}
            color="#13C2C2"
          />
        </ChartCard>
      </Col>
    </Row>
  );
};

export default IntroduceRow;
