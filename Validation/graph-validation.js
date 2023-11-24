

// Function to find nearest vertices in the mesh for a given point
function findNearestVertices(sampledPoint, meshVertices) {
    // Implement logic to find closest vertices in the mesh to the sampled point
    // Return indices or references to the nearest vertices
    // You might use distance calculations (e.g., Euclidean distance) to find the closest vertices
    // For simplicity, let's assume you have a function to calculate distances

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

        if(ADiff == 0) { return [v0, v1, v2]; }

        let triangleCentre = [(v0[0] + v1[0] + v2[0])/3, (v0[1] + v1[1] + v2[1])/3];
        let distToTriangleCentre = Math.hypot(triangleCentre[0]-sampledPoint[0], triangleCentre[1]-sampledPoint[1]);

        if (distToTriangleCentre < smallestDistance) {
            closestVertices = [v0, v1, v2];
            smallestDistance = distToTriangleCentre;
        }
    }

    return closestVertices;
}

function getTriangleArea(x1,y1,x2,y2,x3,y3) {
    return Math.abs((x1*(y3-y2) + x2*(y3-y1) + x3*(y1-y2))/2.0);
}

function getMinTriangleArea(vTest, v1, v2, v3) {
    let ATotal = getTriangleArea(v1[0],v1[1],v2[0],v2[1],v3[0],v3[1]);

    let AP1 = getTriangleArea(vTest[0],vTest[1],v2[0],v2[1],v3[0],v3[1]);

    let AP2 = getTriangleArea(v1[0],v1[1],vTest[0],vTest[1],v3[0],v3[1]);

    let AP3 = getTriangleArea(v1[0],v1[1],v2[0],v2[1],vTest[0],vTest[1]);

    return Math.abs(ATotal - (AP1 + AP2 + AP3));
}

// Function to perform interpolation and estimate z-value at the sampled point
function interpolateZValue(sampledPoint, nearestVertices) {
    // Implement interpolation logic (e.g., linear interpolation, barycentric coordinates)
    // Use the nearest vertices and their properties (e.g., z-values) to estimate the z-value at the sampled point

    // Perform linear interpolation using the z-values of nearest vertices

    // Calculate weights for linear interpolation (e.g., using barycentric coordinates)
    // This might involve determining the area weights or ratios based on distances

    // Perform linear interpolation to estimate the z-value at the sampled point
    // For simplicity, let's say the z-value is directly proportional to the distance from the nearest vertex
    // const totalDistance = nearestVertices.reduce((res, v) => res + Math.hypot(v[0]-sampledPoint[0], v[1]-sampledPoint[1], v[2]-sampledPoint[2]), 0);
    // const weights = nearestVertices.map(v =>
    //     1 - Math.hypot(v[0]-sampledPoint[0], v[1]-sampledPoint[1], v[2]-sampledPoint[2]) / totalDistance
    // );

    let v1 = nearestVertices[0];
    let v2 = nearestVertices[1];
    let v3 = nearestVertices[2];
    let P = sampledPoint;
    // Use barycentric coordinates to find weights for interpolating Z:
    const W1 = ((v2[1]-v3[1])*(P[0]-v3[0]) + (v3[0]-v2[0])*(P[1]-v3[1]))/((v2[1]-v3[1])*(v1[0]-v3[0]) + (v3[0]-v2[0])*(v1[1]-v3[1]));
    const W2 = ((v3[1]-v1[1])*(P[0]-v3[0]) + (v1[0]-v3[0])*(P[1]-v3[1]))/((v2[1]-v3[1])*(v1[0]-v3[0]) + (v3[0]-v2[0])*(v1[1]-v3[1]));
    const W3 = 1 - W1 - W2;

    // Perform interpolation for z-value
    // const interpolatedZ = nearestVertices.reduce(
    //     (acc, vertex, index) => acc + vertex[2] * weights[index],
    //     0
    // );
    const interpolatedZ = v1[2]*W1 + v2[2]*W2 + v3[2]*W3;

    return interpolatedZ;
}

// Function to compare sampled z-values between ground truth and mesh
function compareMeshWithGroundTruth(groundTruthFunction, mesh, numSamples, xRange, yRange) {
    let sumSquaredError = 0;
    let vertices = [];
        for(let i = 0; i < mesh.indices.length/3; i += 3) {
            vertices.push([mesh.positions[3*mesh.indices[i]], mesh.positions[3*(mesh.indices[i])+1], mesh.positions[3*(mesh.indices[i])+2]]);
        }

    for (let i = 0; i < numSamples; i++) {
        const sampledX = xRange[0] + (xRange[1]-xRange[0])*Math.random();
        const sampledY = yRange[0] + (yRange[1]-yRange[0])*Math.random();
        const truthZ = groundTruthFunction(sampledX, sampledY);

        const sampledPoint = [sampledX, sampledY, truthZ];
        
        const nearestVertices = findNearestVertices(sampledPoint, vertices);
        const interpolatedZ = interpolateZValue(sampledPoint, nearestVertices);

        sumSquaredError += Math.pow(interpolatedZ - truthZ, 2);
    }

    const meanSquaredError = sumSquaredError / numSamples;
    const rmse = Math.sqrt(meanSquaredError);
    return rmse;
};

export {compareMeshWithGroundTruth};