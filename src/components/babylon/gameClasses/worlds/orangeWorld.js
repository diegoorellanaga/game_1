import * as BABYLON from '@babylonjs/core';
// required imports
import "@babylonjs/core/Loading/loadingScreen";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Materials/Textures/Loaders/envTextureLoader";

export default class CustomWorld {
    constructor(gameCanvas,gameEngine,gameScene,worldMeshURL,serverLocation) {
        this.canvas = gameCanvas;
        this.engine = gameEngine;
        this.scene = gameScene;
        this.animations={}
        this.worldMeshURL = worldMeshURL
        this.serverLocation =  serverLocation
    }

    async loadEnvironment() {
        try {
            this.lightSetup();
            await this.loadEnvironmentSolids();
         //   this.lightSetup();
         //   this.loadSkyBox();
            this.createCamera();
            this.defineAnimations()
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
        this.light.shadowMaxZ = 50; // Maximum distance to cast shadows
        this.light.shadowOrthoScale = 5; //2 is hd // Orthographic scale for shadow generation

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

    async loadSkyBox() {
        var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 2000.0 }, this.scene);
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
        skyboxMaterial.backFaceCulling = false;

        var files = [
            "https://static.wixstatic.com/media/0e7f19_fdd96566db2c4c058cf9f46659ffe267~mv2.jpg",
            "https://static.wixstatic.com/media/0e7f19_12e55e3001a14aefb321c2ab55a953d0~mv2.jpg",
            "https://static.wixstatic.com/media/0e7f19_cd8317d1098a41549f58cc050459f935~mv2.jpg",
            "https://static.wixstatic.com/media/0e7f19_ddb68d7ef7304d27ac01ebb78a3c50f5~mv2.jpg",
            "https://static.wixstatic.com/media/0e7f19_1c677b36a9d74e3a860e8b79f99163d4~mv2.jpg",
            "https://static.wixstatic.com/media/0e7f19_fc339db038284b9db9e9cff29d9d7e38~mv2.jpg",
        ];

        skyboxMaterial.reflectionTexture = BABYLON.CubeTexture.CreateFromImages(files, this.scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.disableLighting = true;

        skybox.material = skyboxMaterial;
    }

    async loadEnvironmentSolids() { //"http://localhost:8000/assets/environment27.glb"
        var scale = 1.5;
        try {
            var { meshes } = await BABYLON.SceneLoader.ImportMeshAsync("", this.worldMeshURL, "", this.scene);
            meshes[0].scaling = new BABYLON.Vector3(scale, scale, scale);

      
            meshes[0].receiveShadows = true;

          //  meshes[0].physicsImpostor = new BABYLON.PhysicsImpostor(meshes[0], BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.5, friction: 0.5 }, this.scene);
            this.scene.meshes.forEach(mesh => {
             //   console.log(mesh.id)
               // mesh.checkCollisions = true;
               // mesh.isPickable = true
            //    if(mesh.id.includes("platform")){
                    mesh.receiveShadows = true;
                    mesh.checkCollisions = true;
                    mesh.isPickable = true;
             //   }
                    //this is for physics interaction
                    //mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.5, friction: 0.5 }, this.scene);
             //   }else if(mesh.id=="Mesh_0"){
               //     console.log("set impostor to whole Mesh_0")
               //     mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.5, friction: 0.5 }, this.scene);
                //    console.log("set impostor to whole Mesh_0",mesh.physicsImpostor)
           //     }
            });

 

          var dome = new BABYLON.PhotoDome(
            "testdome",
            this.serverLocation+"/assets/"+"/images/black.jpg",
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
    }
    // defineAnimations() {
    //     this.scene.animationGroups.forEach(animation => {
    //         try{
    //         this.animations[animation.name] = animation;
    //         this.animations[animation.name].stop()
    //         this.animations[animation.name].start(true, 0.7, this.animations[animation.name].from, this.animations[animation.name].to, false)
    //         }catch(e){
    //             console.log(e)
    //         }
    //     });
    //     console.log("world animations!!!",this.animations)  //movingMesh8.movingPlatform = true;
    // }
    defineAnimations() {
        this.scene.animationGroups.forEach(animationGroup => {
            try {
                animationGroup.targetedAnimations.forEach(targetedAnimation => {
                    const mesh = targetedAnimation.target;
                    mesh.movingPlatform = true;
                });
                animationGroup.stop();
                animationGroup.start(true, 0.7, animationGroup.from, animationGroup.to, false);
            } catch (e) {
                console.log(e);
            }
        });
        console.log("world animations!!!", this.animations);
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
