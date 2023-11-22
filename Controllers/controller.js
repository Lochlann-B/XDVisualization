export class Controller extends GeometryController {
    arrays = {positions: [], colours: []};
    modelMatrix = null;

    initController() {
        // Triangular prism
        positions.concat([-1,0,-1,1,0,-1,0,0,1,-1,0,-1,0,1,0,1,0,-1,1,0,-1,0,0,1]);
        colours.concat([1.0,1.0,0.0,1.0,1.0,1.0,0.0,1.0,1.0,1.0,0.0,1.0,1.0,1.0,0.0,1.0,1.0,1.0,0.0,1.0,1.0,1.0,0.0,1.0,1.0,1.0,0.0,1.0,1.0,1.0,0.0,1.0,]);
        modelMatrix = mat4.create();
    }
}