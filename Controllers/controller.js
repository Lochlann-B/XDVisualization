import { GeometryController } from "../GeometryControllers/geometry-controller.js";

export class Controller extends GeometryController {
    arrays = {positions: [], colours: []};
    modelMatrix = null;

    initController() {
        // Triangular prism
        this.arrays.positions = this.arrays.positions.concat([-1,0,-1,1,0,-1,0,0,1,-1,0,-1,0,1,0,1,0,-1,1,0,-1,0,0,1,0,0,1,0,1,0,0,1,0,-1,0,-1]);
        this.arrays.positions = this.arrays.positions.map(coord => coord*0.01);
        this.arrays.colours = this.arrays.colours.concat([1.0,1.0,0.0,1.0,1.0,1.0,0.0,1.0,1.0,1.0,0.0,1.0,1.0,1.0,0.0,1.0,1.0,1.0,0.0,1.0,1.0,1.0,0.0,1.0,1.0,1.0,0.0,1.0,1.0,1.0,0.0,1.0,1.0,1.0,0.0,1.0,1.0,1.0,0.0,1.0,1.0,1.0,0.0,1.0,1.0,1.0,0.0,1.0,]);
        this.modelMatrix = mat4.create();
    }
}