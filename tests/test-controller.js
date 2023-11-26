import { AxesControllerTestRunner } from "./axes-controllet-tests.js";
import { TessellatorTestRunner } from "./graph-geometry-controller-test.js";
import { SliceTestRunner } from "./slicing-test.js";
import { TextControllerTestRunner } from "./text-controller-tests.js";
import { ValidationTestRunner } from "./validation-test.js";

let tests = [new SliceTestRunner(), new TessellatorTestRunner(), new TextControllerTestRunner(), new AxesControllerTestRunner(), new ValidationTestRunner() ];

for (let testClass of tests) {
    testClass.runTests();
}