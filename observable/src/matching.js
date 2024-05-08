// @ts-check

/**
 * @file Function to match data to theoretical distribution based on the euclidean distance between two points.
 */

/**
 * Returns the distance between two points having BAF and DR as coordinates.
 * @param {object} record - Input record.
 * @param {object} tdRecord - Theoretical distribution record.
 * @returns {number} - Distance between 2 points.
 */
function calculateDistance(record, tdRecord) {
    let dx = record['BAF'] - tdRecord['BAF'];
    let dy = record['DR'] - tdRecord['DR'];
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Mapping function. Returns the input record with the nearest match between the data and the theoretical distribution.
 * @param {object} record - Input record containting BAF and DR values.
 * @param {Array} theoreticalDistribution - Theoretical distribution of BAFs and DRs.
 * @returns {object} - Record with added total and minor values.
 */
function findMatch(record, theoreticalDistribution) {
    let minDistance = Infinity;
    let total = null;
    let minor = null;

    if(isNaN(record.BAF) && isNaN(record.DR)) {
        return {...record, total, minor};
    }
    
    for (let tdRecord of theoreticalDistribution) {
        let distance = null;
        if(record.BAF === null){
            distance = Math.abs(record.DR - tdRecord.DR);
        } else if(record.DR === null){
            distance = Math.abs(record.BAF - tdRecord.BAF);
        } else {
            distance = calculateDistance(record, tdRecord);
        }
        if (distance < minDistance) {
            minDistance = distance;
            total = record.DR === null ? null : tdRecord.total;
            minor = record.BAF === null ? null : tdRecord.minor;
        }
    }

    return {...record, total, minor};
}

export default findMatch;