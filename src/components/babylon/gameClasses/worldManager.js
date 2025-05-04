
import BaseWorld from "./worlds/baseWorld";
import CustomWorld from "./worlds/orangeWorld";
import CustomWorld1 from "./worlds/world1Platforms";
import CountrySide1 from "./worlds/countryside";
import EndlessWorld from "./worlds/endlessWorld";
import AssetsManager from "./assetsManager";

export default class WorldManager {
    constructor(gameCanvas,gameEngine,gameScene,worldMeshesURL,serverLocation,isMobile) {
     //   this.canvasId = canvasId;
        this.canvas = gameCanvas//this._createCanvas(this.canvasId);
        this.world = null;
        this.assetsManager = null;
        this.engine = gameEngine
        this.scene = gameScene
        this.worldMeshesURL = worldMeshesURL
        this.serverLocation = serverLocation
        this.isMobile = isMobile
    }

    // _createCanvas(canvas_id) {
    //     const canvas = document.createElement("canvas");
    //     canvas.style.width = "100%";
    //     canvas.style.height = "100%";
    //     canvas.id = canvas_id;
    //     document.body.appendChild(canvas);
    //     return canvas;
    // }

    async loadWorld(worldType) {
        console.log("WORLD PICKED!!!!",worldType)
        switch (worldType) {
            case 1:
                this.world = new BaseWorld(this.canvas,this.engine,this.scene,this.worldMeshesURL[0],this.serverLocation,this.isMobile);
                break;
            case 2:
                this.world = new CustomWorld(this.canvas,this.engine,this.scene,this.worldMeshesURL[1],this.serverLocation,this.isMobile);
                break;
            case 3:
                this.world = new CustomWorld1(this.canvas,this.engine,this.scene,this.worldMeshesURL[2],this.serverLocation,this.isMobile);
                break;
            case 4:
                this.world = new CountrySide1(this.canvas,this.engine,this.scene,this.worldMeshesURL[3],this.serverLocation,this.isMobile);
                break;       
            case 5:
                this.world = new EndlessWorld(this.canvas,this.engine,this.scene,this.worldMeshesURL[3],this.serverLocation,this.isMobile);
                break;                              
            default:
                console.error("Invalid world type:", worldType);
        }
        this.assetsManager = new AssetsManager(this.world.scene,this.serverLocation);
        await this.world.loadEnvironment();
    }

    render() {
        if (this.world) {
            this.world.render();
            this.world.resize();
        } else {
            console.error("No world loaded.");
        }
    }
}