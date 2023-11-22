import { GeometryController } from "./geometry-controller.js";

export class TextBillBoardCollectionController extends GeometryController {

    arrays = {positions: [], textureCoords: [], indices: []};
    modelMatrices = [undefined];
    //parentModelMatrices = [undefined];
    parentModelMatrix = mat4.create();

    constructor(textBillBoardController) {
        super();
        this.arrays = textBillBoardController.arrays;
        this.modelMatrices = new Array(textBillBoardController.arrays.positions.length/2).fill(textBillBoardController.modelMatrix);
    } 

    updateTimeDependentComponents(time, deltaTime) {
        return;
        //let tp = vec3.create();
        //console.log(deltaTime/10);
        //mat4.getTranslation(tp, this.parentModelMatrix);
        //for(let i = 0; i < this.modelMatrices.length; i++) {
           // mat4.mul(this.parentModelMatrices[i], this.parentModelMatrix, this.modelMatrices[i]);
            //let t = vec3.create();
            //mat4.getTranslation(t, this.modelMatrices[i]);
            //let oldT = vec3.fromValues(t[0], t[1], t[2]);
            //vec3.rotateY(t, t, tp, deltaTime);
            //console.log(deltaTime);
            //let modelMatrix = mat4.create();

            //let rotY = mat4.create();
            //mat4.fromRotation(rotY, deltaTime, vec3.fromValues(0, 1.0, 0));
           //mat4.translate(this.modelMatrices[i], this.modelMatrices[i], vec3.fromValues(-tp[0], -tp[1], -tp[2]));
            //mat4.rotateY(this.modelMatrices[i], this.modelMatrices[i], deltaTime);
            //mat4.mul(this.modelMatrices[i], this.modelMatrices[i], rotY);
            //mat4.translate(this.modelMatrices[i], this.modelMatrices[i], tp);

           //let deltat = vec3.create();
           //vec3.sub(deltat, t, oldT);

            // mat4.translate(
            //     this.modelMatrices[i],
            //     this.modelMatrices[i],
            //     deltat);
            //this.modelMatrices[i] = modelMatrix;
            //mat4.translate(this.modelMatrix, this.modelMatrix, t);//vec3.sub(t, t, oldT));
            //mat4.rotateY(this.modelMatrix, this.modelMatrix, deltaTime);
        //}
    }
}