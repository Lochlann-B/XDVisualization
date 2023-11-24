import { sliceFunction, turnUserInputIntoFn, partiallyApplyByIndex } from "../GraphVisualiser/slicing.js";

export class SliceTestRunner {
    
    runTests() {
        tests({
            'turns user input into function': function() {
                // Arrange
                let fn = "(x,y) => x+y";

                // Act
                let res = turnUserInputIntoFn(fn);

                // Assert
                eq(res.fn.toString(), "(x,y) => x+y");
            }
        });

        tests({
            'input with no args has no args': function() {
                // Arrange
                let fn = "() => 3";

                // Act
                let res = turnUserInputIntoFn(fn);

                // Assert
                eq(res.numArgs, 0);
            }
        });

        tests({
            'partially apply 2D function with one input yields function with one arg': function() {
                // Arrange
                let fn = (x,y) => x+y;
                let argIdxs = [0];
                let argVals = [0];

                // Act
                let res = partiallyApplyByIndex(fn, argIdxs, ...argVals);

                // Assert
                eq(res(0), 0);
            }
        });

        tests({
            'partially apply no args to fn with no args yields the same fn': function() {
                // Arrange
                let fn = () => 0;

                let argIdxs = [];

                // Act
                let res = partiallyApplyByIndex(fn, argIdxs);

                // Assert
                eq(res, fn);
            }
        });

        tests({
            'partially apply fn with args in strange order yields correct curried fn': function() {
                // Arrange
                let fn = (x,y,z,w) => [x,y,z,w].toString();

                let argIdxs = [0,3];
                let argVals = ["firstFill", "secondFill"];

                // Act
                let res = partiallyApplyByIndex(fn, argIdxs, ...argVals);

                // Assert
                eq(res("thirdPar, fourthPar"), "firstFill,thirdPar, fourthPar,,secondFill");
            }
        })
    }
}