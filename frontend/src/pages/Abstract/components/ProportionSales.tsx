import {Card} from 'antd';
import numeral from 'numeral';
import type {RadioChangeEvent} from 'antd/es/radio';
import {Pie, measureTextWidth} from '@ant-design/plots';
import React from 'react';
import styles from '../style.less';

const ProportionSales = (
    {
        loading,
        salesPieData,
    }: {
        loading: boolean;
        salesType: 'all' | 'online' | 'offline';
        salesPieData: API_Abstract.abnormalFlowBinary;
        handleChangeSalesType?: (e: RadioChangeEvent) => void;
    }) => {
    const cardConfig = {
        loading: loading,
        className: styles.salesCard,
        bordered: false,
        title: "异常流量类别占比",
        style: {
            height: '100%',
        },
    }
    const sum = salesPieData.reduce((accumulator, item) => accumulator + item.y, 0);

    function renderStatistic(containerWidth, text, style) {
        const {width: textWidth, height: textHeight} = measureTextWidth(text, style);
        const R = containerWidth / 2; // r^2 = (w / 2)^2 + (h - offsetY)^2

        let scale = 1;

        if (containerWidth < textWidth) {
            scale = Math.min(Math.sqrt(Math.abs(Math.pow(R, 2) / (Math.pow(textWidth / 2, 2) + Math.pow(textHeight, 2)))), 1);
        }

        const textStyleStr = `width:${containerWidth}px;`;
        return `<div style="${textStyleStr};font-size:${scale}em;line-height:${scale < 1 ? 1 : 'inherit'};">${text}</div>`;
    }

    const pieconfig = {
        height: 350,
        radius: 0.8,
        innerRadius: 0.6,
        angleField: "y",
        colorField: "x",
        data: salesPieData as any,
        legend: {
            // layout: 'horizontal',
            position: 'right'
        },
        label: {
            formatter: (text, item) => {
                return `${item._origin.x}: ${numeral(item._origin.y).format('0,0')}`;
            },
        },
        statistic: {
            title: {
                offsetY: -4,
                customHtml: (container, view, datum) => {
                    const {width, height} = container.getBoundingClientRect();
                    const d = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2));
                    const text = datum ? datum.type : '总计';
                    return renderStatistic(d, text, {
                        fontSize: 28,
                    });
                },
            },
            content: {
                offsetY: 4,
                style: {
                    fontSize: '20px',
                },
                customHtml: (container, view, datum, data) => {
                    const {width} = container.getBoundingClientRect();
                    const text = `${numeral(sum).format('0,0')}`;
                    return renderStatistic(width, text, {
                        fontSize: 20,
                    });
                },
            }
        }
    }
    return <Card
        {...cardConfig}
    >
        <div>
            <Pie {...pieconfig} />
        </div>

    </Card>
};

export default ProportionSales;
