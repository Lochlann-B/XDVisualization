import { GeometryController } from "./geometry-controller.js";
import { TextGeometryController } from "./text-billboard-controller.js";
import { TextBillBoardCollectionController } from "./text-billboard-collection.js";

export class AxesDivLabelsController extends GeometryController {
    modelMatrix = undefined;
    xAxis = [undefined];
    yAxis = [undefined];
    zAxis = [undefined];

    camera = undefined;

    axisMap = {"X": this.xAxis, "Y": this.yAxis, "Z": this.zAxis};

    font = undefined;

    initLabelsCtrller(font, cam, axesController) {
        this.modelMatrix = axesController.modelMatrix;
        this.font = font;
        this.superTextGeometryController = new TextBillBoardCollectionController(new TextGeometryController());
        this.camera = cam;
        this.superTextGeometryController.camera = this.camera;
    }

    updateAxis(axis, ranges, divs=10) {
        let offsetL = 0;
        let offsetU = 0;
        ranges = [Math.min(ranges[0], ranges[1]), Math.max(ranges[0], ranges[1])];
        if (ranges[0] > 0) { offsetL = -ranges[0]; }
        if (ranges[1] < 0) { offsetU = -ranges[1]; }

        let rRange = ranges[1]-ranges[0];
        let activeAxis = -1;
        let axisToUpdate = undefined;
        switch (axis) {
            case "X":
                activeAxis = 0;
                axisToUpdate = this.xAxis;
                break;
            case "Y":
                activeAxis = 1;
                axisToUpdate = this.yAxis;
                break;
            case "Z":
                activeAxis = 2;
                axisToUpdate = this.zAxis;
                break;
            default:
                console.error("unknown axis specified!");
                return;
        }
        let coordAxis = [0,0,0];
        coordAxis[activeAxis] = 1;

        let newAxis = [];
        for(let i = 0; i < divs; i++) {
            let lowerPosCoord = ranges[0]+i*rRange/10;
            let upperPosCoord = ranges[1]-i*rRange/10;

            let txtGeomCtrllerL = new TextGeometryController();
            //txtGeomCtrllerL.modelMatrix = this.modelMatrix;
            txtGeomCtrllerL.camera = this.camera;
            coordAxis[activeAxis] = lowerPosCoord+ offsetL + offsetU;
            //let vec4LCoords = vec4.fromValues(...coordAxis, 0.0);
            //vec4.transformMat4(vec4LCoords, vec4LCoords, this.modelMatrix);
            txtGeomCtrllerL.genBillBoard(this.font, lowerPosCoord.toPrecision(3).toString(), coordAxis);//[vec4LCoords[0], vec4LCoords[1], vec4LCoords[2]]);

            let txtGeomCtrllerU = new TextGeometryController();
            //txtGeomCtrllerU.modelMatrix = this.modelMatrix;
            coordAxis[activeAxis] = upperPosCoord+ offsetL + offsetU;
            txtGeomCtrllerU.camera = this.camera;
            //let vec4UCoords = vec4.fromValues(...coordAxis, 0.0);
            //vec4.transformMat4(vec4UCoords, vec4UCoords, this.modelMatrix);
            txtGeomCtrllerU.genBillBoard(this.font, upperPosCoord.toPrecision(3).toString(), coordAxis);//[vec4UCoords[0], vec4UCoords[1], vec4UCoords[2]]);
            

            newAxis = newAxis.concat([txtGeomCtrllerL, txtGeomCtrllerU]);
        }

        this.axisMap[axis] = newAxis;

    }

    updateSuperTextGeometryController() {
        let flattenedGeometryControllerList = Object.keys(this.axisMap).map(key => this.axisMap[key]).reduce((allAxes, axisList) => allAxes = allAxes.concat(axisList), []);
        this.superTextGeometryController.modelMatrices = flattenedGeometryControllerList.reduce((res, geoCtrl) => res = res.concat(new Array(geoCtrl.arrays.positions.length/2).fill(geoCtrl.modelMatrix)), []);
        this.superTextGeometryController.arrays.positions = flattenedGeometryControllerList.reduce((res, geoCtrl) => res = res.concat(geoCtrl.arrays.positions), []);
        this.superTextGeometryController.arrays.textureCoords = flattenedGeometryControllerList.reduce((res, geoCtrl) => res = res.concat(geoCtrl.arrays.textureCoords), []);
        this.superTextGeometryController.arrays.indices = flattenedGeometryControllerList.reduce((res, geoCtrl) => {return {list: res.list.concat(geoCtrl.arrays.indices.map(idx => idx += res.offset)), offset: res.offset + Math.max(...geoCtrl.arrays.indices)+1}}, {list: [], offset: 0},).list;
        this.superTextGeometryController.parentModelMatrix = this.modelMatrix;
        //this.superTextGeometryController.parentModelMatrices = new Array(this.superTextGeometryController.modelMatrices.length).fill(mat4.create());
    }
}