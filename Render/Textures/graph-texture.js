import { loadTexture } from './texture-controller.js';

function getGraphTexture(gl) {
    // Load texture
    const texture = loadTexture(gl, "/XDVisualization/Resources/grid.png");
    
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    return texture;
}

export { getGraphTexture };