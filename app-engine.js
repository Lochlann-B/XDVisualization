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

export class AppEngine {

    geometryControllers = {graph: [], line: [], billboard: [], point: []};
    renderEngine = new RenderEngine();
    camera = new Camera();
    date = new Date();
    xrReferenceSpace = null;

    

    appInit() {
        this.camera.initControls();
        this.renderEngine.init_engine();
        

        // temp - move this
        //const graphCtrller = new GraphController();
        //graphCtrller.initGraphControllerTemp();
        //this.geometryControllers.graph.push(graphCtrller);
        //this.geometryControllers.point.push(graphCtrller);

        /*
        let fnInput = "(x,y,z,w) => {return (x)*y+z**2+w**2;}";
        let unslicedFn = turnUserInputIntoFn(fnInput);

        let slicedArgs = [1];
        let sliceVals = [1.0];
        let slicedFn = sliceFunction(unslicedFn, slicedArgs, sliceVals);
        // Todo: when doing ui for this, make sure they can't slice an arg out of range
        var slicingController = new SlicingController();
        */
        

        const axesCtrller = new AxesGeometryController();
        const xRange = [-3,3];
        const yRange = [-2,1];
        const zRange = [-0.5,4];
        axesCtrller.xRange = xRange;
        axesCtrller.yRange = yRange;
        axesCtrller.zRange = zRange;
        this.geometryControllers.line.push(axesCtrller);

        const graphCtrller = new GraphController();
        //graphCtrller.initGraphControllerTemp(slicedFn, [xRange, yRange, zRange]);
        graphCtrller.initGraphControllerTemp((x,y) => x**2 + y**2, [xRange, yRange, zRange]);
        graphCtrller.modelMatrix = axesCtrller.modelMatrix;
        this.geometryControllers.graph.push(graphCtrller);
        this.geometryControllers.point.push(graphCtrller);

        //slicingController.initControls(slicedFn, 2, 'c', 'v', graphCtrller);

        const txtCtrller = new TextGeometryController();
        txtCtrller.camera = this.camera;
        //txtCtrller.getTextGeomArraysFromAxes(axesCtrller, new ArialFontAtlas());

        
        const axisDivs = new AxesDivLabelsController();
        axisDivs.initLabelsCtrller(new ArialFontAtlas(), this.camera, axesCtrller);
        axisDivs.updateAxis("X", xRange);
        axisDivs.updateAxis("Y", yRange);
        axisDivs.updateAxis("Z", zRange);

        txtCtrller.genBillBoard(new ArialFontAtlas(), ".ab c . Oscar SMELLY BOY!!!.", [0,0,0]);
        this.geometryControllers.billboard.push(new TextBillBoardCollectionController(txtCtrller));
        //const pointCtrllertmp = new TextGeometryController();
        //pointCtrllertmp.arrays = {singularPositions: txtCtrller.positions};
        //this.geometryControllers.point.push(pointCtrllertmp);
        
        axisDivs.updateSuperTextGeometryController();
        this.geometryControllers.billboard.push(axisDivs.superTextGeometryController);
        //this.geometryControllers.billboard = this.geometryControllers.billboard.concat(axisDivs.axisMap["X"]);
        //this.geometryControllers.billboard = this.geometryControllers.billboard.concat(axisDivs.axisMap["Y"]);
        //this.geometryControllers.billboard = this.geometryControllers.billboard.concat(axisDivs.axisMap["Z"]);


        //navigator.xr.requestSession("inline").then(this.renderEngine.init_engine);
    }

    appLoop(session) {
        
        let xrSession = session;

        let then = 0;
        let animationFrameRequestID = 0;

        const geometryControllers = this.geometryControllers;
        const renderEngine = this.renderEngine;
        const camera = this.camera;
        let current = 0;

        xrSession.updateRenderState({
            baseLayer: new XRWebGLLayer(xrSession, this.renderEngine.gl),
          });

          xrSession.requestReferenceSpace("local").then((refSpace) => {
            this.xrReferenceSpace = refSpace.getOffsetReferenceSpace(
              new XRRigidTransform(vec3.fromValues(...this.camera.pos), vec3.create()),
            );
            animationFrameRequestID = xrSession.requestAnimationFrame(render.bind(this));
          });

        //requestAnimationFrame(render);

        // Draw the scene repeatedly
        function render(now, frame) {
            const gl = this.renderEngine.gl;
            const session = frame.session;
            let adjustedRefSpace = this.camera.applyViewerControls(this.xrReferenceSpace);
            animationFrameRequestID = session.requestAnimationFrame(render.bind(this));
            let pose = frame.getViewerPose(adjustedRefSpace);
            now *= 0.001; // convert to seconds
            //console.log("ANIMATION FRAME REQUESTED. TIME TAKEN: ", Date.now() - current);
            //console.log("NEW RENDER CYCLE AT ", now);

            const glLayer = session.renderState.baseLayer;

            gl.bindFramebuffer(gl.FRAMEBUFFER, glLayer.framebuffer);
            LogGLError("bindFrameBuffer", gl);
            
            let deltaTime = now - then;
            //console.log("PREVIOUS CYCLE TOOK ", deltaTime);
            then = now;

            //console.log("  UPDATING TIME COMPONENTS");
            let curr = Date.now();
            //console.log(deltaTime);
            //for (const [_, geometryCtrllerList] of Object.entries(geometryControllers)) {
            //    geometryCtrllerList.forEach(geometryController => {geometryController.updateTimeDependentComponents(now, deltaTime)});
            // }
            //console.log("  UPDATING TIME COMPONENTS FINISHED. TIME TAKEN: ", Date.now() - curr);
            
            gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
            gl.clearDepth(1.0); // Clear everything
            gl.enable(gl.DEPTH_TEST); // Enable depth testing
            gl.depthFunc(gl.LEQUAL); // Near things obscure far things
            LogGLError("glClear", gl);
            //gl.enable(gl.CULL_FACE);
            //gl.disable(gl.BLEND);
            //gl.depthMask(true);
        
            // Clear the canvas before we start drawing on it.
        
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            let cur = Date.now();
            //console.log("  NOW RENDERING SHADERS... ");
            for (const view of pose.views) {
                const viewport = glLayer.getViewport(view);
                gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
                LogGLError(`Setting viewport for eye: ${view.eye}`, gl);
                gl.canvas.width = viewport.width * pose.views.length;
                gl.canvas.height = viewport.height;
                //renderScene(gl, view, programInfo, buffers, texture, deltaTime);
                
                renderEngine.renderShaders(view, geometryControllers);
              }
           // renderEngine.renderShaders(camera, geometryControllers);
            //console.log("  RENDERING FINISHED. TIME TAKEN: ", Date.now() - cur);

            //console.log("REQUESTING NEW ANIMATION FRAME... ", Date.now());
            //console.log("\n");
            current = Date.now();
            //session.requestAnimationFrame(render);
        }
        
    }
}

function LogGLError(where, gl) {
    let err = gl.getError();
    if (err) {
      console.error(`WebGL error returned by ${where}: ${err}`);
    }
  }