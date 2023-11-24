import { tessellate } from "../GraphVisualiser/tessellator.js";

export class TessellatorTestRunner {
    runTests() {
        tests({
            'tessellate fn with no samples yields empty info': async function() {
                // Arrange
                let fn = (x,y) => 3;
                let xSamples = {range: [-1,1], sampleCount: 0};
                let ySamples = {range: [-1,1], sampleCount: 0};
                let zSamples = {range: [-1,1]};

                // Act
                let res = null;
                res = await tessellate(fn, xSamples, ySamples, zSamples);//.then(result => res = result);

                // Assert
                eq(res.positions.length, 0);
                eq(res.indices.length, 0);
                eq(res.texCoords.length, 0);
                eq(res.singularPositions.length, 0);
                eq(res.zRanges.length, 2);
            }

        });

        tests({
            'tessellate function yields correct info': async function() {
                // Arrange
                let fn = (x,y) => 3;
                let xSamples = {range: [-1,1], sampleCount: 2};
                let ySamples = {range: [-1,1], sampleCount: 2};
                let zSamples = {range: [-3,4]};

                // Act
                let res = await tessellate(fn, xSamples, ySamples, zSamples);

                // Assert
                eq(res.positions, "-1,-1,3,0,-1,3,-1,0,3,0,0,3");
                eq(res.indices, "0,1,2,1,3,2");
                eq(res.texCoords, "-1,-1,-0.5,-1,-1,-0.5,-0.5,-0.5");
                eq(res.singularPositions, "");
                eq(res.zRanges, "0,3");
            }
        });
    }
}