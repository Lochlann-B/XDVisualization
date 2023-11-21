import { initShaderProgram } from './shader-program-controller.js';
import { initTextureBuffer, initIndexBuffer, initPositionBuffer } from '../buffer-loader.js';
import { setTextPositionAttribute, setTextureAttribute, setPositionAttribute } from '../webgl-ctx-controller.js';
import { Shader } from './shader.js';
import { getTexture } from '../Textures/text-texture.js';
import { GeometryController } from '../../GeometryControllers/geometry-controller.js';

const vsSource = `
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
//attribute vec3 aVertexLocation;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;
//uniform vec3 uWorldCamera;

varying highp vec2 vTextureCoord;

void main(void) {
    //mat4 lookAtMatrix = lookAt(aVertexLocation, -uWorldCamera, vec3(0.0,1.0,0.0));
    //vec4 modelPos = lookAtMatrix * vec4(aVertexPosition, 1.0);

    //gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
    gl_Position = uProjectionMatrix  * vec4(aVertexPosition, 1.0);
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
                //vertexLocation: gl.getAttribLocation(shaderProgram, "aVertexLocation"),
                textureCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
            },
            uniformLocations: {
                projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
                //viewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
                uSampler: gl.getUniformLocation(shaderProgram, "uSampler"),
                //uWorldCamera: gl.getUniformLocation(shaderProgram, "uWorldCamera"),
            },
        };

        this.texture = getTexture(gl, "Arial");
    }

    // TODO: CHANGE
    getAndLoadBuffers(gl, textGeometryController) {
        const arrays = textGeometryController.arrays;

        const positionBuffer = initPositionBuffer(gl, arrays.positions);
       // const locationBuffer = initPositionBuffer(gl, textGeometryController.positions);
        const textureCoordBuffer = initTextureBuffer(gl, arrays.textureCoords);
        const indexBuffer = initIndexBuffer(gl, arrays.indices);
        
        return {
            position: positionBuffer,
            //location: locationBuffer,
            texture: textureCoordBuffer,
            indices: indexBuffer,
        };
    }

    render(gl, projectionMatrix, viewMatrix, geometryInfo, loadedBuffers) {
        // TODO: Move getting the buffer data to another function

        //mat4.targetTo(modelMatrix, [0,0,0], geometryInfo.camera.pos, [0,1,0]);
        /*
        let modelMatrix = geometryInfo.modelMatrix;
        let modelViewMatrix = mat4.create();
        let cam = geometryInfo.camera;
        let theta = Math.atan((cam.pos[1]-modelMatrix[14])/(cam.pos[0]-modelMatrix[12]));
        let phi = Math.atan((cam.pos[2]-modelMatrix[13])/((cam.pos[0]-modelMatrix[12])**2 + (cam.pos[1]-modelMatrix[14])**2));

        let rotateX = mat4.create();
        let rotateY = mat4.create();
        let rotateZ = mat4.create();

        mat4.fromXRotation(rotateX, 0);
        mat4.fromYRotation(rotateY, phi);
        mat4.fromZRotation(rotateZ, theta);

        mat4.multiply(modelViewMatrix, rotateZ, rotateY);
        mat4.multiply(modelViewMatrix, modelViewMatrix, rotateX);
        mat4.multiply(modelViewMatrix, modelViewMatrix, modelMatrix);

        mat4.mul(modelViewMatrix, viewMatrix, modelMatrix);
        */
       let modelMatrix = geometryInfo.modelMatrix;
       let worldPos = vec3.create();
       mat4.getTranslation(worldPos, modelMatrix);//[modelMatrix[12],modelMatrix[13],modelMatrix[14],1.0];
       let viewPos = vec4.fromValues(worldPos[0], worldPos[1], worldPos[2], 1.0);
       vec4.transformMat4(viewPos, viewPos, viewMatrix);

       let uProjectMat = mat4.create();
       mat4.translate(uProjectMat, projectionMatrix, vec3.fromValues(viewPos[0], viewPos[1], viewPos[2]));

       gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        // Tell WebGL how to pull out the positions from the position
        // buffer into the vertexPosition attribute.
        setTextPositionAttribute(gl, loadedBuffers.position, this.programInfo.attribLocations.vertexPosition);
        setTextureAttribute(gl, loadedBuffers.texture, this.programInfo.attribLocations.textureCoord);
        //setPositionAttribute(gl, loadedBuffers.location, this.programInfo.attribLocations.vertexLocation);
    
        // Tell WebGL which indices to use to index the vertices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, loadedBuffers.indices);
        
        // Tell WebGL to use our program when drawing
        gl.useProgram(this.programInfo.program);
        

         // Set the shader uniforms
      gl.uniformMatrix4fv(
          this.programInfo.uniformLocations.projectionMatrix,
          false,
          uProjectMat,
      );
    //  gl.uniformMatrix4fv(
    //    this.programInfo.uniformLocations.viewMatrix,
    //    false,
    //    modelViewMatrix,
    //);
        
        //gl.uniform3fv(
        //    this.programInfo.uniformLocations.uWorldCamera,
         //   geometryInfo.camera.pos,
        //);
    
        // Tell WebGL we want to affect texture unit 1
        gl.activeTexture(gl.TEXTURE1);
    
        // Bind the texture to texture unit 1
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
    
        // Tell the shader we bound the texture to texture unit 1
        gl.uniform1i(this.programInfo.uniformLocations.uSampler, 1);
        
        
    
        {
            const vertexCount = geometryInfo.arrays.indices.length;
            const type = gl.UNSIGNED_SHORT;
            const offset = 0;
            gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
            //gl.drawArrays(gl.TRIANGLES,offset,vertexCount);
        }    
    }
}