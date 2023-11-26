


function findNearestVertices(sampledPoint, meshVertices) {
    // Initialize with two closest vertices (assuming a triangle mesh)
    let closestVertices = [];
    let smallestDistance = Infinity;
    for (let i = 0; i < meshVertices.length; i += 3) {
        // Get the next triangle vertices
        const v0 = meshVertices[i];
        const v1 = meshVertices[i+1];
        const v2 = meshVertices[i+2];

        // Calculate triangle area diff - if 0, then point inside triangle and triangle is necessarily nearest vertices
        const ADiff = getMinTriangleArea(sampledPoint, v0, v1, v2);
        
        let epsilon = 1e-5;
        if(ADiff < epsilon) { return [v0, v1, v2]; }

        let triangleCentre = [(v0[0] + v1[0] + v2[0])/3, (v0[1] + v1[1] + v2[1])/3];
        let distToTriangleCentre = ADiff;   //Math.hypot(triangleCentre[0]-sampledPoint[0], triangleCentre[1]-sampledPoint[1]);

        if (distToTriangleCentre < smallestDistance) {
            closestVertices = [v0, v1, v2];
            smallestDistance = ADiff;//distToTriangleCentre;
        }
    }
    //console.log(sampledPoint, closestVertices, smallestDistance);
    return null;
}

function getTriangleArea(x1,y1,x2,y2,x3,y3) {
    //return Math.abs((x1*(y3-y2) + x2*(y3-y1) + x3*(y1-y2))/2.0);
    let a = Math.hypot(x2-x1, y2-y1);
    let b = Math.hypot(x3-x2, y3-y2);
    let c = Math.hypot(x3-x1, y3-y1);
    let s = (a + b + c)/2;
    return Math.sqrt(s*(s-a)*(s-b)*(s-c));
}

function getMinTriangleArea(vTest, v1, v2, v3) {
    let ATotal = getTriangleArea(v1[0],v1[1],v2[0],v2[1],v3[0],v3[1]);

    let AP1 = getTriangleArea(vTest[0],vTest[1],v2[0],v2[1],v3[0],v3[1]);

    let AP2 = getTriangleArea(v1[0],v1[1],vTest[0],vTest[1],v3[0],v3[1]);

    let AP3 = getTriangleArea(v1[0],v1[1],v2[0],v2[1],vTest[0],vTest[1]);

    return Math.abs((ATotal - (AP1 + AP2 + AP3)));//, 0);
}

// Function to perform interpolation and estimate z-value at the sampled point
function interpolateZValue(sampledPoint, nearestVertices) {

    let v1 = nearestVertices[0];
    let v2 = nearestVertices[1];
    let v3 = nearestVertices[2];
    let P = sampledPoint;
    // Use barycentric coordinates to find weights for interpolating Z:
    const W1 = ((v2[1]-v3[1])*(P[0]-v3[0]) + (v3[0]-v2[0])*(P[1]-v3[1]))/((v2[1]-v3[1])*(v1[0]-v3[0]) + (v3[0]-v2[0])*(v1[1]-v3[1]));
    const W2 = ((v3[1]-v1[1])*(P[0]-v3[0]) + (v1[0]-v3[0])*(P[1]-v3[1]))/((v2[1]-v3[1])*(v1[0]-v3[0]) + (v3[0]-v2[0])*(v1[1]-v3[1]));
    const W3 = 1 - W1 - W2;

    const interpolatedZ = v1[2]*W1 + v2[2]*W2 + v3[2]*W3;

    return interpolatedZ;
}

// Function to compare sampled z-values between ground truth and mesh
function compareMeshWithGroundTruth(groundTruthFunction, mesh, numSamples, xRange, yRange) {
    let sumSquaredError = 0;
    let vertices = [];
        for(let i = 0; i < mesh.indices.length; i++) {
            vertices.push([mesh.positions[3*mesh.indices[i]], mesh.positions[3*(mesh.indices[i])+1], mesh.positions[3*(mesh.indices[i])+2]]);
        }
    //console.log(mesh.positions);
    //console.log(mesh.indices);
    //console.log(vertices);
    let count = 0;
    for (let i = 0; i < numSamples; i++) {
        const sampledX = xRange[0] + (xRange[1]-xRange[0])*Math.random();
        const sampledY = yRange[0] + (yRange[1]-yRange[0])*Math.random();
        const truthZ = groundTruthFunction(sampledX, sampledY);

        const sampledPoint = [sampledX, sampledY, truthZ];

        if(truthZ == Infinity || truthZ == undefined || isNaN(truthZ) || truthZ == 0) { continue; }
        const nearestVertices = findNearestVertices(sampledPoint, vertices);

        let undefinedPoint = false;
        for(let v of nearestVertices) {
            if(v[2] === Infinity || isNaN(v[2]) || v[2] == undefined) {
                undefinedPoint = true;
                break;
            }
        }
        if(undefinedPoint) continue;

        if(nearestVertices == null) {
            count++;
            continue;
        }
        const interpolatedZ = interpolateZValue(sampledPoint, nearestVertices);
        // if(interpolatedZ == Infinity) {
        // console.log("i ",sampledPoint, nearestVertices, interpolatedZ);
        // }
        //console.log(sampledPoint, nearestVertices, interpolatedZ);
        sumSquaredError += Math.pow((interpolatedZ - truthZ)/truthZ, 2);
    }

    const meanSquaredError = sumSquaredError / numSamples;
    const rmse = Math.sqrt(meanSquaredError);
    return rmse;
};

export {compareMeshWithGroundTruth, interpolateZValue, getMinTriangleArea};