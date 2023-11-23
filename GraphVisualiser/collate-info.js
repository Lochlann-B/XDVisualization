import { TextBillBoardCollectionController } from "../GeometryControllers/text-billboard-collection.js";
import { TextGeometryController } from "../GeometryControllers/text-billboard-controller.js";

export class InfoCollator {
    font = null;
    position = null;
    rawTxt = "";
    labels = {
        function: "Function: ", 
        xRange: "X-Range: ",
        yRange: "Y-Range: ",
        zRange: "Z-Range: ",
        filledArgIdxs: "Filled Arg Indexes: ",
        filledArgVals: "Filled Arg Values: ",
        currentIndexSlice: "Current Slice Index: "};
    components = {
        function: "", 
        xRange: "",
        yRange: "",
        zRange: "",
        filledArgIdxs: "",
        filledArgVals: "",
        currentIndexSlice: ""};
    camera = null;

    billBoards = {function: new TextGeometryController(), 
    xRange: new TextGeometryController(),
    yRange: new TextGeometryController(),
    zRange: new TextGeometryController(),
    filledArgIdxs: new TextGeometryController(),
    filledArgVals: new TextGeometryController(),
    currentIndexSlice: new TextGeometryController()};

    modelMats = {};

    indexes = {};

    superGeometryController = new TextBillBoardCollectionController(new TextGeometryController());

    constructor(font, position) {
        this.font = font;
        this.position = position;
        Object.keys(this.billBoards).forEach((key, idx) => {
            let pos = [0, -idx*0.025, 0];
            this.modelMats[key] = mat4.translate(mat4.create(), mat4.create(), vec3.fromValues(...pos));
        });

    }

    update(key, val) {
        this.components[key] = val;
        this.updateBillBoard(key);
    }

    updateSeveral(keys, vals) {
        keys.forEach((key, idx) => this.update(key, vals[idx]));
    }

    updateBillBoard(key) {
        //let pos = [this.position[0], this.position[1]-this.indexes[key]*0.025, this.position[2]];
        let pos = mat4.getTranslation(vec3.create(), this.modelMats[key]);
        let compVal = this.components[key];
        let str = typeof(compVal) == "number" ? this.components[key].toPrecision(3).toString() : typeof(compVal) == "object" ? compVal = compVal.map(val => val.toPrecision(3).toString()) : compVal;
        this.billBoards[key].genBillBoard(this.font, this.labels[key]+str, pos);
        //let modelMat = mat4.translate(mat4.create(), mat4.create(), pos);
        //(Object.keys(this.billBoards).map(key => this.billBoards[key]).reduce((acc, geo) => acc.concat(geo), []), mat4.translate(mat4.create(), mat4.create(), vec3.fromValues(...this.position)))
        this.superGeometryController.updateSuperTextGeometryController(Object.keys(this.billBoards).map(key => this.billBoards[key]).reduce((acc, geo) => {return acc.concat(geo);}, []), mat4.translate(mat4.create(), mat4.create(), vec3.fromValues(...this.position)));
    }


}