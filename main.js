import { AppEngine } from "./app-engine.js";

const SESSION_TYPE = "immersive-vr";

window.addEventListener("load", onLoad);

let polyfill = null;
let xrButton = null;
let appEngine = null;
const enableForcePolyfill = false;
const xrSession = true;

function onLoad() {
  xrButton = document.querySelector("#enter-xr");
  xrButton.addEventListener("click", onXRButtonClick);

  if (!navigator.xr || enableForcePolyfill) {
    console.log("Using the polyfill");
    polyfill = new WebXRPolyfill();
  }
  setupXRButton();
}

function setupXRButton() {
    if (navigator.xr.isSessionSupported) {
      navigator.xr.isSessionSupported(SESSION_TYPE).then((supported) => {
        xrButton.disabled = !supported;
      });
    } else {
      navigator.xr
        .supportsSession(SESSION_TYPE)
        .then(() => {
          xrButton.disabled = false;
        })
        .catch(() => {
          xrButton.disabled = true;
        });
    }
  }

async function onXRButtonClick(event) {
      navigator.xr.requestSession(SESSION_TYPE).then(appEngine.appLoop.bind(appEngine));
  }

function main() {
    
    
    appEngine = new AppEngine();
    appEngine.appInit();
    
    //navigator.xr.requestSession("immersive-vr").then(appEngine.appLoop.bind(appEngine));
   // appEngine.appLoop();
}

main();