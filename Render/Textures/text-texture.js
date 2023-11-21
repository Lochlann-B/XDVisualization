import { loadTexture } from "./texture-controller.js";

const fontMap = {"Arial": "../../Resources/font.png", "pixel": "../../Resources/font (1).png"};

function getTexture(gl, font) {
    //TODO: Make defensive
    // Load texture
    const texture = loadTexture(gl, fontMap[font]);
    // Flip image pixels into the bottom-to-top order that WebGL expects.

    return texture;
}

export { getTexture };