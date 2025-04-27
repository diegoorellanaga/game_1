import * as BABYLON from '@babylonjs/core';
// required imports
import "@babylonjs/core/Loading/loadingScreen";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Materials/Textures/Loaders/envTextureLoader";

export default class CountrySide1 {
    constructor(gameCanvas,gameEngine,gameScene,worldMeshURL,serverLocation) {
        this.canvas = gameCanvas;
        this.engine = gameEngine;
        this.scene = gameScene;
        this.worldMeshURL = worldMeshURL
        this.animations={}
        this.serverLocation = serverLocation
    }

    async loadEnvironment() {
        try {
            
            await this.loadEnvironmentSolids();
            this.loadSkyBox();
            this.lightSetup();
            this.createCamera();
            this.musicSetup()
            // Placeholder for loading the skybox (no implementation in base world)
            console.log("Loading skybox for the base world...");
        } catch (error) {
            console.error("Failed to load environment:", error);
            throw error;
        }
    }

    musicSetup(){
        this.runSound = new BABYLON.Sound("Stomp", this.serverLocation+ "/assets/sounds/world3/farm.mp3", this.scene, null, {
            loop: true,
            autoplay: true,
            volume:0.2
        });
      
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
        const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 5, -10), this.scene);
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.attachControl(this.canvas, true);
        return camera;
    }

    defineAnimations() {
        // if (!this.meshData || !this.meshData.animationGroups) {
        //     console.error(this.meshData,"Mesh or animation data not loaded.");
        //     return;
        // }

        this.scene.animationGroups.forEach(animation => {
            console.log("what is animation",animation)
            this.animations[animation.name] = animation;
            this.animations[animation.name].stop()
            this.animations[animation.name].start(true, 0.7, this.animations[animation.name].from, this.animations[animation.name].to, false)
        });
        console.log("world animations!!!",this.animations)
    }

    setMovingPlatforms(){
        console.log("MESHES",this.scene)
        try{
            var movingMesh = this.scene.getMeshByID("bigMoving2_primitive0")
            movingMesh.movingPlatform = true
            movingMesh.isPickable = true
            movingMesh.receiveShadows = true;
            console.log("IT WAS!! ground.011")
            var movingMesh = this.scene.getMeshByID("bigMoving2_primitive1")
            movingMesh.movingPlatform = true
            movingMesh.isPickable = true
            movingMesh.receiveShadows = true;
            console.log("IT WAS!! ground.011")


        }catch(error){console.log(error)}

        try{
            var movingMesh = this.scene.getMeshByID("bigMoving1_primitive0")
            movingMesh.movingPlatform = true
            movingMesh.isPickable = true
            movingMesh.receiveShadows = true;
            console.log("IT WAS!! ground.011")
            var movingMesh = this.scene.getMeshByID("bigMoving1_primitive1")
            movingMesh.movingPlatform = true
            movingMesh.isPickable = true
            movingMesh.receiveShadows = true;
            console.log("IT WAS!! ground.011")
        }catch(error){console.log(error)}

        try{
            var movingMesh = this.scene.getMeshByID("littleMoving2_primitive0")
            movingMesh.movingPlatform = true
            movingMesh.isPickable = true
            movingMesh.receiveShadows = true;
            console.log("IT WAS!! ground.011")
            var movingMesh = this.scene.getMeshByID("littleMoving2_primitive1")
            movingMesh.movingPlatform = true
            movingMesh.isPickable = true
            movingMesh.receiveShadows = true;
            console.log("IT WAS!! ground.011")
        }catch(error){console.log(error)}

        try{
            var movingMesh = this.scene.getMeshByID("littleMoving_primitive0")
            movingMesh.movingPlatform = true
            movingMesh.isPickable = true
            movingMesh.receiveShadows = true;
            console.log("IT WAS!! ground.011")
            var movingMesh = this.scene.getMeshByID("littleMoving_primitive1")
            movingMesh.movingPlatform = true
            movingMesh.isPickable = true
            movingMesh.receiveShadows = true;
            console.log("IT WAS!! ground.011")
        }catch(error){console.log(error)}

    }

    async loadEnvironmentSolids() {
        // Placeholder for loading solid meshes of the base world
        console.log("Loading solid meshes of the base world...");
        var scale = 1.5;
        try {
            var { meshes } = await BABYLON.SceneLoader.ImportMeshAsync("", this.worldMeshURL, "", this.scene);
            meshes[0].scaling = new BABYLON.Vector3(scale, scale, scale);

            this.setMovingPlatforms()
            this.defineAnimations()
            this.scene.meshes.forEach(mesh => {
                console.log("meshes id",mesh.id)
                if(mesh.id.includes("platform") || mesh.id.includes("Island")){
                    mesh.receiveShadows = true;
                    mesh.checkCollisions = true;
                    mesh.isPickable = true;
                }
            });


            var dome = new BABYLON.PhotoDome(
                "testdome",
                this.serverLocation+"/assets/"+"/images/fantasyFix.jpg",
                {
                    resolution: 32,
                    size: 1000
                },
                this.scene
            );



        } catch (error) {
            console.error("Failed to load environment:", error);
            throw error;
        }
        // Add ground
       // const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 20, height: 20 }, this.scene);
    }

    loadSkyBox() {
        // Placeholder for loading the skybox (no implementation in base world)
        console.log("Loading skybox for the base world...");
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