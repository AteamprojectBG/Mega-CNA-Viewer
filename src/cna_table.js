/** Class representing a table of DR and BAF theoretical distribution. */
class CNATable {
    /**
     * Create a table of DR and BAF theoretical distribution.
     * @param {number} purity - Fraction of tumor DNA in the sample
     * @param {number} ploidy - Number of sets of chromosomes
     * @param {Array} copies - List of numbers of copies
     * @return {Object} Object with lists of BAF, DR, total and minor
     */
    constructor(purity, ploidy, copies) {
        this.purity = purity;
        this.ploidy = ploidy;
        this.copies = copies;
        this.table = CNATable.#build_cn_table(purity, ploidy, copies)
    }

    /**
     * Returns the frequency of B allele based on number of B alleles, purity and total number of copies of the region.
     * @param {number} minor - Number of B alleles
     * @param {number} purity - Fraction of tumor DNA in the sample
     * @param {number} total - Total number of copies of the region
     * @return {number} Frequency of B allele
     */
    static #get_b_allele_frequency(minor, purity, total){
        const baf = ((minor * purity) + (1 - purity)) / (
            (total * purity) + 2 * (1 - purity)
        )
        return baf
    }

    /**
     * Returns the ratio of tumor coverage to normal coverage based on purity, ploidy and total number of copies of the region.
     * @param {number} purity - Fraction of tumor DNA in the sample
     * @param {number} ploidy - Number of sets of chromosomes
     * @param {number} total - Total number of copies of the region
     * @return {number} Ratio of tumor coverage to normal coverage
     */
    static #get_depth_ratio(purity, ploidy, total){
        const depth_ratio = ((1 - purity) + ((total / 2) * purity)) / (
            (ploidy / 2 * purity) + 1 - purity
        )
        return depth_ratio
    }

    /**
     * Returns the max value for a range of possible b numbers.
     * @param {number} total - Total number of copies of the region
     * @return {number} Max value for a range of possible b numbers
     */

    static #get_max_b_num(total){
        return total % 2 ? Math.ceil(total / 2) : Math.floor(total / 2 + 1)
    }

    /**
     * Returns a dictionary with lists of BAF, DR, total and minor.
     * @param {number} purity - Fraction of tumor DNA in the sample
     * @param {number} ploidy - Number of sets of chromosomes
     * @param {number} copy_numbers - List of numbers of copies
     * @return {Object} Object with lists of BAF, DR, total and minor
     */
    static #build_cn_table(purity, ploidy, copy_numbers){
        const table = {"BAF": [], "DR": [], "total": [], "minor": []}

        copy_numbers.forEach(cn => {
            Array(CNATable.#get_max_b_num(cn)).fill(0).map((_, b_num) => {
                const baf = CNATable.#get_b_allele_frequency(b_num, purity, cn)
                const dr = CNATable.#get_depth_ratio(purity, ploidy, cn)
                table["BAF"].push(baf)
                table["DR"].push(dr)
                table["total"].push(cn)
                table["minor"].push(b_num)
            })
        });

        return table
    }
}

export default CNATable
