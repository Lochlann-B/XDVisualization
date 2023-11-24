import { initShaderProgram } from './shader-program-controller.js';
import { initTextureBuffer, initIndexBuffer, initPositionBuffer } from '../buffer-loader.js';
import { setTextPositionAttribute, setTextureAttribute, setPositionAttribute } from '../webgl-ctx-controller.js';
import { Shader } from './shader.js';
import { getTexture } from '../Textures/text-texture.js';
import { GeometryController } from '../../GeometryControllers/geometry-controller.js';

const vsSource = `
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aVertexLocation;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
//uniform vec3 uWorldCamera;

varying highp vec2 vTextureCoord;

mat4 translate(mat4 m, vec3 t) {
    m[3][0] = m[0][0]*t.x + m[1][0]*t.y + m[2][0]*t.z + m[3][0];
    m[3][1] = m[0][1]*t.x + m[1][1]*t.y + m[2][1]*t.z + m[3][1];
    m[3][2] = m[0][2]*t.x + m[1][2]*t.y + m[2][2]*t.z + m[3][2];
    m[3][3] = m[0][3]*t.x + m[1][3]*t.y + m[2][3]*t.z + m[3][3];
    return m;
}

void main(void) {
    vec4 viewPos = uViewMatrix * vec4(aVertexLocation, 1.0);

    mat4 mvpMatrix = translate(uProjectionMatrix, viewPos.xyz);

    gl_Position = mvpMatrix  * vec4(aVertexPosition, 1.0);
    vTextureCoord = aTextureCoord;
}
    `;

const fsSource = `
varying highp vec2 vTextureCoord;

uniform sampler2D uSampler;

void main(void) {
    gl_FragColor = texture2D(uSampler, vTextureCoord);// + vec4(1.0,1.0,1.0,1.0);
}
    `;

export class BillBoardShader extends Shader {

    programInfo = undefined;
    texture = undefined; 

    initShader(gl) {

        const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

        this.programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
                vertexLocation: gl.getAttribLocation(shaderProgram, "aVertexLocation"),
                textureCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
            },
            uniformLocations: {
                projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
                viewMatrix: gl.getUniformLocation(shaderProgram, "uViewMatrix"),
                uSampler: gl.getUniformLocation(shaderProgram, "uSampler"),
            },
        };

        this.texture = getTexture(gl, "Arial");
    }


    getAndLoadBuffers(gl, textGeometryController) {
        const arrays = textGeometryController.arrays;
      
        // extract out the translation vector in the model matrix, transform it for e.g. scaling, and pass vector to shaders
        let worldPoses = textGeometryController.modelMatrices.map(modelMat => {let pModelMat = mat4.create(); mat4.mul(pModelMat, textGeometryController.parentModelMatrix, modelMat); let tVec = vec3.create(); mat4.getTranslation(tVec, modelMat); let tVect4 = vec4.fromValues(tVec[0], tVec[1], tVec[2], 1.0); vec4.transformMat4(tVect4, tVect4, textGeometryController.parentModelMatrix); return tVect4}).reduce((acc, cur) => acc.concat([cur[0], cur[1], cur[2]]), []);
        
        const positionBuffer = initPositionBuffer(gl, arrays.positions);
        const locationBuffer = initPositionBuffer(gl, worldPoses);
        const textureCoordBuffer = initTextureBuffer(gl, arrays.textureCoords);
        const indexBuffer = initIndexBuffer(gl, arrays.indices);
        
        return {
            position: positionBuffer,
            location: locationBuffer,
            texture: textureCoordBuffer,
            indices: indexBuffer,
        };
    }

    setUniformsAndState(gl, projectionMatrix, viewMatrix) {

        // Tell WebGL to use our program when drawing
        gl.useProgram(this.programInfo.program);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.depthMask(false);
        gl.disable(gl.DEPTH_TEST);

           // Set the shader uniforms
      gl.uniformMatrix4fv(
        this.programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix,
    );
    gl.uniformMatrix4fv(
      this.programInfo.uniformLocations.viewMatrix,
      false,
      viewMatrix,
      );
    
  
      // Tell WebGL we want to affect texture unit 1
      gl.activeTexture(gl.TEXTURE1);
  
      // Bind the texture to texture unit 1
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
  
      // Tell the shader we bound the texture to texture unit 1
      gl.uniform1i(this.programInfo.uniformLocations.uSampler, 1);
    }

    render(gl, projectionMatrix, viewMatrix, geometryInfo, loadedBuffers) {

        setTextPositionAttribute(gl, loadedBuffers.position, this.programInfo.attribLocations.vertexPosition);
        setTextureAttribute(gl, loadedBuffers.texture, this.programInfo.attribLocations.textureCoord);
        setPositionAttribute(gl, loadedBuffers.location, this.programInfo.attribLocations.vertexLocation);
    
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, loadedBuffers.indices);
        
        
    
        {
            const vertexCount = geometryInfo.arrays.indices.length;
            const type = gl.UNSIGNED_SHORT;
            const offset = 0;
            gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
            //gl.drawArrays(gl.TRIANGLES,offset,vertexCount);
        }    
    }
}