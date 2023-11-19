import { initShaderProgram } from './shader-program-controller.js';
import { getGraphTexture } from '../Textures/graph-texture.js';
import { initColorBuffer, initTextureBuffer, initIndexBuffer, initPositionBuffer } from '../buffer-loader.js';
import { setColorAttribute, setPositionAttribute, setTextureAttribute } from '../webgl-ctx-controller.js';
import { Shader } from './shader.js';

const vsSource = `
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    
    attribute vec3 aVertexPosition;

    varying mediump float value;
    
    void main() {
        vec4 mvPosition = uModelViewMatrix * vec4(aVertexPosition, 1.0);

        mediump float near = uProjectionMatrix[2][3] / (uProjectionMatrix[1][2] - 1.0);
        mediump float far = uProjectionMatrix[2][3] / (uProjectionMatrix[1][2] + 1.0);
        mediump float z = aVertexPosition[2];

        value = (z - near) / (far - near);
    
        // Apply projection matrix
        gl_Position = uProjectionMatrix * mvPosition;
        
        if (mvPosition[2] == 0.0) {
            gl_PointSize = 1.0; // Value doesn't matter since z value of 0 won't be drawn anyways
        }
        else {
            gl_PointSize = clamp(-10.0/(mvPosition[2]), 3.0, 20.0);
        }
        
    }
    `;

const fsSource = `
    precision mediump float;
    varying mediump float value;

    vec3 rainbowGradient(float value) {
        float hue = value * 5.0; // Scale the normalized value to fit the rainbow (0-5)
    
        float r = clamp(abs(hue - 3.0) - 1.0, 0.0, 1.0);
        float g = clamp(2.0 - abs(hue - 2.0), 0.0, 1.0);
        float b = clamp(2.0 - abs(hue - 4.0), 0.0, 1.0);
    
        return vec3(r, g, b);
    }

    void main(void) {
        gl_FragColor = vec4(rainbowGradient(value), 1.0);
    }
`;

export class PointShader extends Shader {

    programInfo = undefined;

    initShader(gl) {
        const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

        this.programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
            },
            uniformLocations: {
                projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
                modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
            },
        };
    }

    getAndLoadBuffers(gl, graphGeometryController) {
        const arrays = graphGeometryController.arrays;

        const positionBuffer = initPositionBuffer(gl, arrays.singularPositions);
        
        return {
            position: positionBuffer,
        };
    }

    render(gl, projectionMatrix, viewMatrix, geometryInfo, loadedBuffers) {
        if (geometryInfo.arrays.singularPositions.length < 3) {
            return;
        }

        // TODO: Move getting the buffer data to another function
        const modelMatrix = geometryInfo.modelMatrix;

        const modelViewMatrix = mat4.create();
        mat4.mul(modelViewMatrix, viewMatrix, modelMatrix);
        
          // Tell WebGL how to pull out the positions from the position
          // buffer into the vertexPosition attribute.
          setPositionAttribute(gl, loadedBuffers.position, this.programInfo.attribLocations.vertexPosition);
        
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
    
        {
            const vertexCount = geometryInfo.arrays.singularPositions.length;
            const type = gl.UNSIGNED_SHORT;
            const offset = 0;
            gl.drawElements(gl.POINTS, vertexCount, type, offset);
            //gl.drawArrays(gl.TRIANGLES,offset,vertexCount);
        }    
    }
}