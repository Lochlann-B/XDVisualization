import { loadTexture } from './texture-controller.js';

function getGraphTexture(gl) {
    // Load texture
    const texture = loadTexture(gl, "../../Resources/troll2.png");
    // Flip image pixels into the bottom-to-top order that WebGL expects.
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    return texture;
}

export { getGraphTexture };