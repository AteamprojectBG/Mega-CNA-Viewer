/**
 * @file Chart options object class.
 */

/** Class creates a chart options object. */
class ChartOption {
    /**
     * Chart options object constructor.
     * @param {Array} tdTable - Theoretical distribution.
     * @param {Array} dataTable - Loaded data.
     */
    constructor(tdTable, dataTable) {
        this.tdTable = tdTable
        this.dataTable = dataTable
        this.scatterBafData = dataTable.map((row, index) => [index, row.BAF]);
        this.scatterDrData = dataTable.map((row, index) => [index, row.DR]);
        this.bafLines = this.#generateLines(this.#buildUniqueBaf(this.tdTable));
        this.drLines = this.#generateLines(this.#buildUniqueDr(this.tdTable));
    }

    /**
     * Returns list of BAF y axis positions and labels for line generation.
     * @returns {Array} - List of BAF y axis positions and labels.
     */
    #buildUniqueBaf() {
        const groupedBAF = Object.groupBy(this.tdTable, ({ BAF }) => BAF);
        const uniqueBAF = Object.keys(groupedBAF).map(item => {
            return {
                yValue: item,
                label: groupedBAF[item].map(row => `${row.minor}/${row.total}`).join(' '),
            };
        });

        return uniqueBAF;
    }

    /**
     * Returns list of DR y axis positions and labels for line generation.
     * @returns {Array} - List of DR y axis positions and labels.
     */
    #buildUniqueDr() {
        const uniqueTotal = [...new Set(this.tdTable.map(row => row.total))];
        const uniqueDR = [...new Set(this.tdTable.map(row => row.DR))].map((item, index) => {
            return {
                yValue: item,
                label: uniqueTotal[index],
            };
        });

        return uniqueDR;
    }

    /**
     * Returns markLine object.
     * @param {Array} itemList - List of y axis positions and labels.
     * @returns {Object} - Object of horizontal and vertical lines.
     */
    #generateLines(itemList) {
        const horizontalLines = itemList.map((item, index) => {
            return {
                yAxis: item.yValue,
                name: index,
                label: {
                    show: false,
                },
                emphasis: {
                    disabled: false,
                },
            };
        });

        const chromosomes = [...new Set(this.dataTable.map(row => row.chr))];

        const verticalLines = chromosomes.map((chr, index) => {
            const xValue = this.dataTable.findLastIndex(item => item.chr === chr);
            return {
                xAxis: xValue,
                name: index,
                label: {
                    show: true,
                },
            };
        })

        return {
            markLine: {
                data: [...verticalLines, ...horizontalLines],
                symbol: 'none',
                label: {
                    position: 'end',
                    formatter: (params) => {
                        if (params.data.yAxis) {
                            return itemList[params.name].label;
                        }

                        return `${chromosomes[params.name]}`;
                    }
                }
            },
        }
    }

    /**
     * Returns generated chart option.
     * @returns {object} - Chart option.
     */
    getOption() {
        return {
            legend: {},
            brush: {
                toolbox: ['lineX'],
                type: 'lineX',
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                },
                formatter: (params) => {
                    const series = params.map(item => {
                        return `<div>
                        <div style="
                            display: inline-block;
                            width: 10px;
                            height: 10px;
                            border-radius: 50%;
                            background-color: ${item.color}">
                        </div> ${(+item.data[1]).toFixed(5)}</div>`
                    }).join('');

                    const currentRow = this.dataTable[params[0].dataIndex];

                    return `<div>${currentRow.chr}:${currentRow.pos}</div>${series}`;
                },
            },
            axisPointer: {
                link: { xAxisIndex: 'all' },
            },
            xAxis: [
                {
                    type: 'value',
                    gridIndex: 0,
                    axisLabel: {
                        show: false,
                    },
                    axisTick: {
                        show: false,
                    },
                },
                {
                    type: 'value',
                    gridIndex: 1,
                    axisLabel: {
                        show: false,
                    },
                    axisTick: {
                        show: false,
                    },
                }
            ],
            yAxis: [{ gridIndex: 0, max: 0.6 }, { gridIndex: 1 }],
            grid: [{ bottom: '55%' }, { top: '55%' }],
            dataZoom: [
                {
                    type: 'inside',
                    startValue: 0,
                    endValue: this.dataTable.length,
                    xAxisIndex: [0, 1],
                    filterMode: 'none',
                },
                {
                    startValue: 0,
                    endValue: this.dataTable.length,
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
                    ...this.bafLines,
                },
                {
                    type: 'scatter',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    data: this.scatterDrData,
                    ...this.drLines,
                },
            ],
        }
    }
}

export default ChartOption;