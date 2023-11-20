import { GeometryController } from "./geometry-controller.js";


export class AxesGeometryController extends GeometryController {
    modelMatrix = mat4.create();

    xRange = undefined;
    yRange = undefined;
    zRange = undefined;

    get arrays() {
        // TODO: could move some of the setup to an init fn to save marginal time, and then
        //       simply parameterise the ranges to move em when arrays is fetched.
        // TODO: Make not shit
        // better way: make one cross shape for each axis, and duplicate
        
        const ranges = [this.xRange, this.yRange, this.zRange];
        let lines = [];
        // Set up X, Y, Z axes
        lines = lines.concat([
            this.xRange[0],0.0,0.0, this.xRange[1],0.0,0.0,
            0.0,this.yRange[0],0.0, 0.0,this.yRange[1],0.0,
            0.0,0.0,this.zRange[0], 0.0,0.0,this.zRange[1]]);

        // Set up tenth divisions along each axis
        const rRanges = ranges.map(range => range[1]-range[0]);
        let divSz = (Math.min(...rRanges))/60;
        for (let i = 0; i < 10; i++) {
            // Don't put a line on x=y=z=0
            
            for (let j = 0; j < 3; j++) {
                let axis = [0,0,0];
                axis[j] = 1;
                lines = lines.concat(
                    this.getCross(axis, ranges[j][0]+i*rRanges[j]/10, divSz)).concat(
                    this.getCross(axis, ranges[j][1]-i*rRanges[j]/10, divSz));
            }
        }

        // Draw little arrows at the end of each axis
        // TODO (low priority)

        // Colours
        let colours = [];
        for (let i=0; i < lines.length/3; i++) {
            colours = colours.concat([1.0,1.0,0.0,1.0]);
        }

        return {positions: lines, colours: colours};
    }    

    updateTimeDependentComponents(time, deltaTime) {
        mat4.rotateY(this.modelMatrix, this.modelMatrix, deltaTime);
    }

    getCross(axis, pos, divSz) {
        let i = new Float32Array([0]); // Wrap into float32 array so we pass by ref
        let cross = [];
        
        for (let j = 0; j < 4; j++) {
            cross = cross.concat([pos*axis[0]+(1-axis[0])*(divSz*(notE(axis[0],i))),
                                pos*axis[1]+(1-axis[1])*(divSz*notE(axis[1],i)),
                                pos*axis[2]+(1-axis[2])*(divSz*notE(axis[2],i))]);
            divSz *= -1;
            if (j == 1) { notE(0,i); }
        }
        return cross;
    }
    
}

function notE(x,i) {
    // Not with effect, similar to ++ operator
    if (x) {return i[0]};
    i[0] = 1-i[0];
    return i[0];
}