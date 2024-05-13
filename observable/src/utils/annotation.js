// @ts-check

/**
 * @file User data annotation function.
 */

/**
 * Mutates input data adding "geneName" property.
 * @param {object[]} data - Array of records.
 * @param {Array[]} annotation - Genome annotation.
 */
function annotateChromosome(data, annotation) {
    const startPoints = annotation.map(ann => ann[1]);

    for (const record of data) {
        const pos = record.pos;
        const index = startPoints.findLastIndex(start => start <= pos);
        if (index > 0 && pos <= annotation[index][2]) {
            record.geneName = (annotation[index][3]);
        } else {
            record.geneName = null;
        }
    }
}

/**
 * Mutates input data adding "geneName" property chromosome by chromosome.
 * @param {object[]} data - Array of records.
 * @param {Array[]} annotation - Genome annotation.
 */
function annotate(data, annotation) {
    const dataByChr = Object.groupBy(data, d => d.chr);
    const annotationByChr = Object.groupBy(annotation, ann => ann[0]);

    Object.keys(dataByChr).forEach(chr => {
        const chrData = dataByChr[chr];
        const chrAnnotation = annotationByChr[chr];
        annotateChromosome(chrData, chrAnnotation);
    });
}

export default annotate;