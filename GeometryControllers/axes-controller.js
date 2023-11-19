import { GeometryController } from "./geometry-controller";


export class AxesGeometryController extends GeometryController {
    arrays = undefined;
    modelMatrix = mat4.create();
}