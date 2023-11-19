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

varying highp vec2 vTextureCoord;

void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vTextureCoord = aTextureCoord;
}
    `;

const fsSource = `
varying highp vec2 vTextureCoord;

uniform sampler2D uSampler;

void main(void) {
    gl_FragColor = texture2D(uSampler, vTextureCoord);
}
    `;

export class GraphShader extends Shader {

    programInfo = undefined;
    texture = undefined; // TODO: Move to different class? want to parameterize textures between geometry
    // TODO: Be able to switch between colour and texture

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
                textureCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
            },
            uniformLocations: {
                projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
                modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
                uSampler: gl.getUniformLocation(shaderProgram, 'uSampler')
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

    render(gl, projectionMatrix, viewMatrix, geometryInfo, loadedBuffers) {
        // TODO: Move getting the buffer data to another function
        const modelMatrix = geometryInfo.modelMatrix;

        const modelViewMatrix = mat4.create();
        mat4.mul(modelViewMatrix, viewMatrix, modelMatrix);

          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            
        
          // Tell WebGL how to pull out the positions from the position
          // buffer into the vertexPosition attribute.
          setPositionAttribute(gl, loadedBuffers.position, this.programInfo.attribLocations.vertexPosition);
          setTextureAttribute(gl, loadedBuffers.texture, this.programInfo.attribLocations.textureCoord);
      
          // Tell WebGL which indices to use to index the vertices
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, loadedBuffers.indices);
      
        
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
    
        // Tell WebGL we want to affect texture unit 0
        gl.activeTexture(gl.TEXTURE0);
    
        // Bind the texture to texture unit 0
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
    
        // Tell the shader we bound the texture to texture unit 0
        gl.uniform1i(this.programInfo.uniformLocations.uSampler, 0);
    
        {
            const vertexCount = geometryInfo.arrays.indices.length;
            const type = gl.UNSIGNED_SHORT;
            const offset = 0;
            gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
            //gl.drawArrays(gl.TRIANGLES,offset,vertexCount);
        }    
    }
}