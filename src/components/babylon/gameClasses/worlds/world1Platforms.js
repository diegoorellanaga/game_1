import * as BABYLON from '@babylonjs/core';
// required imports
import "@babylonjs/core/Loading/loadingScreen";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Materials/Textures/Loaders/envTextureLoader";

export default class CustomWorld1 {
    constructor(gameCanvas,gameEngine,gameScene,worldMeshURL,serverLocation,isMobile=false) {
        this.canvas = gameCanvas;
        this.engine = gameEngine;
        this.scene = gameScene;
        this.animations={};
        this.worldMeshURL = worldMeshURL
        this.serverLocation=serverLocation
        this.isMobile = isMobile
    }

    async loadEnvironment() {
        try {

            if (this.isMobile) {
                this.engine.setHardwareScalingLevel(1.2); // Reduce resolution
                this.scene.autoClear = true; // Enable auto-clear
                this.scene.forceShowBoundingBoxes = false;
                this.scene.skipFrustumClipping = false;
            }


            this.lightSetup();
            await this.loadEnvironmentSolids();
         ///   this.initilizeCoins()
         //   this.lightSetup();
            this.loadSkyBox();
            this.createCamera();
            this.musicSetup()
        } catch (error) {
            console.error("Failed to load environment:", error);
            throw error;
        }
    }

    lightSetup() {
        var light2 = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, -1, 0), this.scene);
        light2.intensity = 3;
        // this.light = new BABYLON.PointLight("dir01", new BABYLON.Vector3(10, 30, 10), this.scene); //PoitLight
       //  this.light.intensity = 2500;
        // Create a directional light
        this.light = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(-1, -2, -1), this.scene);
        
        // Set light position and direction
        this.light.position = new BABYLON.Vector3(20, 40, 20);
        this.light.direction = new BABYLON.Vector3(-1, -2, -1); // Adjust direction as needed
        
        // Enable shadows for the light
        this.light.shadowEnabled = true;
        
        // Set shadow properties
        this.light.shadowMinZ = 1; // Minimum distance to start casting shadows
        this.light.shadowMaxZ = 70; // Maximum distance to cast shadows
        this.light.shadowOrthoScale = 5; //2 is hd // Orthographic scale for shadow generation //this and 2048 and 1024 in the shadowgen do resolution

        this.shadowGenerator = new BABYLON.ShadowGenerator(1024, this.light); //2048
        this.shadowGenerator.useBlurVarianceShadowMap = true;
        this.shadowGenerator.blurScale = 2;
        
        // Optionally, adjust shadow properties
        this.shadowGenerator.setDarkness(0.05);
        this.shadowGenerator.bias = 0.01;
    }

    createCamera() {
        const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 15, -10), this.scene);
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.attachControl(this.canvas, false);
        return camera;
    }

    musicSetup(){
        this.runSound = new BABYLON.Sound("Stomp", this.serverLocation+ "/assets/sounds/world2/cyber.mp3", this.scene, null, {
            loop: true,
            autoplay: true,
            volume:0.2
        });
      
    }

    async loadSkyBox() {

        var dome = new BABYLON.PhotoDome(
            "testdome",
            this.serverLocation+"/assets/"+"/images/techno2.jpg",
            {
                resolution: 32,
                size: 1000
            },
            this.scene
        );
    }

    initilizeCoins(){

        this.scene.meshes.forEach(function(mesh) {
            if (mesh.name.includes("coin_rot")) {
                mesh.isPickable = false;
                mesh.checkCollisions = false
                // Make the coins rotate
              //  var here = this
            }
        });

    }

    defineAnimations() {
        this.scene.animationGroups.forEach(animation => {
            try{
            this.animations[animation.name] = animation;
            this.animations[animation.name].stop()
            console.log(animation.name)
            if(!animation.name.includes("conrotation")){
                 this.animations[animation.name].start(true, 0.7, this.animations[animation.name].from, this.animations[animation.name].to, false)
            }
            }catch(e){
                console.log(e)
            }
        });
        console.log("world animations!!!",this.animations)
    }

    setMovingPlatforms(){
        
        // var movingMesh = this.scene.getMeshByID("platform.029")
        // movingMesh.movingPlatform = true
        // movingMesh.isPickable = true
        var movingMesh = this.scene.getMeshByID("platform.008")
        movingMesh.movingPlatform = true
        movingMesh.isPickable = true
        var movingMesh = this.scene.getMeshByID("platform.011")
        movingMesh.movingPlatform = true
        movingMesh.isPickable = true
        var movingMesh = this.scene.getMeshByID("platform.027")
        movingMesh.movingPlatform = true
        movingMesh.isPickable = true
    }

    async loadEnvironmentSolids() { //"http://localhost:8000/assets/environment29_simple.glb"
        var scale = 1.5;
        try {
            var { meshes } = await BABYLON.SceneLoader.ImportMeshAsync("", this.worldMeshURL, "", this.scene);
            meshes[0].scaling = new BABYLON.Vector3(scale, scale, scale);
          
            // //invert coorinates to match babylonjs 
            // const objRootNode = new BABYLON.TransformNode("root", this.scene);
            // objRootNode.scaling = new BABYLON.Vector3(scale, scale, -scale);//new BABYLON.Vector3(1, 1, -1);
            // objRootNode.rotation = new BABYLON.Vector3(0, BABYLON.Tools.ToRadians(180), 0);
            // meshes.forEach((mesh) => {
            //     mesh.parent = objRootNode;
            // })


            this.meshData = meshes
            this.defineAnimations()
            this.setMovingPlatforms()
 
          //  meshes[0].physicsImpostor = new BABYLON.PhysicsImpostor(meshes[0], BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.5, friction: 0.5 }, this.scene);
            this.scene.meshes.forEach(mesh => {
                if(mesh.id.includes("platform") || mesh.id.includes("Cube")){
                    mesh.receiveShadows = true;
                    mesh.checkCollisions = true;
                    mesh.isPickable = true;
                }
            });

        } catch (error) {
            console.error("Failed to load environment:", error);
            throw error;
        }
    }

    render() {
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }

    resize() {
        window.addEventListener("resize", () => {
            this.engine.resize();
        });
    }
}
