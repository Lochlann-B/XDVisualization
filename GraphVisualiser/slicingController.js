import { sliceFunction } from "./slicing.js";
import { partiallyApplyByIndex } from "./slicing.js";
import { tessellate } from "./tessellator.js";


export class SlicingController {

    sliceVals = [];
    unSlicedFn = (x,y,z) => 0;
    _slicedFn = sliceFunction(this.unSlicedFn, [0], [this.sliceVal]);
    filledIdxs = [];

    constructor(unSlicedFn) {
      this.unSlicedFn = unSlicedFn;
      let argLen = unSlicedFn.length;
      this.sliceVals = new Array(argLen-2).fill(0);
      this.filledIdxs = new Array(argLen-2);
      this.sliceVals.forEach((_,idx) => this.filledIdxs[idx] = idx);
    }
    
    sliceFn() {
      this.slicedFn = sliceFunction(this.unSlicedFn, this.filledIdxs, this.sliceVals);
    }

    get slicedFn() { return sliceFunction(this.unSlicedFn, this.filledIdxs, this.sliceVals); }

    set slicedFn(fn) { this._slicedFn = fn; }

    graphGeomCtrller = undefined;

    initControls(fn, idx, keyInc, keyDec, graphGeomCtrller) {
        this.idx = idx;
        this.graphGeomCtrller = graphGeomCtrller;
        this.slicedFn = partiallyApplyByIndex(fn, filledIdxs, sliceVals);
        document.addEventListener('keydown', (event) => {
            switch(event.key) {
              case keyInc:
                this.sliceVal -= 0.1;
                this.slicedFn = partiallyApplyByIndex(fn, [this.idx], [this.sliceVal]);
                //this.graphGeomCtrller.arrays = tessellate(this.slicedFn, graphGeomCtrller.xSamples, graphGeomCtrller.ySamples, graphGeomCtrller.zSamples);
                break;
              case keyDec:
                this.sliceVal += 0.1;
                this.slicedFn = partiallyApplyByIndex(fn, [this.idx], [this.sliceVal]);
                //this.graphGeomCtrller.arrays = tessellate(this.slicedFn, graphGeomCtrller.xSamples, graphGeomCtrller.ySamples, graphGeomCtrller.zSamples);
                break;
            }}
            
            );
        }
}