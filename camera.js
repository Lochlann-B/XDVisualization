export class Camera {
    pos = [0.0,0.0,15.0];
    angle = {X: 0.0, Y: 0.0, Z: 0.0};

    //temp
    initControls() {
        document.addEventListener('keydown', (event) => {
            switch(event.key) {
              case "w":
                this.pos[2] -= 0.1;
                break;
              case "a":
                this.pos[0] -= 0.1;
                break;
              case "s":
                this.pos[2] += 0.1;
                break;
              case "d":
                this.pos[0] += 0.1;
                break;
              case "r":
                this.pos[1] += 0.1;
                break;
              case "f":
                this.pos[1] -= 0.1;
                break;
            }
          });
    }
}