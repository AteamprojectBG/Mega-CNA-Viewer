// @ts-check

/**
 * @file Parser functions for Mega-CNA-Viewer.
 */

/**
 * Parses web form data, validates it and returns them as array.
 * @param {object} formData - Web form data.
 * @returns {(Array)} Parsed purity, ploidy, copy_numbers, normalPloidy.
 * @throws {Error} Invalid form data.
 */
export function parseForm(formData) {
    // Validate input
    if (!formData || typeof formData !== 'object') {
        throw new Error('Invalid form data');
    }

    // Parse purity and ploidy
    let purity = parseFloat(formData.purity);
    let ploidy = parseFloat(formData.ploidy);
    let normalPloidy = parseInt(formData.normal_ploidy);

    if (isNaN(purity) || isNaN(ploidy) || isNaN(normalPloidy)) {
        throw new Error('Invalid numeic data');
    }

    // Parse copy_numbers
    let copyNumbers = formData.copy_numbers.split(',')
                        .map(num => parseFloat(num.trim()))
                        .filter(num => !isNaN(num));

    if (copyNumbers.length === 0) {
        throw new Error('No valid copy numbers found');
    }
    return [purity, ploidy, copyNumbers, normalPloidy];

}

/**
 * Parses data from CSV file array casting correct types.
 * @param {Array} data - CSV data array.
 * @returns {Array} Array of objects with correct types.
 * @throws {Error} Invalid file data.
 */
export function parseData(data){
    return data.map((row, idx) => {
        if(row.chr.len < 4) {
            throw new Error(`Wrong chr record at row ${idx}`);
        }

        const pos = parseInt(row.pos)
        const BAF = parseFloat(row.BAF)
        const DR = parseFloat(row.DR)
    
        if(isNaN(pos)){ //|| isNaN(BAF) || isNaN(DR)
            console.log(row)
            throw new Error(`Invalid numeric data at row ${idx}`);
        }
    
        return {
            chr: row.chr,
            pos,
            BAF,
            DR
        }
    })
  }
