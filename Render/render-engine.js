import { GraphShader } from "./Shaders/graph-shaders.js";
import { PointShader } from "./Shaders/point-shader.js";
import { LineShader } from "./Shaders/line-shader.js";
import { BillBoardShader } from "./Shaders/billboard-shaders.js";

export class RenderEngine {
    canvas = undefined; 
    gl = undefined;
    xrSession = undefined;

    shaderList = {graph: undefined, point: undefined,  line: undefined, billboard: undefined};

    init_engine() {
        this.canvas = document.querySelector("#glcanvas");
        this.gl = this.canvas.getContext("webgl2", { xrCompatible: true });

        const gl = this.gl;

        // Only continue if WebGL is available and working
        if (gl === null) {
            alert(
                "Unable to initialize WebGL. Your browser or machine may not support it.",
            );
            return;
        }

        
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        
        gl.clear(gl.COLOR_BUFFER_BIT);

        // initialise individual shaders
        const graphShader = new GraphShader();
        graphShader.initShader(gl);
        const pointShader = new PointShader();
        pointShader.initShader(gl);
        const lineShader = new LineShader();
        lineShader.initShader(gl);
        const billBoardShader = new BillBoardShader();
        billBoardShader.initShader(gl);

        this.shaderList.graph = graphShader;
        this.shaderList.point = pointShader;
        this.shaderList.line = lineShader;
        this.shaderList.billboard = billBoardShader;
    }

    renderShaders(view, geometryControllers) {
        const gl = this.gl;

   
        gl.clearDepth(1.0); 
        gl.enable(gl.DEPTH_TEST); 
        gl.depthFunc(gl.LEQUAL); 
 
    
        // Clear the canvas before we start drawing on it.
    
        //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
        /*
        const fieldOfView = (45 * Math.PI) / 180; // in radians
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = mat4.create();
        */
       const projectionMatrix = view.projectionMatrix;
    
        const viewMatrix = view.transform.inverse.matrix;
      
        // Camera transform - this is no longer needed with VR, but keeping it here in case you want to test it in non-VR in the future
        /*
        // Create rotation matrices for each axis
        let rotationMatrixX = mat4.create();
        let rotationMatrixY = mat4.create();
        let rotationMatrixZ = mat4.create();

        // Apply rotations to the individual matrices
        mat4.fromXRotation(rotationMatrixX, camera.angle.X);
        mat4.fromYRotation(rotationMatrixY, camera.angle.Y);
        mat4.fromZRotation(rotationMatrixZ, camera.angle.Z);

        let combinedRotation = mat4.create();
        mat4.multiply(combinedRotation, rotationMatrixZ, rotationMatrixY);
        mat4.multiply(combinedRotation, combinedRotation, rotationMatrixX);

        mat4.multiply(viewMatrix, viewMatrix, combinedRotation);

        mat4.translate(
            viewMatrix,
            viewMatrix,
            camera.pos.map(coord => -coord));
        */

        for (const [type, shader] of Object.entries(this.shaderList)) {
            shader.setUniformsAndState(gl, projectionMatrix, viewMatrix);
            for (const geometryInfo of geometryControllers[type]) {
                const loadedBuffer = shader.getAndLoadBuffers(gl, geometryInfo);
                shader.render(gl, projectionMatrix, viewMatrix, geometryInfo, loadedBuffer);
            }
        }

        gl.flush();
    }
}