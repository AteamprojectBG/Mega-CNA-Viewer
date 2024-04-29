/** Class creates a chart options object. */
class ChartOption {
    /**
     * 
     * @param {Array} tdTable - Theoretical distribution
     * @param {Array} dataTable - Loaded data
     */
    constructor(tdTable, dataTable) {
        this.tdTable = tdTable
        this.dataTable = dataTable
        this.lineLength = ChartOption.#get_line_length(this.dataTable.length);
        this.scatterBafData = dataTable.map((row, index) => [index, row.BAF]);
        this.scatterDrData = dataTable.map((row, index) => [index, row.DR]);
        this.bafLines = ChartOption.#generate_lines(ChartOption.#build_unique_baf(this.tdTable), this.lineLength);
        this.drLines = ChartOption.#generate_lines(ChartOption.#build_unique_dr(this.tdTable), this.lineLength, 1, 1);
    }

    /**
     * Returns list of BAF y axis positions and labels for line generation
     * @param {Array} tdTable - Theoretical distribution
     * @return {Array} - List of BAF y axis positions and labels
     */
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

    /**
     * Returns list of DR y axis positions and labels for line generation
     * @param {Array} tdTable - Theoretical distribution
     * @return {Array} - List of DR y axis positions and labels
     */
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

    /**
     * Returns list of line series
     * @param {Array} itemList - List of y axis positions and labels
     * @param {number} lineLength - Length of the line
     * @param {number} xAxisIndex - Grid x index
     * @param {number} yAxisIndex - Grid y index
     * @returns {Array} - List of line series
     */
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

    /**
     * Returns adjusted length for better x axis splitting
     * @param {number} length - Default length of loaded data
     * @returns {number} - Adjusted length
     */
    static #get_line_length(length) {
        if (length < 10) {
            return 10;
        }

        return length % 10 ? Math.ceil(length / 10) * 10 : length;
    }

    /**
     * Returns generated chart option
     * @returns {Object} - Chart option
     */
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
                { gridIndex: 0, maxInterval: this.lineLength / 10 },
                { gridIndex: 1, maxInterval: this.lineLength / 10 }
            ],
            yAxis: [{ gridIndex: 0, max: 0.6 }, { gridIndex: 1 }],
            grid: [{ bottom: '55%' }, { top: '55%' }],
            dataZoom: [
                {
                    type: 'inside',
                    startValue: 0,
                    endValue: this.lineLength / 10,
                    xAxisIndex: [0, 1],
                    filterMode: 'none',
                },
                {
                    startValue: 0,
                    endValue: this.lineLength / 10,
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