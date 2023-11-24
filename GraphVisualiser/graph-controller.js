import { GeometryController } from "../GeometryControllers/geometry-controller.js";
import { tessellate } from "./tessellator.js";

export class GraphController extends GeometryController {
    arrays = undefined;
    modelMatrix = mat4.create();
    fn = undefined;

    xSamples = undefined;
    ySamples = undefined;
    zSamples = undefined;

    initGraphControllerTemp(fn, range, samples=40) {
        this.xSamples = {range: range[0], sampleCount: samples};
        this.ySamples = {range: range[1], sampleCount: samples};
        this.zSamples = {range: range[2]};
        this.fn = fn;
        tessellate(fn, this.xSamples, this.ySamples, this.zSamples).then(res => this.arrays = res );
    }

    updateTimeDependentComponents(time, deltaTime) {
        //mat4.rotateY(this.modelMatrix, this.modelMatrix, deltaTime);
    }

    updateRanges(ranges) {
        this.xSamples = {range: ranges[0], sampleCount: this.xSamples.sampleCount};
        this.ySamples = {range: ranges[1], sampleCount: this.ySamples.sampleCount};
        this.zSamples = {range: ranges[2]};
        tessellate(this.fn, this.xSamples, this.ySamples, this.zSamples).then(res => this.arrays = res );
    }

    getGraphGeometryInfo() {
    
        return {arrays: this.arrays, modelMatrix: this.modelMatrix};
    }

    get arrays() { return this.arrays; }
}