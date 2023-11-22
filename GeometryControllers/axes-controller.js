import { GeometryController } from "./geometry-controller.js";


export class AxesGeometryController extends GeometryController {
    modelMatrix = mat4.rotateX(mat4.create(), mat4.translate(mat4.create(), mat4.create(), vec3.fromValues(0,0,-5)), -Math.PI/2);

    xrange = [0,1];
    yrange = [0,1];
    zrange = [0,1];
    arrays = {positions: [], colours: []};

    set xRange(xRange) {
        this.update([1,0,0], xRange);
    }

    set yRange(yRange) {
        this.update([0,1,0], yRange);
    }

    set zRange(zRange) {
        this.update([0,0,1], zRange);
    }

    get xRange() { return this.xrange; }
    get yRange() { return this.yrange; }
    get zRange() { return this.zrange; }

    getOffsets(newRange) {
        let offsetL = 0;
        let offsetU = 0;
        if (newRange[0] > 0) {
            offsetL = -newRange[0];
        }
        if (newRange[1] < 0) {
            offsetU = -newRange[1];
        }
        return [offsetL, offsetU];
    }

    update(axis, newRange) {
        
        newRange = [Math.min(newRange[0], newRange[1]), Math.max(newRange[0], newRange[1])];

        this.xrange = [(this.xrange[0])*(1-axis[0]) + newRange[0]*axis[0],(this.xrange[1])*(1-axis[0]) + newRange[1]*axis[0]];
        this.yrange = [this.yrange[0]*(1-axis[1]) + newRange[0]*axis[1],this.yrange[1]*(1-axis[1]) + newRange[1]*axis[1]];
        this.zrange = [this.zrange[0]*(1-axis[2]) + newRange[0]*axis[2],this.zrange[1]*(1-axis[2]) + newRange[1]*axis[2]];

        let xOffsets = this.getOffsets(this.xrange);
        let yOffsets = this.getOffsets(this.yrange);
        let zOffsets = this.getOffsets(this.zrange);
        let offsets = [xOffsets, yOffsets, zOffsets];

        const ranges = [this.xrange, this.yrange, this.zrange];
        let lines = [];
        // Set up X, Y, Z axes
        lines = lines.concat([
            (this.xrange[0]+xOffsets[0]+xOffsets[1]),0.0,0.0, (this.xrange[1]+xOffsets[0]+xOffsets[1]),0.0,0.0,
            0.0,(this.yrange[0]+yOffsets[0]+yOffsets[1]),0.0, 0.0,Math.max(0,this.yrange[1]+yOffsets[0]+yOffsets[1]),0.0,
            0.0,0.0,(this.zrange[0]+zOffsets[0]+zOffsets[1]), 0.0,0.0,(this.zrange[1]+zOffsets[0]+zOffsets[1])]);

        // Set up tenth divisions along each axis
        const rRanges = ranges.map(range => range[1]-range[0]);
        let divSz = (Math.min(...rRanges))/60;
        for (let i = 0; i < 10; i++) {
            // Don't put a line on x=y=z=0
            
            for (let j = 0; j < 3; j++) {
                let axiss = [0,0,0];
                axiss[j] = 1;
                lines = lines.concat(   
                    this.getCross(axiss, ranges[j][0]+i*rRanges[j]/10 + offsets[j][0] + offsets[j][1], divSz)).concat(
                    this.getCross(axiss, ranges[j][1]-i*rRanges[j]/10 + offsets[j][0] + offsets[j][1], divSz));
            }
        }

        // Draw little arrows at the end of each axis
        // TODO (low priority)

        // Colours
        let colours = [];
        for (let i=0; i < lines.length/3; i++) {
            colours = colours.concat([1.0,1.0,0.0,1.0]);
        }

        this.arrays.positions = lines;
        this.arrays.colours = colours;
        let oldScale = vec3.create();
        mat4.getScaling(oldScale, this.modelMatrix)
        vec3.inverse(oldScale, oldScale);
        mat4.scale(this.modelMatrix, this.modelMatrix, oldScale);
        mat4.scale(this.modelMatrix, this.modelMatrix, vec3.fromValues(15/Math.abs(rRanges[0]), 15/Math.abs(rRanges[1]), 15/Math.abs(rRanges[2])));
    }

    /*
    get arrays() {
        const ranges = [this.xRange, this.yrange, this.zRange];
        let lines = [];
        // Set up X, Y, Z axes
        lines = lines.concat([
            this.xRange[0],0.0,0.0, this.xRange[1],0.0,0.0,
            0.0,this.yrange[0],0.0, 0.0,this.yrange[1],0.0,
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
    */ 

    updateTimeDependentComponents(time, deltaTime) {
        let rotY = mat4.create();
        mat4.fromRotation(rotY, deltaTime, vec3.fromValues(0,1,0));
        //mat4.rotateY(this.modelMatrix, this.modelMatrix, deltaTime);
        mat4.mul(this.modelMatrix, this.modelMatrix, rotY);
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

    getDivisionPositions() {
        let positions = [];
        const ranges = [this.xrange, this.yrange, this.zrange];

        // Set up tenth divisions along each axis
        const rRanges = ranges.map(range => range[1]-range[0]);

        for (let j = 0; j < 3; j++) {
            let axis = [0,0,0];
            axis[j] = 1;
            for (let i = 0; i < 10; i++) {
                let lower = ranges[j][0]+i*rRanges[j]/10;
                let upper = ranges[j][1]-i*rRanges[j]/10;
                positions = positions.concat([
                    axis[0]*lower, axis[1]*lower, axis[2]*lower,
                    axis[0]*upper, axis[1]*upper, axis[2]*upper]);
            }
        }
        return positions;
    }
    
}

function notE(x,i) {
    // Not with effect, similar to ++ operator
    if (x) {return i[0]};
    i[0] = 1-i[0];
    return i[0];
}