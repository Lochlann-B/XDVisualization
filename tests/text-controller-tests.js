import { TextGeometryController } from "../GeometryControllers/text-billboard-controller.js";
import { ArialFontAtlas } from "../Render/Textures/text-atlas.js";
import { AxesGeometryController } from "../GeometryControllers/axes-controller.js";

export class TextControllerTestRunner {
    textController = new TextGeometryController();
    font = new ArialFontAtlas();

    runTests() {
        const textController = this.textController;
        const font = this.font;
        tests({
            'text generation on empty string yields empty geometry info': function() {
                // Arrange
                let txt = '';

                // Act
                let res = textController.gen2DGeomAndTexturesFromString(font, txt);

                eq(res.positions, "");
                eq(res.textureCoords, "");
                eq(res.indices, "");
            }
        });

        tests({
            'text generation on string returns correct geometry info': function() {
                // Arrange
                let txt = "a";

                // Act
                let res = textController.gen2DGeomAndTexturesFromString(font, txt);

                // Assert
                eq(res.positions, "-0.0005,0.009000000000000001,-0.0005,-0.0005,0.009000000000000001,0.009000000000000001,0.009000000000000001,-0.0005");
                eq(res.textureCoords, "0.6228571428571429,0.648,0.6228571428571429,0.792,0.6742857142857143,0.648,0.6742857142857143,0.792");
                eq(res.indices, "0,2,3,3,1,0");
            }
        });

        tests({
            'gen text for axes yields correct geometry infos': function() {
                // Arrange
                let ranges = {xRange: [-1,1], yRange: [-1,1], zRange: [-1,1]}
                let axes = new AxesGeometryController();
                axes.xRange = ranges.xRange;
                axes.yRange = ranges.yRange;
                axes.zRange = ranges.zRange;

                // Act
                textController.getTextGeomArraysFromAxes(axes, font, 1);
                let res = textController.arrays;

                // Assert
                eq(res.positions, "-0.0005,0.0055,-0.0005,0.003,0.0055,0.0055,0.0055,0.003,0.007,0.012,0.007,-0.0005,0.013000000000000001,0.012,0.013000000000000001,-0.0005,0.001,0.012,0.001,-0.0005,0.007,0.012,0.007,-0.0005,-0.0005,0.0055,-0.0005,0.003,0.0055,0.0055,0.0055,0.003,0.007,0.012,0.007,-0.0005,0.013000000000000001,0.012,0.013000000000000001,-0.0005,0.001,0.012,0.001,-0.0005,0.007,0.012,0.007,-0.0005,-0.0005,0.0055,-0.0005,0.003,0.0055,0.0055,0.0055,0.003,0.007,0.012,0.007,-0.0005,0.013000000000000001,0.012,0.013000000000000001,-0.0005,0.001,0.012,0.001,-0.0005,0.007,0.012,0.007,-0.0005");
                eq(res.textureCoords, "0.66,0.848,0.66,0.88,0.6914285714285714,0.848,0.6914285714285714,0.88,0.3057142857142857,0.648,0.3057142857142857,0.84,0.33714285714285713,0.648,0.33714285714285713,0.84,0.3057142857142857,0.648,0.3057142857142857,0.84,0.33714285714285713,0.648,0.33714285714285713,0.84,0.66,0.848,0.66,0.88,0.6914285714285714,0.848,0.6914285714285714,0.88,0.3057142857142857,0.648,0.3057142857142857,0.84,0.33714285714285713,0.648,0.33714285714285713,0.84,0.3057142857142857,0.648,0.3057142857142857,0.84,0.33714285714285713,0.648,0.33714285714285713,0.84,0.66,0.848,0.66,0.88,0.6914285714285714,0.848,0.6914285714285714,0.88,0.3057142857142857,0.648,0.3057142857142857,0.84,0.33714285714285713,0.648,0.33714285714285713,0.84,0.3057142857142857,0.648,0.3057142857142857,0.84,0.33714285714285713,0.648,0.33714285714285713,0.84");
                eq(res.indices, "0,2,3,3,1,0,4,6,7,7,5,4,0,2,3,3,1,0,0,2,3,3,1,0,4,6,7,7,5,4,0,2,3,3,1,0,0,2,3,3,1,0,4,6,7,7,5,4,0,2,3,3,1,0"   );
            }
        });
    }
}