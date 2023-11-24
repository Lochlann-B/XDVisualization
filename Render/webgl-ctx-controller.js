
function setTextureAttribute(gl, textureBuffer, textureCoord) {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;

    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.vertexAttribPointer(
      textureCoord,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );
    gl.enableVertexAttribArray(textureCoord);
  }

  function setColorAttribute(gl, colourBuffer, vertexColour) {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;

    gl.bindBuffer(gl.ARRAY_BUFFER, colourBuffer);
    gl.vertexAttribPointer(
        vertexColour,
        numComponents,
        type,
        normalize,
        stride,
        offset,
    );
    gl.enableVertexAttribArray(vertexColour);
  }
  
  function setPositionAttribute(gl, positionBuffer, vertexPosition) {
    const numComponents = 3;
    const type = gl.FLOAT; 
    const normalize = false;
    const stride = 0; 
 
    const offset = 0; 
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(
      vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset,
    );
    gl.enableVertexAttribArray(vertexPosition);
  }

function setTextPositionAttribute(gl, positionBuffer, vertexPosition) {
    const numComponents = 2; 
    const type = gl.FLOAT; 
    const normalize = false; 
    const stride = 0; 
   
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(
      vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset,
    );
    gl.enableVertexAttribArray(vertexPosition);
}

  export { setTextureAttribute, setPositionAttribute, setColorAttribute, setTextPositionAttribute };