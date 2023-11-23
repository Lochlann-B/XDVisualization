export class Camera {
    pos = [0.0,0.0,0.0];
    angle = {X: 0.0, Y: 0.0, Z: 0.0};

    inverseOrientation = quat.create();

    move(inc, axis) {
      vec4.scale(axis, axis, inc);
      let anglesToWorld = mat4.rotateZ(mat4.create(), mat4.rotateY(mat4.create(), mat4.fromXRotation(mat4.create(), -this.angle.X), -this.angle.Y), -this.angle.Z);
      vec4.transformMat4(axis, axis, anglesToWorld);
      this.pos[0] += axis[0];
      this.pos[1] += axis[1]; 
      this.pos[2] += axis[2];
    }

    applyViewerControls(refSpace) {
      
      quat.identity(this.inverseOrientation);
      quat.rotateX(this.inverseOrientation, this.inverseOrientation, -this.angle.X);
      quat.rotateY(this.inverseOrientation, this.inverseOrientation, -this.angle.Y);
      quat.rotateZ(this.inverseOrientation, this.inverseOrientation, -this.angle.Z);

      let newTransform = new XRRigidTransform(
        { x: -this.pos[0], y: -this.pos[1], z: -this.pos[2] },
        {
          x: this.inverseOrientation[0],
          y: this.inverseOrientation[1],
          z: this.inverseOrientation[2],
          w: this.inverseOrientation[3],
        },
      );
      
      // let newTransform = new XRRigidTransform(
      //   { x: -this.pos[0], y: -this.pos[1], z: -this.pos[2]},
      //   {
      //     x: -this.angle.X,
      //     y: -this.angle.Y,
      //     z: -this.angle.Z,
      //     w: 0.0,
      //   },
      // );

      return refSpace.getOffsetReferenceSpace(newTransform);

    }

    //temp
    initControls() {
        document.addEventListener('keydown', (event) => {
          let axis = vec4.create();
            switch(event.key) {
              case "w":
                axis[2] = 1;
                this.move(-1, axis);
                break;
              case "a":
                axis[0] = 1;
                this.move(-1, axis);
                break;
              case "s":
                axis[2] = 1;
                this.move(1, axis);
                break;
              case "d":
                axis[0] = 1;
                this.move(1, axis);
                break;
              case "r":
                axis[1] = 1;
                this.move(1, axis);
                break;
              case "f":
                axis[1] = 1;
                this.move(-1, axis);
                break;
              case "j":
                this.angle.Y -= 0.1;
                break;
              case "l":
                this.angle.Y += 0.1;
                break;
              case "i":
                this.angle.X -= 0.1;
                //this.angle.X = Math.max(-Math.PI/2, this.angle.X);
                break;
              case "k":
                this.angle.X += 0.1;
                //this.angle.X = Math.min(Math.PI, this.angle.X);
                break;
            }
          });
    }
}