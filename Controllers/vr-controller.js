import { tessellate } from "../GraphVisualiser/tessellator.js";

export class VrController {
    controllers = {left: null, right: null};
    xrSession = null;
    controllerGeometries = [];
    refSpace = null;
    axesModelMatrix = null;
    axesController = null;
    axesDivLabelsController = null;
    sliceController = null;

    prevRotateButtonPressed = false;
    initialRotation = vec3.create();

    prevMoveButtonPressed = false;
    initialMovement = vec3.create();

    prevZoomOutButtonPressed = false;
    prevZoomInButtonPressed = false;

    prevSignButtonPressed = false;
    prevToggleSliceButtonPressed = false;
    curSliceIdx = 0;

    infoCollator = null;

    updateInputSources(event) {
        const inputSourceList = event.session.inputSources;
          
            inputSourceList.forEach((source) => {
              switch (source.handedness) {
                case "left":
                  this.controllers.left = source;
                  break;
                case "right":
                  this.controllers.right = source;
                  break;
              }


            });
    }

    constructor(xrsess, axesController, graphController, sliceController, infoCollator) {
        this.xrSession = xrsess;
        this.axesModelMatrix = axesController.modelMatrix;
        this.axesController = axesController;
        this.axesDivLabelsController = axesController.axisDivLabelsController;
        this.graphController = graphController;
        this.sliceController = sliceController;
        this.infoCollator = infoCollator;


        this.xrSession.addEventListener("inputsourceschange", (event) => {
            this.updateInputSources(event);
          });
    }

    updateCtrllrs(frame) {
        this.controllerGeometries[0].modelMatrix = frame.getPose(this.controllers.left.gripSpace,this.refSpace).transform.matrix;
        this.controllerGeometries[1].modelMatrix = frame.getPose(this.controllers.right.gripSpace,this.refSpace).transform.matrix;
    }

    updateControllers(frame, refSpace) {
            this.controllerGeometries[0].modelMatrix = frame.getPose(this.controllers.left.gripSpace, this.refSpace).transform.matrix;
            this.controllerGeometries[1].modelMatrix = frame.getPose(this.controllers.right.gripSpace, this.refSpace).transform.matrix;
            
            this.checkGraphRotateButton();
            this.checkGraphMoveButton();
            this.checkGraphZoomButton();
            this.checkSliceButton();
    }

    checkSliceButton() {
        if(this.sliceController.filledIdxs.length == 0) { return; }
        if(this.controllers.right.gamepad.buttons[4].pressed) {
            if(!this.toggleSliceButton) {
                this.curSliceIdx = (this.curSliceIdx + 1)%(this.sliceController.filledIdxs.length);
                this.infoCollator.update("currentIndexSlice", this.curSliceIdx);
            }
            this.toggleSliceButton = true;
        } else { this.toggleSliceButton = false; }
        if(this.controllers.right.gamepad.buttons[0].pressed) {
            this.sliceController.sliceVals[this.curSliceIdx] += 0.1*this.controllers.right.gamepad.buttons[0].value;
            this.infoCollator.update("filledArgVals", this.sliceController.sliceVals);
            this.graphController.fn = this.sliceController.slicedFn;
            tessellate(this.sliceController.slicedFn, this.graphController.xSamples, this.graphController.ySamples, this.graphController.zSamples).then(res => this.graphController.arrays = res);
            
        }
        if(this.controllers.right.gamepad.buttons[1].pressed) {
            this.sliceController.sliceVals[this.curSliceIdx] -= 0.1*this.controllers.right.gamepad.buttons[1].value;
            this.infoCollator.update("filledArgVals", this.sliceController.sliceVals);
            this.graphController.fn = this.sliceController.slicedFn;
            tessellate(this.sliceController.slicedFn, this.graphController.xSamples, this.graphController.ySamples, this.graphController.zSamples).then(res => this.graphController.arrays = res);
        }
    }

    getRanges() {
        return [this.axesController.xRange, this.axesController.yRange, this.axesController.zRange];
    }

    updateRanges(newRanges) {
        this.infoCollator.update("xRange", newRanges[0]);
        this.infoCollator.update("yRange", newRanges[1]);
        this.infoCollator.update("zRange", newRanges[2]);
        this.graphController.updateRanges(newRanges);
        this.axesController.updateRanges(newRanges);
    }

    checkGraphZoomButton() {
        if(this.controllers.left.gamepad.buttons[3].pressed) {
            if(!this.prevZoomOutButtonPressed) {
                let ranges = this.getRanges();
                let newRanges = ranges.map(range => range.map(bound => bound*1.1));
                this.updateRanges(newRanges);
                //this.axesDivLabelsController.updateAxes(newRanges);
            }
            this.prevZoomOutButtonPressed = true;
        } else { this.prevZoomOutButtonPressed = false; }
        if(this.controllers.right.gamepad.buttons[3].pressed) {
            if(!this.prevZoomInButtonPressed) {
                let ranges = [this.axesController.xRange, this.axesController.yRange, this.axesController.zRange];
                let newRanges = ranges.map(range => range.map(bound => bound*0.9));
                this.updateRanges(newRanges);
            }
            this.prevZoomInButtonPressed = true;
        } else { this.prevZoomInButtonPressed = false; }
    }

    checkGraphMoveButton() {
        if(this.controllers.left.gamepad.buttons[0].pressed) {
            if(!this.prevMoveButtonPressed) {
                this.initialMovement = mat4.getTranslation(vec3.create(), this.controllerGeometries[0].modelMatrix);
                this.prevMoveButtonPressed = true;
                return;
            }
            let prevMovement = vec3.fromValues(...this.initialMovement);
            this.initialMovement = mat4.getTranslation(vec3.create(), this.controllerGeometries[0].modelMatrix);
            let deltaXYZ = vec4.fromValues(10*(this.initialMovement[0]-prevMovement[0]), 10*(this.initialMovement[1]-prevMovement[1]), 10*(this.initialMovement[2]-prevMovement[2]), 1.0);

            let axesRotation = quat.create();
            this.decompose(this.axesModelMatrix, [0,0,0], axesRotation, [0,0,0]);

            const rotationQuaternion = axesRotation; 
            const vectorToRotate = deltaXYZ;
            
            // Normalize the quaternion (if needed)
            
            // Create a quaternion representing the vector
            const vectorQuaternion = quat.create();
            quat.set(vectorQuaternion, vectorToRotate[0], vectorToRotate[1], vectorToRotate[2], 0);
            
            // Apply the rotation to the vector quaternion
            const conjugateQuaternion = quat.create();
            quat.conjugate(conjugateQuaternion, rotationQuaternion);
            
            const rotatedVectorQuaternion = quat.create();
            
            quat.mul(rotatedVectorQuaternion, vectorQuaternion, rotationQuaternion);
            quat.mul(rotatedVectorQuaternion, conjugateQuaternion, rotatedVectorQuaternion);
            
            // Extract the rotated vector from the quaternion
            const rotatedVector = vec3.fromValues(
              rotatedVectorQuaternion[0],
              rotatedVectorQuaternion[1],
              rotatedVectorQuaternion[2]
            );

            mat4.translate(this.axesModelMatrix, this.axesModelMatrix, rotatedVector);
        }
        else {
            this.prevMoveButtonPressed = false;
        }
    }

    checkGraphRotateButton() {
        if(this.controllers.left.gamepad.buttons[1].pressed) {
            if(!this.prevRotateButtonPressed) {
                this.initialRotation = mat4.getTranslation(vec3.create(), this.controllerGeometries[0].modelMatrix);
                this.prevRotateButtonPressed = true;
                return;
            }
            let prevRotation = vec3.fromValues(...this.initialRotation);
            this.initialRotation = mat4.getTranslation(vec3.create(), this.controllerGeometries[0].modelMatrix);
            let deltaXZ = [this.initialRotation[0]-prevRotation[0], this.initialRotation[1]-prevRotation[1]];
            let magDeltaTheta = Math.sqrt(deltaXZ[0]**2 + deltaXZ[1]**2);
            if(magDeltaTheta == 0) { return; }
            let sign = deltaXZ[0] == 0 ? (deltaXZ[1])/(Math.abs(deltaXZ[1])) : (deltaXZ[0])/(Math.abs(deltaXZ[0]));
            let deltaTheta = 7*sign*magDeltaTheta;
            mat4.rotateZ(this.axesModelMatrix, this.axesModelMatrix, deltaTheta);
        }
        else {
            this.prevRotateButtonPressed = false;
        }
    }

    // Reimplementation of decompose because glmatrix's getRotation is broken >:(
    decompose(srcMat,dstTranslation,dstRotation,dstScale) {

        let sx = vec3.length([srcMat[0], srcMat[1], srcMat[2]]);
        const sy = vec3.length([srcMat[4], srcMat[5], srcMat[6]]);
        const sz = vec3.length([srcMat[8], srcMat[9], srcMat[10]]);

        const det = mat4.determinant(srcMat);
        if (det < 0) sx = - sx;

        dstTranslation[0] = srcMat[12];
        dstTranslation[1] = srcMat[13];
        dstTranslation[2] = srcMat[14];

        const m1 = srcMat.slice();

        const invSX = 1 / sx;
        const invSY = 1 / sy;
        const invSZ = 1 / sz;

        m1[0] *= invSX;
        m1[1] *= invSX;
        m1[2] *= invSX;

        m1[4] *= invSY;
        m1[5] *= invSY;
        m1[6] *= invSY;

        m1[8] *= invSZ;
        m1[9] *= invSZ;
        m1[10] *= invSZ;

        mat4.getRotation(dstRotation, m1);

        dstScale[0] = sx;
        dstScale[1] = sy;
        dstScale[2] = sz;
    }

}

