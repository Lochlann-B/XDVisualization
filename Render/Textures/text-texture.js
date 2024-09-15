import { loadTexture } from "./texture-controller.js";

const fontMap = {"Arial": "/Resources/fontt.png", "pixel": "/Resources/font (1).png"};

function getTexture(gl, font) {
    // Load texture
    const texture = loadTexture(gl, fontMap[font]);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

    return texture;
}

export { getTexture };