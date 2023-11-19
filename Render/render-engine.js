import { GraphShader } from "./Shaders/graph-shaders.js";

export class RenderEngine {
    canvas = undefined; 
    // Initialize the GL context
    gl = undefined;

    shaderList = {graph: undefined, billboard: undefined, line: undefined, point: undefined};

    init_engine() {
        this.canvas = document.querySelector("#glcanvas");
        this.gl = this.canvas.getContext("webgl");

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

        this.shaderList.graph = graphShader;
    }

    renderShaders(camera, geometryControllers) {
        const gl = this.gl;

        // TODO: move this gl stuff over to glctxcontroller
        gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
        gl.clearDepth(1.0); // Clear everything
        gl.enable(gl.DEPTH_TEST); // Enable depth testing
        gl.depthFunc(gl.LEQUAL); // Near things obscure far things
    
        // Clear the canvas before we start drawing on it.
    
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
        const fieldOfView = (45 * Math.PI) / 180; // in radians
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = mat4.create();
    
        // note: glmatrix.js always has the first argument
        // as the destination to receive the result.
        mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

        const viewMatrix = mat4.create();
        mat4.translate(
            viewMatrix,
            viewMatrix,
            camera.pos.map(coord => -coord));
        mat4.rotateX(
            viewMatrix,
            viewMatrix,
            -camera.angle.X);
        mat4.rotateY(
            viewMatrix,
            viewMatrix,
            -camera.angle.Y);
        mat4.rotateZ(
            viewMatrix,
            viewMatrix,
            -camera.angle.Z);

        for (const [type, shader] of Object.entries(this.shaderList)) {
            for (const geometryInfo of geometryControllers[type]) {
                const loadedBuffer = shader.getAndLoadBuffers(gl, geometryInfo);
                shader.render(gl, projectionMatrix, viewMatrix, geometryInfo, loadedBuffer);
            }
        }
    }
}