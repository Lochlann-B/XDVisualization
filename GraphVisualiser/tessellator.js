async function tessellate(fn, xSamples, ySamples, zSamples) {

    let triangles = [];
    let idxs = [];
    let texCoords = [];

    let positions = [];
    let positionsSet = {};
    let singularPoints = [];

    let [xStart, yStart] = [Math.min(xSamples.range[0], xSamples.range[1]), Math.min(ySamples.range[0], ySamples.range[1])];
    let [xEnd, yEnd] = [Math.max(xSamples.range[1], xSamples.range[0]), Math.max(ySamples.range[1], ySamples.range[0])];
    let [xInc, yInc] = [(xEnd - xStart)/xSamples.sampleCount, (yEnd - yStart)/ySamples.sampleCount];

    let xOffsets = getOffsets([xStart, xEnd]);
    let yOffsets = getOffsets([yStart, yEnd]);
    let zOffsets = getOffsets([Math.min(zSamples.range[0], zSamples.range[1]), Math.max(zSamples.range[0], zSamples.range[1])]);
    let offsets = [xOffsets, yOffsets, zOffsets];

    let coordIndices = {};
    let coordIdxCur = 0;

    let zMin = 0;
    let zMax = 0;

    let possibleTexCoords = [[0.0,0.0],[1.0,0.0],[0.0,1.0],[1.0,0.0],[1.0,1.0],[0.0,1.0]];

    for (let xSample = 0; xSample < xSamples.sampleCount-1; xSample++) {
        for (let ySample = 0; ySample < ySamples.sampleCount-1; ySample++) {
            
            // Sample current coordinate and their neighbours in the x,y,z directions to get 2 triangles

            // Get coordinates we need
            let [x0,y0] = [xStart + xInc*xSample, yStart + yInc*ySample];
            let [x1,y1] = [x0+xInc, y0+yInc];
            let [z00,z11,z01,z10] = [bounded_fn(fn,x0,y0, zSamples) + zOffsets[0] + zOffsets[1], bounded_fn(fn,x1,y1, zSamples) + zOffsets[0] + zOffsets[1], bounded_fn(fn,x0,y1, zSamples) + zOffsets[0] + zOffsets[1],bounded_fn(fn,x1,y0, zSamples) + zOffsets[0] + zOffsets[1]];
            
            let x0f = x0 + xOffsets[0] + xOffsets[1];
            let y0f = y0 + yOffsets[0] + yOffsets[1];
            let x1f = x1 + xOffsets[0] + xOffsets[1];
            let y1f = y1 + yOffsets[0] + yOffsets[1];

            // Both triangles
            let triangles = [[x0f,y0f,z00],[x1f,y0f,z10],[x0f,y1f,z01],[x1f,y0f,z10],[x1f,y1f,z11],[x0f,y1f,z01]];

            zMax = triangles.reduce((zm, v) => {if(v[2] != "Infinity" && v[2] > zm) {return v[2];} return zm;}, zMax);
            zMin = triangles.reduce((zm, v) => {if(v[2] != "Infinity" && v[2] < zm) {return v[2];} return zm;}, zMin);

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
                    texCoords = texCoords.concat([((v[0]-xStart)-(xEnd-xStart))/(xEnd-xStart),((v[1]-yStart)-(yEnd-yStart))/(yEnd-yStart)]);  
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

    return {positions: positions, indices: idxs, texCoords: texCoords, singularPositions: singularPoints, zRanges: [zMin, zMax]};
}

function bounded_fn(fn,x,y, zSamples) {
    let z = fn(x,y);
    if (z < zSamples.range[0] || z > zSamples.range[1]) {
        return undefined;
    }
    return z;
}

function clamp(val, min, max) {return Math.min(Math.max(val, min), max)}

function getOffsets(newRange) {
    let offsetL = 0;
    let offsetU = 0;
    if (newRange[0] > 0) {
        offsetL = -newRange[0];
    }
    if (newRange[1] < 0) {
        offsetU = -newRange[1];
    }
    return [offsetL, offsetU];
}

export { tessellate };