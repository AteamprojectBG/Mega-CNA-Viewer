class ChartOption {
    constructor(tdTable, cnTable) {
        this.tdTable = tdTable
        this.cnTable = cnTable
        this.lineLength = this.cnTable.length;
        this.scatterBafData = cnTable.map((row, index) => [index, row.BAF]);
        this.scatterDrData = cnTable.map((row, index) => [index, row.DR]);
        this.bafLines = ChartOption.#generate_lines(ChartOption.#build_unique_baf(this.tdTable), this.lineLength);
        this.drLines = ChartOption.#generate_lines(ChartOption.#build_unique_dr(this.tdTable), this.lineLength, 1, 1);
    }

    static #build_unique_baf(tdTable) {
        const groupedBAF = Object.groupBy(tdTable, ({ BAF }) => BAF);
        const uniqueBAF = Object.keys(groupedBAF).map(item => {
            return {
                yValue: item,
                label: groupedBAF[item].map(row => `${row.minor}/${row.total}`).join(' '),
            };
        });

        return uniqueBAF;
    }

    static #build_unique_dr(tdTable) {
        const uniqueTotal = [...new Set(tdTable.map(row => row.total))];
        const uniqueDR = [...new Set(tdTable.map(row => row.DR))].map((item, index) => {
            return {
                yValue: item,
                label: uniqueTotal[index],
            };
        });

        return uniqueDR;
    }

    static #generate_lines(itemList, lineLength, xAxisIndex=0, yAxisIndex=0) {
        return itemList.map((item) => {
            return {
                type: 'line',
                tooltip: {
                    show: false,
                },
                xAxisIndex: xAxisIndex,
                yAxisIndex: yAxisIndex,
                symbol: 'none',
                lineStyle: {
                    color: '#888',
                    type: 'dashed',
                },
                endLabel: {
                    show: true,
                    formatter: () => item.label,
                },
                data: [
                    [0, item.yValue],
                    [lineLength, item.yValue],
                ],
            }
        });
    }

    get_option() {
        return {
            legend: {},
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    ype: 'cross'
                },
            },
            axisPointer: {
                link: { xAxisIndex: 'all' },
            },
            xAxis: [
                { gridIndex: 0 },
                { gridIndex: 1 }
            ],
            yAxis: [{ gridIndex: 0, max: 0.6 }, { gridIndex: 1 }],
            grid: [{ bottom: '55%' }, { top: '55%' }],
            dataZoom: [
                {
                    type: 'inside',
                    startValue: 0,
                    endValue: 10,
                    xAxisIndex: [0, 1],
                    filterMode: 'none',
                },
                {
                    startValue: 0,
                    endValue: 10,
                    xAxisIndex: [0, 1],
                    filterMode: 'none',
                }
            ],
            series: [
                {
                    type: 'scatter',
                    xAxisIndex: 0,
                    yAxisIndex: 0,
                    data: this.scatterBafData,
                },
                {
                    type: 'scatter',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    data: this.scatterDrData,
                },
                ...this.bafLines,
                ...this.drLines,
            ]
        }
    }
}

export default ChartOption