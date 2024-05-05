// @ts-check

/**
 * @file Class representing a matcher object to match data to theoretical distribution.
 */

/** Class representing a matcher object to match data to theoretical distribution. */
class Matcher {
    /**
     * Creates a matcher object for a given theoretical distribution.
     * @param {[object]} theoreticalDistribution - Array of theoretical distribution.
     * @param {number} thresholdStep - Threshold step for a matcher
     */
    constructor(theoreticalDistribution, thresholdStep = 0.01) {
        this.theoreticalDistribution = theoreticalDistribution;
        this.thresholdStep = thresholdStep;
    }

    /**
     * Mapping function. Returns the input record with closest match between the data and the theoretical distribution.
     * @param {object} record - Input record containting BAF and DR values.
     * @returns {object} - Record with added total and minor values.
     */
    findMatch(record) {
        let total = null;
        let minor = null;
        let BAF = record["BAF"];
        let DR = record["DR"];
        let currentThreshold = 0.0;

        while (!total) {
            for (let tdRecord of this.theoreticalDistribution) {
                let tdBAF = tdRecord["BAF"];
                let tdDR = tdRecord["DR"];

                if (Math.abs(BAF - tdBAF) <= currentThreshold && Math.abs(DR - tdDR) <= currentThreshold) {
                    total = parseInt(tdRecord["total"]);
                    minor = parseInt(tdRecord["minor"]);
                    break;
                }
            }
            currentThreshold += this.thresholdStep;
        }

        return {...record, total, minor};
    }
}

export default Matcher;