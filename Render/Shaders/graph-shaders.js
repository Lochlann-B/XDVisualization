import { initShaderProgram } from './shader-program-controller.js';
import { getGraphTexture } from '../Textures/graph-texture.js';
import { initColorBuffer, initTextureBuffer, initIndexBuffer, initPositionBuffer } from '../buffer-loader.js';
import { setColorAttribute, setPositionAttribute, setTextureAttribute } from '../webgl-ctx-controller.js';
import { Shader } from './shader.js';

const vsSource = `
attribute vec4 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform highp float uZMin;
uniform highp float uZMax;

varying highp vec2 vTextureCoord;
varying mediump float vZVal;
varying mediump float vRawZ;

void main(void) {
   // mediump float near = uProjectionMatrix[2][3] / (uProjectionMatrix[1][2] - 1.0);
    //mediump float far = uProjectionMatrix[2][3] / (uProjectionMatrix[1][2] + 1.0);

    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vTextureCoord = aTextureCoord;
    vZVal = (aVertexPosition.z - uZMin)/(uZMax - uZMin);
    vRawZ = aVertexPosition.z;
}
    `;

const fsSource = `
precision mediump float;
varying highp vec2 vTextureCoord;
varying mediump float vZVal;
varying mediump float vRawZ;

uniform sampler2D uSampler;

vec3 rainbowGradient(float value) {
    float hue = value * 5.0; // Scale the normalized value to fit the rainbow (0-5)

    float r = clamp(abs(hue - 3.0) - 1.0, 0.0, 1.0);
    float g = clamp(2.0 - abs(hue - 2.0), 0.0, 1.0);
    float b = clamp(2.0 - abs(hue - 4.0), 0.0, 1.0);

    return vec3(r, g, b);
}

void main(void) {
    vec4 texCol = texture2D(uSampler, vTextureCoord);
    texCol.w = 0.5;
    gl_FragColor = vec4(0.5*texCol.xyz + 0.5*rainbowGradient(vZVal), 1.0);
    if(mod(vRawZ,0.5) < 0.01) {
        gl_FragColor = vec4(0.3, 0.3, 0.3, 1.0);
    }
}
    `;

export class GraphShader extends Shader {

    programInfo = undefined;
    texture = undefined; 

    initShader(gl) {
        const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

        this.programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
                textureCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
            },
            uniformLocations: {
                projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
                modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
                uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
                zMin: gl.getUniformLocation(shaderProgram, "uZMin"),
                zMax: gl.getUniformLocation(shaderProgram, "uZMax"),
            },
        };

        this.texture = getGraphTexture(gl);
    }

    getAndLoadBuffers(gl, graphGeometryController) {
        const arrays = graphGeometryController.arrays;

        const positionBuffer = initPositionBuffer(gl, arrays.positions);
        const textureCoordBuffer = initTextureBuffer(gl, arrays.texCoords);
        const indexBuffer = initIndexBuffer(gl, arrays.indices);
        
        return {
            position: positionBuffer,
            texture: textureCoordBuffer,
            indices: indexBuffer,
        };
    }

    setUniformsAndState(gl, projectionMatrix, viewMatrix) {
        gl.useProgram(this.programInfo.program);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.depthMask(true);

          // Set the shader uniforms
          gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix,
        );
        
        
    
        // Tell WebGL we want to affect texture unit 0
        gl.activeTexture(gl.TEXTURE0);
    
        // Bind the texture to texture unit 0
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
    
        // Tell the shader we bound the texture to texture unit 0
        gl.uniform1i(this.programInfo.uniformLocations.uSampler, 0);
    }

    render(gl, projectionMatrix, viewMatrix, geometryInfo, loadedBuffers) {
        // TODO: Move getting the buffer data to another function
        const modelMatrix = geometryInfo.modelMatrix;

        const modelViewMatrix = mat4.create();
        mat4.mul(modelViewMatrix, viewMatrix, modelMatrix);

        
          setPositionAttribute(gl, loadedBuffers.position, this.programInfo.attribLocations.vertexPosition);
          setTextureAttribute(gl, loadedBuffers.texture, this.programInfo.attribLocations.textureCoord);
      
          // Tell WebGL which indices to use to index the vertices
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, loadedBuffers.indices);
      


          gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix,
        );

        gl.uniform1f(
            this.programInfo.uniformLocations.zMin,
            geometryInfo.arrays.zRanges[0]
        );
        gl.uniform1f(
            this.programInfo.uniformLocations.zMax,
            geometryInfo.arrays.zRanges[1]
        );
    
        {
            const vertexCount = geometryInfo.arrays.indices.length;
            const type = gl.UNSIGNED_SHORT;
            const offset = 0;
            gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    
        }    
    }
}