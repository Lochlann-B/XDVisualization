import { ArialFontAtlas } from "../Render/Textures/text-atlas.js";
import { GeometryController } from "./geometry-controller.js";

export class TextGeometryController extends GeometryController {
    modelMatrix = mat4.create();
    arrays = {positions: [], textureCoords: [], indices: []};
    positions = undefined;
    camera = undefined;

    getTextGeomArraysFromAxes(axes, fontAtlas, divs=10) {
        const ranges = [axes.xRange, axes.yRange, axes.zRange];
        let idxOffset = 0;
        let bigPosArray = [];
        let bigTextureArray = [];
        let bigIdxArray = [];

        let rawPositions = axes.getDivisionPositions();
        let positions = [];

        // Set up tenth divisions along each axis
        const rRanges = ranges.map(range => range[1]-range[0]);

        for (let j = 0; j < 3; j++) {
            for (let i = 0; i < divs; i++) {
                let rawPosIdx = (i+j*divs)*6;
                let rawCoordsL = [rawPositions[rawPosIdx], rawPositions[rawPosIdx+1], rawPositions[rawPosIdx+2]];
                let rawCoordsU = [rawPositions[rawPosIdx+3], rawPositions[rawPosIdx+4], rawPositions[rawPosIdx+5]];


                let lower = ranges[j][0]+i*rRanges[j]/divs;
                let upper = ranges[j][1]-i*rRanges[j]/divs;
                console.log(lower.toFixed(2).toString());
                let textLower = this.gen2DGeomAndTexturesFromString(fontAtlas, Math.round(lower).toString());
                let textUpper = this.gen2DGeomAndTexturesFromString(fontAtlas, Math.round(upper).toString());
                textLower.indices.map(idx => idx + idxOffset);
                idxOffset += textLower.indices.length;
                for (let a = 0; a < textLower.positions.length/2; a++) {
                    positions = positions.concat(rawCoordsL);
                }

                textUpper.indices.map(idx => idx + idxOffset);
                idxOffset += textUpper.indices.length;
                for (let a = 0; a < textUpper.positions.length/2; a++) {
                    positions = positions.concat(rawCoordsU);
                }

                bigPosArray = bigPosArray.concat(Array.from(textLower.positions));
                bigPosArray = bigPosArray.concat(Array.from(textUpper.positions));
                bigTextureArray = bigTextureArray.concat(Array.from(textLower.textureCoords));
                bigTextureArray = bigTextureArray.concat(Array.from(textUpper.textureCoords));
                bigIdxArray = bigIdxArray.concat(textLower.indices);
                bigIdxArray = bigIdxArray.concat(textUpper.indices);
            }
        }
        this.arrays = {positions: bigPosArray, textureCoords: bigTextureArray, indices: bigIdxArray};
        this.positions = positions;
    }

    gen2DGeomAndTexturesFromString(fontAtlas, s) {
        // TODO: move
        let scale = 0.001;

        let vertexCount = s.length*4;
        //let vertexCount = s.length*6;
        let indexCount = s.length*6;
        let positions = new Array(vertexCount*2);
        let texCoords = new Array(vertexCount*2);
        let indices = [];

        let maxX = fontAtlas.width;
        let maxY = fontAtlas.height;

        let vtIdx = 0;
        let idx = -1;

        let x = 0;

        for (let i = 0; i < s.length; i++) {
            let char = s[i];
            let fontCharInfo = fontAtlas.TextureAtlas(char);

            // Set up 4 vertices
            for (let xx = 0; xx < 2; xx++) {
                for (let yy = 0; yy < 2; yy++) {
                    positions[vtIdx] = scale*(x + xx*fontCharInfo.width - fontCharInfo.originX);
                    positions[vtIdx+1] = -scale*(yy*fontCharInfo.height - fontCharInfo.originY);
                    texCoords[vtIdx] = (fontCharInfo.x + xx*fontCharInfo.width-xx)/(maxX);
                    texCoords[vtIdx+1] = (fontCharInfo.y + yy*fontCharInfo.height-yy)/(maxY);
                    vtIdx += 2;
                }
            }
            

            /*
            positions[vtIdx] = scale*(x + 0*fontCharInfo.width);
            positions[vtIdx+1] = scale*(0*fontCharInfo.height);
            texCoords[vtIdx] = (fontCharInfo.x + 0*fontCharInfo.width)/(maxX);
            texCoords[vtIdx+1] = (fontCharInfo.y + 0*fontCharInfo.height)/(maxY);
            vtIdx += 2;

            positions[vtIdx] = scale*(x + 1*fontCharInfo.width);
            positions[vtIdx+1] = scale*(0*fontCharInfo.height);
            texCoords[vtIdx] = (fontCharInfo.x + 1*fontCharInfo.width-1)/(maxX);
            texCoords[vtIdx+1] = (fontCharInfo.y + 0*fontCharInfo.height)/(maxY);
            vtIdx += 2;
            positions[vtIdx] = scale*(x + 1*fontCharInfo.width);
            positions[vtIdx+1] = scale*(1*fontCharInfo.height);
            texCoords[vtIdx] = (fontCharInfo.x + 1*fontCharInfo.width-1)/(maxX);
            texCoords[vtIdx+1] = (fontCharInfo.y + 1*fontCharInfo.height-1)/(maxY);
            vtIdx += 2;
            positions[vtIdx] = scale*(x + 1*fontCharInfo.width);
            positions[vtIdx+1] = scale*(1*fontCharInfo.height);
            texCoords[vtIdx] = (fontCharInfo.x + 1*fontCharInfo.width-1)/(maxX);
            texCoords[vtIdx+1] = (fontCharInfo.y + 1*fontCharInfo.height-1)/(maxY);
            vtIdx += 2;
            positions[vtIdx] = scale*(x + 0*fontCharInfo.width);
            positions[vtIdx+1] = scale*(1*fontCharInfo.height);
            texCoords[vtIdx] = (fontCharInfo.x + 0*fontCharInfo.width)/(maxX);
            texCoords[vtIdx+1] = (fontCharInfo.y + 1*fontCharInfo.height-1)/(maxY);
            vtIdx += 2;
            positions[vtIdx] = scale*(x + 0*fontCharInfo.width);
            positions[vtIdx+1] = scale*(0*fontCharInfo.height);
            texCoords[vtIdx] = (fontCharInfo.x + 0*fontCharInfo.width)/(maxX);
            texCoords[vtIdx+1] = (fontCharInfo.y + 0*fontCharInfo.height)/(maxY);
            vtIdx += 2;
            */

            // Add 6 vertices to index array
            indices = indices.concat([idx+1, idx+3, idx+4, idx+4, idx+2, idx+1]);
            //indices = indices.concat([idx+1, idx+3, idx+2, idx+4, idx+4, idx+1]);
            idx += 4;

            x += fontCharInfo.width; //+ fontCharInfo.spacing;
            if (char === " ") {
                x += fontCharInfo.spacing;
            }
        }

        return {positions: positions, textureCoords: texCoords, indices: indices};
    }

    genBillBoard(fontAtlas, string, pos) {
        let positions = [];
        let arrays = this.gen2DGeomAndTexturesFromString(fontAtlas, string);
        for(let i = 0; i < arrays.positions.length/2; i++) {
            positions = positions.concat(pos);
        }

        let modelMatrix = mat4.create();

        mat4.translate(
            modelMatrix,
            modelMatrix,
            vec4.transformMat4(vec4.create(), vec4.fromValues(pos[0], pos[1], pos[2], 1.0), this.modelMatrix));

        this.modelMatrix = modelMatrix;
        this.arrays = arrays;
    }

}