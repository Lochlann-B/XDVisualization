// input: function of type R^n -> R

function turnUserInputIntoFn(userFn) {
    const fn = eval(userFn);
    const numArgs = fn.length;

    if (fn === undefined || numArgs === undefined) {
        alert("Invalid input function! function: ", userFn);
        return;
    }

    return { fn: fn, numArgs: numArgs };
}
  
  // Function to partially apply specific arguments to the original function by their indices
  function partiallyApplyByIndex(fn, indices, ...args) {
    if(indices.length == 0) { return fn; }
    return function(...moreArgs) {
      let argArray = new Array(fn.length).fill(undefined);
      
      indices.forEach((idx, idxidx) => {
        argArray[idx] = args[idxidx];
      });

      let moreArgIdx = 0;
      for (let i = 0; i < argArray.length; i++) {
        if( argArray[i] !== undefined) { continue; }
        argArray[i] = moreArgs[moreArgIdx];
        moreArgIdx++;
      }
      return fn(...argArray); // Call the original function
    };
  }

function sliceFunction(fn, argIndices, argValues) {
    return partiallyApplyByIndex(fn, argIndices, ...argValues);
}

export { sliceFunction, turnUserInputIntoFn, partiallyApplyByIndex };