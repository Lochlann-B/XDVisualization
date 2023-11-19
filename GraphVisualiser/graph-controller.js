import { GeometryController } from "../GeometryControllers/geometry-controller.js";
import { tessellate } from "./tessellator.js";

export class GraphController extends GeometryController {
    arrays = undefined;
    usesColour = false;
    modelMatrix = mat4.create();
    fn = undefined;

    initGraphControllerTemp() {
        let xSamples = {range: [-3,3], sampleCount: 50};
        let ySamples = {range: [-3,3], sampleCount: 50};
        this.arrays = tessellate(function(x,y) {return Math.sin(x);}, xSamples, ySamples, null);
    }

    updateTimeDependentComponents(time, deltaTime) {
        mat4.rotateY(this.modelMatrix, this.modelMatrix, deltaTime);
    }

    getGraphGeometryInfo() {

        // TODO: Parameterize function, ranges, slices according to UI inputs
        // TODO: Have a function which takes inputs from camera information to determine suitable sample size
        //       to feed to tessellator.
    
        return {arrays: this.arrays, modelMatrix: this.modelMatrix};
    }
}