import { tessellate } from "../GraphVisualiser/tessellator.js";
import { compareMeshWithGroundTruth } from "./graph-validation.js";

class Validator {
    evaluate() {
        for(let i = 10; i < 100; i += 10) {
            console.log("High coordinate ranges: ");
            //validateMesh((x,y) => x**2+y**2, {range: [-1000,-9], sampleCount: i}, {range: [10, 200], sampleCount: i}, {range: [-Infinity,Infinity]}, 1000);
            console.log("Small coordinate ranges: ");
            //validateMesh((x,y) => x**2+y**2, {range: [-0.1,0], sampleCount: i}, {range: [0.1, 0.15], sampleCount: i}, {range: [-Infinity,Infinity]}, 1000);
            console.log("Funky function: ");
            validateMesh((x,y) => x**y, {range: [-1,1], sampleCount: i}, {range: [-1, 1], sampleCount: i}, {range: [-Infinity,Infinity]}, 1000);
        }
    }
}

function validateMesh(fn, xSamples, ySamples, zSamples, sampleCount) {
    let arrays = tessellateWithNoOffsets(fn, xSamples, ySamples, zSamples);
        const result = compareMeshWithGroundTruth(fn, arrays, sampleCount, xSamples.range, ySamples.range);
    console.log("Root-Mean squared error for function ", fn, " with ranges X: ", xSamples, ", Y: ", ySamples, ", Z: ", zSamples, ": ", result);
    // const result = compareMeshWithGroundTruth(fn, arrays, sampleCount, xSamples.range, ySamples.range);
    // console.log("Root-Mean squared error for function ", fn, " with ranges X: ", xSamples, ", Y: ", ySamples, ", Z: ", zSamples, ": ", result);
}

// The same function as in tessellate.js, but without the offsets that would otherwise align the mesh to the axes
function tessellateWithNoOffsets(fn, xSamples, ySamples, zSamples) {

    let triangles = [];
    let idxs = [];
    let texCoords = [];

    let positions = [];
    let positionsSet = {};
    let singularPoints = [];

    let [xStart, yStart] = [Math.min(xSamples.range[0], xSamples.range[1]), Math.min(ySamples.range[0], ySamples.range[1])];
    let [xEnd, yEnd] = [Math.max(xSamples.range[1], xSamples.range[0]), Math.max(ySamples.range[1], ySamples.range[0])];
    let [xInc, yInc] = [(xEnd - xStart)/xSamples.sampleCount, (yEnd - yStart)/ySamples.sampleCount];

    let xOffsets = [0, 0];
    let yOffsets = [0, 0];
    let zOffsets = [0, 0];
    let offsets = [xOffsets, yOffsets, zOffsets];

    let coordIndices = {};
    let coordIdxCur = 0;

    let zMin = 0;
    let zMax = 0;

    let possibleTexCoords = [[0.0,0.0],[1.0,0.0],[0.0,1.0],[1.0,0.0],[1.0,1.0],[0.0,1.0]];

    for (let xSample = 0; xSample < xSamples.sampleCount; xSample++) {
        for (let ySample = 0; ySample < ySamples.sampleCount; ySample++) {
            
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

const validator = new Validator();
validator.evaluate();