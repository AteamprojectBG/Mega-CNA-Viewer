async function getAnnotations() {
    let data = await fetch('https://drive.google.com/uc?id=1bCt2DyrMoIgFIfKzv12CB2X9iTtUoFD0');
    let text = await data.text();
    return text;
}

const annotations = await getAnnotations();

process.stdout.write(annotations);