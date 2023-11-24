import { tessellate } from "../GraphVisualiser/tessellator.js";
import { compareMeshWithGroundTruth } from "./graph-validation.js";

class Validator {
    evaluate() {
        for(let i = 10; i < 100; i += 10) {
            validateMesh((x,y) => x**2+y**2, {range: [-10,10], sampleCount: i}, {range: [-3, 2], sampleCount: i}, {range: [-Infinity,Infinity]}, 10000);
        }
    }
}

function validateMesh(fn, xSamples, ySamples, zSamples, sampleCount) {
    tessellate(fn, xSamples, ySamples, zSamples).then(arrays => {
        const result = compareMeshWithGroundTruth(fn, arrays, sampleCount, xSamples.range, ySamples.range);
    console.log("Root-Mean squared error for function ", fn, " with ranges X: ", xSamples, ", Y: ", ySamples, ", Z: ", zSamples, ": ", result);
    });
    // const result = compareMeshWithGroundTruth(fn, arrays, sampleCount, xSamples.range, ySamples.range);
    // console.log("Root-Mean squared error for function ", fn, " with ranges X: ", xSamples, ", Y: ", ySamples, ", Z: ", zSamples, ": ", result);
}

const validator = new Validator();
validator.evaluate();