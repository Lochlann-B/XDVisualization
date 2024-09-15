import { RenderEngine } from "./Render/render-engine.js";
import { Camera } from "./camera.js";
import { GraphController } from "./GraphVisualiser/graph-controller.js";
import { AxesGeometryController } from "./GeometryControllers/axes-controller.js";
import { TextGeometryController } from "./GeometryControllers/text-billboard-controller.js";
import { ArialFontAtlas, PixelFontAtlas } from "./Render/Textures/text-atlas.js";
import { AxesDivLabelsController } from "./GeometryControllers/axes-division-labels-controller.js";
import { TextBillBoardCollectionController } from "./GeometryControllers/text-billboard-collection.js";
import { sliceFunction, turnUserInputIntoFn } from "./GraphVisualiser/slicing.js";
import { SlicingController } from "./GraphVisualiser/slicingController.js";
import { Controller } from "./Controllers/controller.js";
import { VrController } from "./Controllers/vr-controller.js";
import { InfoCollator } from "./GraphVisualiser/collate-info.js";
import { visualiseHigherDimensionalDataset } from "./GraphVisualiser/point-visualiser.js";

export class AppEngine {

    geometryControllers = {graph: [], line: [], billboard: [], point: []};
    componentControllers = {graph: [], line: [], billboard: [], point: []};
    renderEngine = new RenderEngine();
    camera = new Camera();
    date = new Date();
    xrReferenceSpace = null;
    controllers = [];
    frame = null;
    xrSession = null;
    graphController = null;
    graphSlicer = null;
    infoCollator = null;

    appInit() {
        this.camera.initControls();
        this.renderEngine.init_engine();
        
        
        const font = new ArialFontAtlas();
        this.infoCollator = new InfoCollator(font, [-0.3,0.0,-0.3]);

        const axesCtrller = new AxesGeometryController();
        const xRange = [-1,1];
        const yRange = [-1,1];
        const zRange = [-1,1];
        axesCtrller.xRange = xRange;
        axesCtrller.yRange = yRange;
        axesCtrller.zRange = zRange;
        this.geometryControllers.line.push(axesCtrller);

        // this.graphSlicer = new SlicingController((x,y,z) => Math.abs(Math.round((x + y)*30) % 2) ==  1 ? undefined : Math.sin(1000*(x * x + y * y))/1000 + z);
       // this.graphSlicer = new SlicingController((x, y, z) => Math.asin(Math.sin(x*1000) + 1) + Math.asin(Math.sin(y*1000) + 1) + z);
      //  this.graphSlicer = new SlicingController((x,y,z) => (!((Math.round(5*z)) %2) || !((Math.round(5*y))%2)) ? undefined : Math.sin((z * z + y * y)) + x);
        this.graphSlicer = new SlicingController((x,y,z,w) => x*x - y + w*Math.sin(z));
        const graphCtrller = new GraphController();

        /*

        ()

        */

        graphCtrller.initGraphControllerTemp(this.graphSlicer.slicedFn, [xRange, yRange, zRange]);
        //graphCtrller.arrays = visualiseHigherDimensionalDataset([0,0,1,0,2,2,2,1], 4, [0,1]);
        graphCtrller.modelMatrix = axesCtrller.modelMatrix;
        this.geometryControllers.graph.push(graphCtrller);
        this.geometryControllers.point.push(graphCtrller);



        const txtCtrller = new TextGeometryController();
        txtCtrller.camera = this.camera;

        
        const axisDivs = new AxesDivLabelsController();
        axisDivs.initLabelsCtrller(font, this.camera, axesCtrller);
        axisDivs.updateAxis("X", xRange);
        axisDivs.updateAxis("Y", yRange);
        axisDivs.updateAxis("Z", zRange);

        txtCtrller.genBillBoard(font, " ", [0,0,0]);
        this.geometryControllers.billboard.push(new TextBillBoardCollectionController(txtCtrller));

        axesCtrller.divLabelsController = axisDivs;
        
        axisDivs.superTextGeometryController.updateSuperTextGeometryController(axisDivs.getFlattenedGeoCtrlList(), axisDivs.modelMatrix);
        this.geometryControllers.billboard.push(axisDivs.superTextGeometryController);
        this.infoCollator.camera = this.camera;
        this.geometryControllers.billboard.push(this.infoCollator.superGeometryController);
   
        this.infoCollator.updateSeveral(
            ["function", "xRange", "yRange", "zRange", "filledArgIdxs", "filledArgVals", "currentIndexSlice"], 
            [this.graphSlicer.unSlicedFn, xRange, yRange, zRange, this.graphSlicer.filledIdxs, this.graphSlicer.filledVals, 0]);

    }

    appLoop(session) {
        
        let xrSession = session;

        const Controllers = new VrController(xrSession, this.geometryControllers.line[0], this.geometryControllers.graph[0], this.graphSlicer, this.infoCollator);
        let ctrllerL = new Controller();
        ctrllerL.initController();
        let ctrllerR = new Controller();
        ctrllerR.initController();
        Controllers.controllerGeometries = [ctrllerL, ctrllerR];
        this.geometryControllers.line = this.geometryControllers.line.concat([ctrllerL, ctrllerR]);

        let then = 0;
        let animationFrameRequestID = 0;
        let i = true;
        const geometryControllers = this.geometryControllers;
        const renderEngine = this.renderEngine;
        const camera = this.camera;
        let current = 0;

        xrSession.updateRenderState({
            baseLayer: new XRWebGLLayer(xrSession, this.renderEngine.gl),
          });

          xrSession.requestReferenceSpace('local').then((refSpace) => {
            this.xrReferenceSpace = refSpace.getOffsetReferenceSpace(
              new XRRigidTransform(vec3.fromValues(...this.camera.pos), vec3.fromValues(0,0,0)),
            );
            Controllers.refSpace = refSpace;
            animationFrameRequestID = xrSession.requestAnimationFrame(render.bind(this));
          });
          
        // Draw the scene repeatedly
        function render(now, frame) {
            this.frame = frame;
            const gl = this.renderEngine.gl;
            const session = frame.session;
            let adjustedRefSpace = this.camera.applyViewerControls(this.xrReferenceSpace);
            animationFrameRequestID = session.requestAnimationFrame(render.bind(this));
           let pose = frame.getViewerPose(adjustedRefSpace);

            now *= 0.001; // convert to seconds

          Controllers.updateControllers(frame, this.xrReferenceSpace);

            const glLayer = session.renderState.baseLayer;

            gl.bindFramebuffer(gl.FRAMEBUFFER, glLayer.framebuffer);
            LogGLError("bindFrameBuffer", gl);
            
            let deltaTime = now - then;
    
            then = now;

            // Rotate all objects around their y axes - might not work with VR
            //console.log(deltaTime);
            //for (const [_, geometryCtrllerList] of Object.entries(geometryControllers)) {
            //    geometryCtrllerList.forEach(geometryController => {geometryController.updateTimeDependentComponents(now, deltaTime)});
            // }
           
            
            gl.clearColor(0.0, 0.0, 0.0, 1.0); 
            gl.clearDepth(1.0); 
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL); 
            LogGLError("glClear", gl);
        
            // Clear the canvas before we start drawing on it.
        
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            let cur = Date.now();

            for (const view of pose.views) {
                const viewport = glLayer.getViewport(view);
                gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
                LogGLError(`Setting viewport for eye: ${view.eye}`, gl);
                gl.canvas.width = viewport.width * pose.views.length;
                gl.canvas.height = viewport.height;

                renderEngine.renderShaders(view, geometryControllers);

              }
            current = Date.now();
        }
        
    }
}



function LogGLError(where, gl) {
    let err = gl.getError();
    if (err) {
      console.error(`WebGL error returned by ${where}: ${err}`);
    }
  }

  