// @ts-check

/**
 * @file Class representing a table of DR and BAF theoretical distribution based on given purity, ploidy, normal ploidy and copy numbers.
 */

/** Class representing a table of DR and BAF theoretical distribution. */
class CNATable {
    /**
     * Create a table of DR and BAF theoretical distribution.
     * @param {number} purity - Fraction of tumor DNA in the sample.
     * @param {number} ploidy - Number of sets of chromosomes.
     * @param {number[]} copy_numbers - List of numbers of copies.
     * @param {number} normal_ploidy - Number of sets of chromosomes in the normal sample.
     */
    constructor(purity=1, ploidy=2, copy_numbers=[2,3,4], normal_ploidy = 2) {
        this.purity = purity;
        this.ploidy = ploidy;
        this.copy_numbers = copy_numbers;
        this.normal_ploidy = normal_ploidy;
        this.table = CNATable.#buildCNTable(purity, ploidy, copy_numbers, normal_ploidy)
    }

    /**
     * Returns the frequency of B allele based on number of B alleles, purity and total number of copies of the region.
     * @param {number} minor - Number of B alleles.
     * @param {number} purity - Fraction of tumor DNA in the sample.
     * @param {number} total - Total number of copies of the region.
     * @param {number} normal_ploidy - Number of sets of chromosomes in the normal sample.
     * @returns {number} Frequency of B allele.
     * @static
     * @private
     */
    static #getBAlleleFrequency(minor, purity, total, normal_ploidy){
        const baf = ((minor * purity) + (1 - purity)) / (
            (total * purity) + normal_ploidy * (1 - purity)
        )
        return baf
    }

    /**
     * Returns the ratio of tumor coverage to normal coverage based on purity, ploidy and total number of copies of the region.
     * @param {number} purity - Fraction of tumor DNA in the sample.
     * @param {number} ploidy - Number of sets of chromosomes.
     * @param {number} total - Total number of copies of the region.
     * @param {number} normal_ploidy - Number of sets of chromosomes in the normal sample.
     * @returns {number} Ratio of tumor coverage to normal coverage.
     * @static
     * @private
     */
    static #getDepthRatio(purity, ploidy, total, normal_ploidy){
        const depth_ratio = ((1 - purity) + ((total / normal_ploidy) * purity)) / (
            (ploidy / normal_ploidy * purity) + 1 - purity
        )
        return depth_ratio
    }

    /**
     * Returns the max value for a range of possible b numbers.
     * @param {number} total - Total number of copies of the region.
     * @returns {number} Max value for a range of possible b numbers.
     * @static
     * @private
     */
    static #getMaxBNum(total){
        return total % 2 ? Math.ceil(total / 2) : Math.floor(total / 2 + 1)
    }

    /**
     * Returns a dictionary with lists of BAF, DR, total and minor.
     * @param {number} purity - Fraction of tumor DNA in the sample.
     * @param {number} ploidy - Number of sets of chromosomes.
     * @param {number[]} copy_numbers - List of numbers of copies.
     * @param {number} [normal_ploidy=2] - Number of sets of chromosomes in the normal sample.
     * @returns {object} Object with lists of BAF, DR, total and minor.
     * @static
     * @private
     */
    static #buildCNTable(purity, ploidy, copy_numbers, normal_ploidy = 2){
        const table = []

        copy_numbers.forEach(cn => {
            Array(CNATable.#getMaxBNum(cn)).fill(0).map((_, b_num) => {
                const baf = CNATable.#getBAlleleFrequency(b_num, purity, cn, normal_ploidy)
                const dr = CNATable.#getDepthRatio(purity, ploidy, cn, normal_ploidy)
                table.push({
                    'BAF': baf,
                    'DR': dr,
                    'total': cn,
                    'minor': b_num,
                })
            })
        });

        return table
    }
}

export default CNATable
