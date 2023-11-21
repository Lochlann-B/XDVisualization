import { GeometryController } from "./geometry-controller.js";
import { TextGeometryController } from "./text-billboard-controller.js";

export class AxesDivLabelsController extends GeometryController {
    xAxis = [undefined];
    yAxis = [undefined];
    zAxis = [undefined];

    camera = undefined;

    axisMap = {"X": this.xAxis, "Y": this.yAxis, "Z": this.zAxis};

    font = undefined;

    initLabelsCtrller(font, cam) {
        this.font = font;
        this.superTextGeometryController = new TextGeometryController();
        this.camera = cam;
        this.superTextGeometryController.camera = this.camera;
    }

    updateAxis(axis, ranges, divs=10) {
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
            txtGeomCtrllerL.camera = this.camera;
            coordAxis[activeAxis] = lowerPosCoord;
            txtGeomCtrllerL.genBillBoard(this.font, lowerPosCoord.toPrecision(3).toString(), [...coordAxis]);

            let txtGeomCtrllerU = new TextGeometryController();
            coordAxis[activeAxis] = upperPosCoord;
            txtGeomCtrllerU.camera = this.camera;
            txtGeomCtrllerU.genBillBoard(this.font, upperPosCoord.toPrecision(3).toString(), [...coordAxis]);
            

            newAxis = newAxis.concat([txtGeomCtrllerL, txtGeomCtrllerU]);
        }

        this.axisMap[axis] = newAxis;

    }

    /*
    updateSuperTextGeometryController() {
        let flattenedGeometryControllerList = Object.keys(this.axisMap).map(key => this.axisMap[key]).reduce((allAxes, axisList) => allAxes = allAxes.concat(axisList), []);
        this.superTextGeometryController.positions = flattenedGeometryControllerList.reduce((res, geoCtrl) => res = res.concat(geoCtrl.positions), []);
        this.superTextGeometryController.arrays.positions = flattenedGeometryControllerList.reduce((res, geoCtrl) => res = res.concat(geoCtrl.arrays.positions), []);
        this.superTextGeometryController.arrays.textureCoords = flattenedGeometryControllerList.reduce((res, geoCtrl) => res = res.concat(geoCtrl.arrays.textureCoords), []);
        this.superTextGeometryController.arrays.indices = flattenedGeometryControllerList.reduce((res, geoCtrl) => {return {list: res.list.concat(geoCtrl.arrays.indices.map(idx => idx += res.offset)), offset: res.offset + Math.max(...geoCtrl.arrays.indices)+1}}, {list: [], offset: 0},).list;
    }
    */
}