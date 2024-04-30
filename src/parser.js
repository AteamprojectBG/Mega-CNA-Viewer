export function parseForm(form_data) {
    // Validate input
    if (!form_data || typeof form_data !== 'object') {
        throw new Error('Invalid form data');
    }

    // Parse purity and ploidy
    let purity = parseFloat(form_data.purity);
    let ploidy = parseFloat(form_data.ploidy);
    let normalPloidy = parseInt(form_data.normal_ploidy);

    if (isNaN(purity) || isNaN(ploidy) || isNaN(normalPloidy)) {
        throw new Error('Invalid numeic data');
    }

    // Parse copy_numbers
    let copy_numbers = form_data.copy_numbers.split(',')
                          .map(num => parseFloat(num.trim()))
                          .filter(num => !isNaN(num));

    if (copy_numbers.length === 0) {
        throw new Error('No valid copy numbers found');
    }

    return [purity, ploidy, copy_numbers, normalPloidy];
}

export function parseData(data){
    return data.map((row, idx) => {
      if(row.chr.len < 4) {
        throw new Error(`Wrong chr record at row ${idx}`);
      }
  
      const pos = parseInt(row.pos)
      const BAF = parseFloat(row.BAF)
      const DR = parseFloat(row.DR)
  
      if(isNaN(pos) || isNaN(BAF) || isNaN(DR)){
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