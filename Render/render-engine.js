import { GraphShader } from "./Shaders/graph-shaders.js";
import { PointShader } from "./Shaders/point-shader.js";
import { LineShader } from "./Shaders/line-shader.js";
import { BillBoardShader } from "./Shaders/billboard-shaders.js";

export class RenderEngine {
    canvas = undefined; 
    // Initialize the GL context
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

        // Set clear color to black, fully opaque
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // Clear the color buffer with specified clear color
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

        // TODO: move this gl stuff over to glctxcontroller
        //gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
        gl.clearDepth(1.0); // Clear everything
        gl.enable(gl.DEPTH_TEST); // Enable depth testing
        gl.depthFunc(gl.LEQUAL); // Near things obscure far things
        //gl.enable(gl.CULL_FACE);
        //gl.disable(gl.BLEND);
        //gl.depthMask(true);
    
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
    
        // note: glmatrix.js always has the first argument
        // as the destination to receive the result.
        //mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

        //const viewMatrix = mat4.create();
        const viewMatrix = view.transform.inverse.matrix;
        mat4.scale(viewMatrix, viewMatrix, vec3.fromValues(5.0, 5.0, 5.0));

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
            for (const geometryInfo of geometryControllers[type]) {
                const loadedBuffer = shader.getAndLoadBuffers(gl, geometryInfo);
                shader.render(gl, projectionMatrix, viewMatrix, geometryInfo, loadedBuffer);
            }
        }
        //for (let geoCtrl of geometryControllers.billboard) {
        //    const loadedBuffer = this.shaderList.billboard.getAndLoadBuffers(gl, geoCtrl);
        //    this.shaderList.billboard.render(gl, projectionMatrix, viewMatrix, geoCtrl, loadedBuffer);
        //}
        gl.flush();
    }
}