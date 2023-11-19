function tessellate(fn, xSamples, ySamples, zSamples) {
    let triangles = [];
    let idxs = [];
    let texCoords = [];

    let positions = [];
    let positionsSet = {};
    let singularPoints = [];

    let [xStart, yStart] = [xSamples.range[0], ySamples.range[0]];
    let [xEnd, yEnd] = [xSamples.range[1], ySamples.range[1]];
    let [xInc, yInc] = [(xEnd - xStart)/xSamples.sampleCount, (yEnd - yStart)/ySamples.sampleCount];

    let coordIndices = {};
    let coordIdxCur = 0;

    let possibleTexCoords = [[0.0,0.0],[1.0,0.0],[0.0,1.0],[1.0,0.0],[1.0,1.0],[0.0,1.0]];

    for (let xSample = 0; xSample < xSamples.sampleCount-1; xSample++) {
        for (let ySample = 0; ySample < ySamples.sampleCount-1; ySample++) {
            
            // Sample current coordinate and their neighbours in the x,y,z directions to get 2 triangles

            // Get coordinates we need
            let [x0,y0] = [xStart + xInc*xSample, yStart + yInc*ySample];
            let [x1,y1] = [x0+xInc, y0+yInc];
            let [z00,z11,z01,z10] = [bounded_fn(fn,x0,y0, zSamples), bounded_fn(fn,x1,y1, zSamples), bounded_fn(fn,x0,y1, zSamples),bounded_fn(fn,x1,y0, zSamples)];

            // Both triangles
            let triangles = [[x0,y0,z00],[x1,y0,z10],[x0,y1,z01],[x1,y0,z10],[x1,y1,z11],[x0,y1,z01]];

            //positions = positions.concat(triangles.flat());
            // Add texture coordinates for each corner of the quad formed by the 2 triangles
            //texCoords = texCoords.concat([0.0,0.0,1.0,0.0,0.0,1.0,1.0,1.0]);
            //texCoords = texCoords.concat([0.0,0.0,1.0,1.0,1.0]);
            //texCoords = texCoords.concat([x0/xInc,y0/yInc,x1/xInc,y0/yInc,x1/xInc,y1/yInc,x0/xInc,y1/yInc]);

            // First, check if any position in the triangle is undefined
            // if so, can't form a triangle - render the other points (if any) as singular points
            let start = 0;
            let end = 6;
            let triangle1 = triangles.slice(0,3);
            let triangle2 = triangles.slice(3);
            if (triangle1.filter(v => v[2] === undefined || isNaN(v[2])).length > 0) {
                singularPoints = singularPoints.concat([].concat(...triangle1.filter(v => v[2] !== undefined && !isNaN(v[2]))));
                start += 3;
            }
            if (triangle2.filter(v => v[2] === undefined || isNaN(v[2])).length > 0) {
                singularPoints = singularPoints.concat([].concat(...triangle2.filter(v => v[2] !== undefined && !isNaN(v[2]))));
                end -= 3;
            }

            for (let i=start; i < end; i++) {
                let v = triangles[i];

                
                // Add positions to position array
                if (!(v in positionsSet)) {
                    positionsSet[v] = true;
                    positions = positions.concat(v); 
                    //texCoords = texCoords.concat(possibleTexCoords[i]); 
                    texCoords = texCoords.concat([(v[0]-xStart)-(xEnd-xStart),(v[1]-yStart)-(yEnd-yStart)]);  
                }
                

                // Add indexes of vertices to index array
                if (v in coordIndices) {
                    idxs.push(coordIndices[v]);
                    continue;
                }
                coordIndices[v] = coordIdxCur;
                idxs.push(coordIdxCur);
                coordIdxCur++;
            }

            
        }
    }

    return {positions: positions, indices: idxs, texCoords: texCoords, singularPositions: singularPoints};
}

function bounded_fn(fn,x,y, zSamples) {
    let z = fn(x,y);
    if (z < zSamples.range[0] || z > zSamples.range[1]) {
        return undefined;
    }
    return z;
}

export { tessellate };