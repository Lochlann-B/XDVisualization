import { initPositionBuffer, initColorBuffer } from "../buffer-loader.js";
import { Shader } from "./shader.js";
import { initShaderProgram } from "./shader-program-controller.js";
import { setColorAttribute, setPositionAttribute } from '../webgl-ctx-controller.js';

const vsSource = `
attribute vec3 aVertexPosition;
attribute vec4 aColour;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying highp vec4 vColour;

void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition,1.0);
    vColour = aColour;
}
    `;

const fsSource = `
varying highp vec4 vColour;

void main(void) {
    gl_FragColor = vColour;
}
    `;

export class LineShader extends Shader {

    programInfo = undefined;

    initShader(gl) {
       // Initialize a shader program; this is where all the lighting
        // for the vertices and so forth is established.
        const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

        // Collect all the info needed to use the shader program.
        // Look up which attribute our shader program is using
        // for aVertexPosition and look up uniform locations.
        this.programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
                colour: gl.getAttribLocation(shaderProgram, "aColour"),
            },
            uniformLocations: {
                projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
                modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
            },
        };
    }

    getAndLoadBuffers(gl, lineGeometryController) {
        const arrays = lineGeometryController.arrays;

        const positionBuffer = initPositionBuffer(gl, arrays.positions);
        const colourBuffer = initColorBuffer(gl, arrays.colours);
        
        return {
            position: positionBuffer,
            colour: colourBuffer,
        };
    }

    render(gl, projectionMatrix, viewMatrix, geometryInfo, loadedBuffers) {
        // TODO: Move getting the buffer data to another function
        const modelMatrix = geometryInfo.modelMatrix;

        const modelViewMatrix = mat4.create();
        mat4.mul(modelViewMatrix, viewMatrix, modelMatrix);
        
          // Tell WebGL how to pull out the positions from the position
          // buffer into the vertexPosition attribute.
          setPositionAttribute(gl, loadedBuffers.position, this.programInfo.attribLocations.vertexPosition);
          setColorAttribute(gl, loadedBuffers.colour, this.programInfo.attribLocations.colour);
        
        
          // Tell WebGL to use our program when drawing
          gl.useProgram(this.programInfo.program);

          // Set the shader uniforms
        gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix,
        );
        gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix,
        );

        gl.lineWidth(10.0);
    
        {
            const vertexCount = geometryInfo.arrays.positions.length/3;
            const offset = 0;
            gl.drawArrays(gl.LINES, offset, vertexCount);
            //gl.drawArrays(gl.TRIANGLES,offset,vertexCount);
        }    
    }
}