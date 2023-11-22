import { sliceFunction } from "./slicing.js";
import { partiallyApplyByIndex } from "./slicing.js";
import { tessellate } from "./tessellator.js";


export class SlicingController {

    sliceVal = 0;
    slicedFn = sliceFunction((x,y,z) => 0, [0], [this.sliceVal]);
    idx = 0;

    graphGeomCtrller = undefined;

    initControls(fn, idx, keyInc, keyDec, graphGeomCtrller) {
        this.idx = idx;
        this.graphGeomCtrller = graphGeomCtrller;
        this.slicedFn = partiallyApplyByIndex(fn, [idx], this.sliceVal);
        document.addEventListener('keydown', (event) => {
            switch(event.key) {
              case keyInc:
                this.sliceVal -= 0.1;
                this.slicedFn = partiallyApplyByIndex(fn, [this.idx], [this.sliceVal]);
                this.graphGeomCtrller.arrays = tessellate(this.slicedFn, graphGeomCtrller.xSamples, graphGeomCtrller.ySamples, graphGeomCtrller.zSamples);
                break;
              case keyDec:
                this.sliceVal += 0.1;
                this.slicedFn = partiallyApplyByIndex(fn, [this.idx], [this.sliceVal]);
                this.graphGeomCtrller.arrays = tessellate(this.slicedFn, graphGeomCtrller.xSamples, graphGeomCtrller.ySamples, graphGeomCtrller.zSamples);
                break;
            }}
            
            );
        }
}