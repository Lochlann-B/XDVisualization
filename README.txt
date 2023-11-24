VISUALISATION OF MULTI DIMENSIONAL FUNCTIONS IN VR

To run:
Everything in this application is frontend javascript, which means you should be able to run everything straight away.
Here are the used external libraries if not:
 - webgl
 - webxr
 - glmatrix.js
 - tinytest.js (used for unit tests)

Furthermore, unit tests and validation are also front end but run on different scripts - to run them, comment out the other two javascript files in the <script> tags on index.html

This application only supports immersive-vr. however, it can also be played with using the WebXR API Emulator, which runs as a browser extension. There are keyboard controls, but some controls won't be usable by all VR devices
For testing purposes, I used a Meta Quest 3 for testing. If you have a different controller type, then some buttons may not work. WebXR API Emulator does not support all buttons.

I have not used any other VR visualisation libraries, such as three.js as per the requirements on the task selection sheet

--------------------------------------------------------------------

   CORE REQUIREMENTS 

 - Ability to take a multi-dimensional function as input, slice it at different axes, and render it in 3D - COMPLETED
 - VR Rendering of the application - COMPLETED
 - An exploration of ways to interact with the functions in VR - COMPLETED
 - Ability to project multidimensional points to 3D space and render them - COMPLETED


--------------------------------------------------------------------

    EXTENSIONS

 - Draw contour lines on the function - COMPLETED
 - Have the function sampler be able to handle discontinuities, and render neighbouring defined points as point - COMPLETED
 - Have the ability to change the current slice being modified, and its value, in real time - COMPLETED 
 - Have the ability to change the axis ranges in real-time - COMPLETED

--------------------------------------------------------------------

    VALIDATION

 - The accuracy of the graphs can be assessed empirically by comparing them to other renderers, but validator.js provides a means of comparing a graph mesh to the real surface defined by the function.
   This is done by sampling the function randomly at many points, and comparing the differences to the graph mesh, where Z values are interpolated along the bounding or nearest triangle

---------------------------------------------------------------------

   TESTS

 - Because most unit test libraries are imported with node.js, which is for backends, I used tinytest.js for simple unit testing on the modules which were responsible for geometry generation. 
   These include those for the Graph geometries, axes, text billboards, and function slicing.
 - Much of the code is to do with webGL, webXR, and the control schemes therein, meaning that unit tests won't be appropriate for these classes since the return result is only visible in the application, and can be judged empirically.

    CODE STRUCTURE

    the main workflow is:
main -> appengine (init, apploop) -> set up geometries, text, and controller inputs -> render loop in renderEngine.js

This application uses 4 WebGL shaders: triangle meshes (for the graph), points (for discontinuities in the graph), text billboards, and lines (for axes and controllers)

In addition to the render loop, the controller (VrController.js) has its own checks for input, which is polled every render cycle.
This is so that controls which manipulate mesh geometry aren't being run every frame since they are expensive.

An example function to be visualised is defined in AppEngine.init(). Change this to explore different functions (it would be trivial to add an HTML element which also updates this function input)

The app defaults to rendeirng a multi dimensional function. If you want to visualise points, then add a graphController to the list in appEngine.init(), and set the arrays to the value returned by the function in point-visualiser.js

Here are some notes on the different shaders and their functionalities:

Graph shader:

Renders a 3D mesh, given by tessellate.js. Fragment colours are based on relative Z coordinates, and contour lines are sampled every few units.


Billboard shader:

Renders a block of text such that the text is always facing the camera. Useful because the user would always expect to read the text on the axes and information panels as they move around.
The text is rendered on top of all other geometry, so the decision to turn off depth culling was deliberate. The same applies to the axes - it won't misrepresent the graph because the user can depth-percept the difference in depth between the axes and graph, which is something that is not possible outside of VR.

Line shader:

Renders the axes and their divisions. 

Point shader:

Renders discontinuous points given by either the point projector or from samples in the tessellated graph wich neighbour undefined points



Here are some of the other functionalities this application uses:

slicingController.js - defines a class which takes a multidimensional function as input, and produces slices by setting values of dimensions that are not being rendered on the graph. Uses currying to do this, and the currying can be changed dynamically (see usage in VrController.js)
tessellator.js - defines a module which, given a 3D function (R^2 -> R), samples (defined by ranges, and the number of samples) for each axis, and produces a 3D mesh which is generated by sampling the graph at each sample point, and tessellating neighbouring vertices into triangles. Where the graph goes out of bounds on Z, or is undefined, the triangle isn't rendered, and neighbouring points are rendered as points.

text-billboard-collection.js - defines a class which produces a single mesh for many 2D billboards. This class exists primarily for optimisation reasons, since the Javascript implementation on browsers do not handle garbage collection well (there is data leftover from loading the buffers in webgl, so we try to minimise how 'scattered' buffer info is by grouping meshes so as to avoid delays when the majorGC runs)
text-billboard-controller.js - defines a class which represents the geometry of a text billboard.
axes-controller.js - defines a class which represents the line geometry of the axes to be rendered, given by ranges
axes-division-labels-controller.js - defines a class which defines the text billboards of the divisions along each axis, so you can see the X, Y, Z scales on the axis

collate-info.js - a class which holds references to classes with useful information, and produces a billboard which displays this information

texture-controller.js - loads an image to be used as a texture. 
text-atlas.js - defines atlas information for textures, so that only one texture needs to be sampled for displaying text. The dictionaries were generated using a CC0 script, whose url is in a comment at the top of the class


------------------------------------------------------------------------