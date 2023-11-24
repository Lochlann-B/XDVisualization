
// numDimensions - total number of dimensions in dataset including those of output points
// output point must be the last in each group of flattenedPoints
function visualiseHigherDimensionalDataset(flattenedPoints, numDimensions, activeAxisIdxs) {
    // Project points along all dimensions other than those specified by activeAxisIdxs
    let projectedPoints = [];
    if(activeAxisIdxs.length > 2) { console.error("Attempt to render too many dimensions!"); }

    for(let i = 0; i < flattenedPoints.length/numDimensions; i += numDimensions) {
        currentVertex = [];
        for (let j = 0; j < numDimensions; j++) {
            currentVertex.push(flattenedPoints[i+j]);
        }
        let outputPoint = currentVertex.slice(-1);

        for (let k of activeAxisIdxs) {
            let point = currentVertex[k];
            currentVertex.forEach((p, idx) => {
                if (p !== outputPoint && !(idx in activeAxisIdxs)) {
                    point /= p;
                }
            });
            projectedPoints.push(point);
        }
        currentVertex.forEach((p, idx) => {
            if (p !== outputPoint && !(idx in activeAxisIdxs)) {
                outputPoint /= p;
            }});
            projectedPoints.push(outputPoint);
    }
    
    return {positions: [], texCoords: [], singularPoints: projectedPoints }
}

export {visualiseHigherDimensionalDataset} ;