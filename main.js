import { AppEngine } from "./app-engine.js";

function main() {
    const appEngine = new AppEngine();
    appEngine.appInit();

    appEngine.appLoop();
}

main();