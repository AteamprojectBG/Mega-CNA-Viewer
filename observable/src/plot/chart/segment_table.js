/**
 * @file Segment table class.
 */

import { TabulatorFull as Tabulator}  from 'tabulator-tables';
import findMatch from '../../utils/matching.js';

/** Class creates a selected segment table with statistics. */
class SegmentTable {
    #segmentPositions = {
        start: null,
        end: null,
    };

    #rowData = {
        chr: null,
        posStart: null,
        posEnd: null,
        bafMean: null,
        bafMedian: null,
        bafStd: null,
        bafCount: null,
        drMean: null,
        drMedian: null,
        drStd: null,
        drCount: null,
        total: null,
        minor: null,
    };

    /**
     * Segment table constructor.
     * @param {string} tableId - Table id.
     * @param {Object} chart - Chart object.
     * @param {Array} dataTable - Loaded data.
     * @param {Array} segmentTableData - Previously selected data.
     */
    constructor(tableId, chart, tdTable, dataTable, segmentTableData) {
        this.tableId = tableId;
        this.chart = chart;
        this.segmentTableData = segmentTableData;
        this.table = this.#createTable();
        
        chart.on('brushselected', (params) => {
            const selectedPosArray = params.batch[0].selected[0].dataIndex;
            this.#segmentPositions.start = selectedPosArray[0];
            this.#segmentPositions.end = selectedPosArray.pop();
        });

        chart.on('brushEnd', () => {
            if (!this.#segmentPositions.start || !this.#segmentPositions.end) {
                return;
            }

            if (dataTable[this.#segmentPositions.start].chr != dataTable[this.#segmentPositions.end].chr) {
                return;
            }

            this.#rowData.chr = dataTable[this.#segmentPositions.start].chr;
            this.#rowData.posStart = +dataTable[this.#segmentPositions.start].pos;
            this.#rowData.posEnd = +dataTable[this.#segmentPositions.end].pos;
            const segmentData = dataTable.slice(this.#segmentPositions.start, this.#segmentPositions.end);
            const bafData = segmentData.map(item => +item.BAF);
            const drData = segmentData.map(item => +item.DR);

            this.#rowData.bafMean = this.#calculateMean(bafData);
            this.#rowData.bafMedian = this.#calculateMedian(bafData);
            this.#rowData.bafStd = this.#calculateStd(bafData, 'bafMean');
            this.#rowData.bafCount = bafData.length;
            this.#rowData.drMean = this.#calculateMean(drData);
            this.#rowData.drMedian = this.#calculateMedian(drData);
            this.#rowData.drStd = this.#calculateStd(drData, 'drMean');
            this.#rowData.drCount = bafData.length;

            const closestMatch = findMatch({ BAF: this.#rowData.bafMean, DR: this.#rowData.drMean }, tdTable);
            this.#rowData.total = closestMatch.total;
            this.#rowData.minor = closestMatch.minor;

            this.segmentTableData.push({ ...this.#rowData });
            this.table.addRow({ ...this.#rowData });
        });
    }

    /**
     * Creats Tabulator table instance.
     * @returns - Tabulator table instance.
     */
    #createTable = () => {
        return new Tabulator(`#${this.tableId}`, {
            layout:'fitDataTable',
            maxHeight: '400px',
            data: this.segmentTableData,
            columns:[
                { title: 'Chr', field: 'chr', },
                { title: 'Start', field: 'posStart' },
                { title: 'End', field: 'posEnd' },
                { title: 'BAF mean', field: 'bafMean' },
                { title: 'BAF median', field: 'bafMedian' },
                { title: 'BAF std', field: 'bafStd' },
                { title: 'BAF count', field: 'bafCount' },
                { title: 'DR mean', field: 'drMean' },
                { title: 'DR median', field: 'drMedian' },
                { title: 'DR std', field: 'drStd' },
                { title: 'DR count', field: 'drCount' },
                { title: 'Total', field: 'total' },
                { title: 'Minor', field: 'minor' },
                {
                    formatter: 'buttonCross',
                    width: 20,
                    hozAlign: 'center',
                    cellClick: (e, cell) => {
                        cell.getRow().delete();
                    },
                    headerSort: false,
                    frozen: true,
                }
            ],
        });
    };

    /**
     * Calculates the mean.
     * @param {number[]} data - Numerical array.
     * @returns - The mean.
     */
    #calculateMean = (data) => {
        const mean = data.reduce((acc, cur) => acc + cur, 0) / data.length;
        return mean.toFixed(3);
    };

    /**
     * Calculates the median.
     * @param {number[]} data - Numerical array.
     * @returns - The median.
     */
    #calculateMedian = (data) => {
        const sortedData = [...data].toSorted((a, b) => a - b);
        const mid = Math.floor(sortedData.length / 2);
        const median = sortedData.length % 2 ? sortedData[mid] : ((sortedData[mid - 1] + sortedData[mid]) / 2);
        return median.toFixed(3);
    };

    /**
     * Calculates the standard deviation.
     * @param {number[]} data - Numerical array.
     * @param {string} key - Segment type key.
     * @returns - The standard deviation.
     */
    #calculateStd = (data, key) => {
        const mean = this.#rowData[key];
        const std = Math.sqrt(data.map(x => (x - mean) ** 2).reduce((a, b) => a + b) / data.length);
        return std.toFixed(3);
    };

    /**
     * Turns off chart events.
     */
    turnOffEvents = () => {
        this.chart.off('brushselected');
        this.chart.off('brushEnd');
    };
}

export default SegmentTable;