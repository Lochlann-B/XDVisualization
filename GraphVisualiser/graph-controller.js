import { GeometryController } from "../GeometryControllers/geometry-controller.js";
import { tessellate } from "./tessellator.js";

export class GraphController extends GeometryController {
    arrays = undefined;
    usesColour = false;
    modelMatrix = mat4.create();
    fn = undefined;

    xSamples = undefined;
    ySamples = undefined;
    zSamples = undefined;

    initGraphControllerTemp(fn, range, samples=40) {
        this.xSamples = {range: range[0], sampleCount: samples};
        this.ySamples = {range: range[1], sampleCount: samples};
        this.zSamples = {range: range[2]};
        this.arrays = tessellate(fn, this.xSamples, this.ySamples, this.zSamples);
    }

    updateTimeDependentComponents(time, deltaTime) {
        //mat4.rotateY(this.modelMatrix, this.modelMatrix, deltaTime);
    }

    getGraphGeometryInfo() {

        // TODO: Parameterize function, ranges, slices according to UI inputs
        // TODO: Have a function which takes inputs from camera information to determine suitable sample size
        //       to feed to tessellator.
    
        return {arrays: this.arrays, modelMatrix: this.modelMatrix};
    }

    get arrays() { return this.arrays; }
}