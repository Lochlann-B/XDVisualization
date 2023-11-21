import { RenderEngine } from "./Render/render-engine.js";
import { Camera } from "./camera.js";
import { GraphController } from "./GraphVisualiser/graph-controller.js";
import { AxesGeometryController } from "./GeometryControllers/axes-controller.js";
import { TextGeometryController } from "./GeometryControllers/text-billboard-controller.js";
import { ArialFontAtlas } from "./Render/Textures/text-atlas.js";
import { AxesDivLabelsController } from "./GeometryControllers/axes-division-labels-controller.js";

export class AppEngine {

    geometryControllers = {graph: [], billboard: [], point: [], line: []};
    renderEngine = new RenderEngine();
    camera = new Camera();

    appInit() {
        this.renderEngine.init_engine();
        this.camera.initControls();

        // temp - move this
        //const graphCtrller = new GraphController();
        //graphCtrller.initGraphControllerTemp();
        //this.geometryControllers.graph.push(graphCtrller);
        //this.geometryControllers.point.push(graphCtrller);
        const axesCtrller = new AxesGeometryController();
        const range = [-3.0,3.0];
        axesCtrller.xRange = range;
        axesCtrller.yRange = range;
        axesCtrller.zRange = range;
        this.geometryControllers.line.push(axesCtrller);

        const txtCtrller = new TextGeometryController();
        txtCtrller.camera = this.camera;
        //txtCtrller.getTextGeomArraysFromAxes(axesCtrller, new ArialFontAtlas());

        const axisDivs = new AxesDivLabelsController();
        axisDivs.initLabelsCtrller(new ArialFontAtlas(), this.camera);
        axisDivs.updateAxis("X", range);
        axisDivs.updateAxis("Y", range);
        axisDivs.updateAxis("Z", range);

        txtCtrller.genBillBoard(new ArialFontAtlas(), ",.ab c . Oscar SMELLY BOY!!!.,$%^&", [3,0,10]);
        this.geometryControllers.billboard.push(txtCtrller);
        //const pointCtrllertmp = new TextGeometryController();
        //pointCtrllertmp.arrays = {singularPositions: txtCtrller.positions};
        //this.geometryControllers.point.push(pointCtrllertmp);
        
        //axisDivs.updateSuperTextGeometryController();
        //this.geometryControllers.billboard.push(axisDivs.superTextGeometryController);
        this.geometryControllers.billboard = this.geometryControllers.billboard.concat(axisDivs.axisMap["X"]);
        this.geometryControllers.billboard = this.geometryControllers.billboard.concat(axisDivs.axisMap["Y"]);
        this.geometryControllers.billboard = this.geometryControllers.billboard.concat(axisDivs.axisMap["Z"]);
    }

    appLoop() {
        let then = 0;

        const geometryControllers = this.geometryControllers;
        const renderEngine = this.renderEngine;
        const camera = this.camera;
        // Draw the scene repeatedly
        function render(now) {
            now *= 0.001; // convert to seconds
            let deltaTime = now - then;
            then = now;

            for (const [_, geometryCtrllerList] of Object.entries(geometryControllers)) {
                geometryCtrllerList.forEach(geometryController => {geometryController.updateTimeDependentComponents(now, deltaTime)});
            }
            renderEngine.renderShaders(camera, geometryControllers);

            requestAnimationFrame(render);
        }
        requestAnimationFrame(render);
    }
}