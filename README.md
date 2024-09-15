# XDVisualization
A VR visualization of multi-dimensional functions. Built using WebXR and WebGL.

A video demo can be found [here](https://lochlann-b.github.io/XDVisualisation/), and the page itself can be found [here](https://lochlann-b.github.io/XDVisualization/).

To run, a PCVR headset is ideal - or you can use a debug emulator extension such as the WebXR API Emulator for both Chrome and Firefox. To use it, open Inspect Element and click on the WebXR tab.

Standalone VR works, but expect framerate drops.

## Information

This application takes a 'slicing' approach to higher-dimensional functions. 

For example, the 4D function f(x,y,z) = x + y + z would be visualised in 3D by fixing one of the variables, say, x = 1, and then plotting w = 1 + y + z, with y and z being the planar (flat - X and Y) axes and w being the output (up - Z) axis.
Then, the behaviour of the graph across the 4th dimension can be seen by changing the fixed x value and observing how the shape of the graph changes with time.

For a higher dimension function - say, s(u,t,w,v,r) = sin(ut)^w + cos(vt)^r, which is a 6D function, then we would need to take 'slices' (i.e., fix) any 3 of the variables to particular values.

The code has support for a projection-based approach with points, but this is not accessible in the application.


## UI Information

Beside the main set of axes is a panel of information. It lists the function being plotted; ranges of the axes; which variable indices are being 'sliced' (fixed); the values that these slices are currently taking; and which slice index the user has selected for modification.

### What are slice indices?

Consider the function f(b,c,d,e) = b + c + d + e. 
The program first identifies all the variables in the argument - b,c,d,e, and gives them an index: b - 0, c - 1, etc., from left-to-right. These are the variable indices.
When the function slices (sets to a fixed value) some of the variables, it records the indices of each variable being sliced. 

For example, if b and c are both fixed to 0, then the slice indices are 0 and 1, and the slice values are both 0. The function being plotted would then be a = 0 + 0 + d + e.
If c and e are fixed to -10 and 5.4 respectively, then the slice indices are 1 and 3, and the slice values are -10 (for index 1, c) and 5.4 (for index 3, e). The function being plotted would then be a = b -10 + d + 5.4.

In the UI, 'Filled arg indexes' refer to the slice indices (which variables are being fixed), and 'Filled arg values' are the values that those sliced variables actually take. 'Current Slice index' refers to the single variable that the user has selected to modify the slice value of.


By default, the program fixes *all but the last two variables on the RHS*. There is currently no way to change this besides rewriting the function in the code. The controls for changing which sliced-variable you want to modify, and for changing the value of this variable, are found below.

The remaining two variables are used in the 3D plot, whose values vary on the X and Y axes, in that order.

The output of the entire function is on the Z (up) axis.



## Controls

### For WebXR API Emulator

<ul>
  <li>To move: move the virtual headset</li>
  <li>To decrease the scale of all axes by 10%: Right controller, 'select button'</li>
  <li>To increase the scale of all axes by 10%: Left controller, 'select button'</li>
  <li>To increase the value of the selected index slice: Right controller, squeeze button</li>
</ul>

Due to the limitations of the emulator, all other controls are inaccessible.

### For Meta Quest 3

<ul>
  <li>To decrease the scale of all axes by 10%: Right stick in</li>
  <li>To increase the scale of all axes by 10%: Left stick in</li>
  <li>To increase the value of the selected variable index slice: Right controller, trigger</li>
  <li>To decrease the value of the selected variable index slice: Right controller, squeeze</li>
  <li>To change selected slice index: Right controller, A</li>
  <li>To move the graph: Hold left trigger and move left hand</li>
  <li>To rotate the graph about the Z (up) axis: Hold left squeeze and move left hand to the left or right</li>
</ul>
