import { RenderEngine } from "./Render/render-engine.js";
import { Camera } from "./camera.js";
import { GraphController } from "./GraphVisualiser/graph-controller.js";
import { AxesGeometryController } from "./GeometryControllers/axes-controller.js";

export class AppEngine {

    geometryControllers = {graph: [], billboard: [], point: [], line: []};
    renderEngine = new RenderEngine();
    camera = new Camera();

    appInit() {
        this.renderEngine.init_engine();
        this.camera.initControls();

        // temp - move this
        const graphCtrller = new GraphController();
        graphCtrller.initGraphControllerTemp();
        this.geometryControllers.graph.push(graphCtrller);
        this.geometryControllers.point.push(graphCtrller);
        const axesCtrller = new AxesGeometryController();
        const range = [-3.0,3.0];
        axesCtrller.xRange = range;
        axesCtrller.yRange = range;
        axesCtrller.zRange = range;
        this.geometryControllers.line.push(axesCtrller);
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