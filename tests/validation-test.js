import { compareMeshWithGroundTruth, interpolateZValue, getMinTriangleArea } from "../Validation/graph-validation.js";

export class ValidationTestRunner {
    runTests() {
        tests({
            'interpolateZValue along triangle at z value 0 returns 0': function() {
                // Arrange
                let sampledPoints = [0, 0.2, 0];
                let nearestVertices = [[1,0,0], [-1,0,0], [0,1,0]];

                // Act
                let interpolatedZ = interpolateZValue(sampledPoints, nearestVertices);

                // Assert
                eq(interpolatedZ, 0);
            }
        });

        tests({
            'min triangle area of point in triangle returns 0': function() {
                // Arrange
                let sampledPoints = [0, 0.2, 0];
                let nearestVertices = [[1,0,0], [-1,0,0], [0,1,0]];

                // Act
                let area = getMinTriangleArea(sampledPoints, nearestVertices[0], nearestVertices[1], nearestVertices[2]);

                // Assert
                let epsilon = 1e-5;
                let inEpsilon = area < epsilon
                eq(inEpsilon, true);
            }
        });
    }
}