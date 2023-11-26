
// numDimensions - total number of dimensions in dataset including those of output points
// output point must be the last in each group of flattenedPoints
function visualiseHigherDimensionalDataset(flattenedPoints, numDimensions, activeAxisIdxs) {
    // Project points along all dimensions other than those specified by activeAxisIdxs
    let projectedPoints = [];
    if(activeAxisIdxs.length > 2) { console.error("Attempt to render too many dimensions!"); }

    for(let i = 0; i < flattenedPoints.length; i += numDimensions) {
        let currentVertex = [];
        for (let j = 0; j < numDimensions; j++) {
            currentVertex.push(flattenedPoints[i+j]);
        }
        let outputPointIdx = currentVertex.length-1;

        for (let k of activeAxisIdxs) {
            let point = currentVertex[k];
            currentVertex.forEach((p, idx) => {
                
                if (idx !== outputPointIdx && !(idx in activeAxisIdxs)) {
                    console.log(p, idx, k, point, outputPointIdx);
                    point /= p;
                }
            });
            projectedPoints.push(point);
        }
        currentVertex.forEach((p, idx) => {
            if (idx !== outputPointIdx && !(idx in activeAxisIdxs)) {
                currentVertex[outputPointIdx] /= p;
            }});
            projectedPoints.push(currentVertex[outputPointIdx]);
    }
    console.log(projectedPoints);

    return {positions: [], texCoords: [], singularPositions: projectedPoints, zRanges: [-Infinity, Infinity], indices: [] }
}

export {visualiseHigherDimensionalDataset} ;