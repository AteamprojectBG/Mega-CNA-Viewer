// @ts-check

/**
 * @file Parser functions for Mega-CNA-Viewer.
 */

/**
 * Parses web form data, validates it and returns them as array.
 * @param {object} formData - Web form data.
 * @returns {Array} Parsed purity, ploidy, copy_numbers, normalPloidy.
 * @throws {Error} Invalid form data.
 */
export function parseForm(formData) {
    // Validate input
    if (!formData || typeof formData !== 'object') {
        throw new Error('Invalid form data');
    }

    // Parse purity and ploidy
    let purity = parseFloat(formData.purity);
    let tumorPloidy = parseFloat(formData.tumorPloidy);
    let normalPloidy = parseInt(formData.normalPloidy);

    if (isNaN(purity) || isNaN(tumorPloidy) || isNaN(normalPloidy)) {
        throw new Error('Invalid numeric data');
    }

    // Parse copy_numbers
    let copyNumbers = formData.copyNumbers.split(',')
                        .map(num => parseFloat(num.trim()))
                        .filter(num => !isNaN(num));

    if (copyNumbers.length === 0) {
        throw new Error('No valid copy numbers found');
    }
    return [purity, tumorPloidy, copyNumbers, normalPloidy];

}

/**
 * Parses data from CSV file array casting correct types.
 * @param {Array} data - CSV data array.
 * @returns {Array} Array of objects with correct types.
 * @throws {Error} Invalid file data.
 */
export function parseData(data){
    return data.map((row, idx) => {
        if(row.chr.length < 4) {
            throw new Error(`Wrong chr record at row ${idx}`);
        }

        let pos = null
        let label = null
        if(Object.hasOwn(row, 'pos')) {
            pos = parseInt(row.pos) 
        } else if(Object.hasOwn(row, 'start') && Object.hasOwn(row, 'end')) {
            let start = parseInt(row.start)
            let end = parseInt(row.end)
            pos = start + ((end - start) / 2)
            label = `${row.chr}:${start}-${end}`
        }

        const BAF = isNaN(parseFloat(row.BAF)) ? null : parseFloat(row.BAF)
        const DR = isNaN(parseFloat(row.DR)) ? null : parseFloat(row.DR)
    
        if(isNaN(pos)){ //|| isNaN(BAF) || isNaN(DR)
            console.log(row)
            throw new Error(`Invalid numeric data at row ${idx}`);
        }
    
        return {
            chr: row.chr,
            pos,
            BAF,
            DR,
            label
        }
    })
  }
