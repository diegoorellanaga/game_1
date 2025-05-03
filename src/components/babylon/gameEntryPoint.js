import React, { useRef, useEffect, useState } from 'react'

// import {Engine, Scene, MeshBuilder, ArcRotateCamera, HemisphericLight, Vector3, SceneLoader} from '@babylonjs/core';
import * as BABYLON from '@babylonjs/core';
import * as CANNON from 'cannon';

// required imports
import "@babylonjs/core/Loading/loadingScreen";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Materials/Textures/Loaders/envTextureLoader";

import Hud from './gameClasses/ui';
import PhysicsEngine from './gameClasses/physicsEngine';
import InputManager from './gameClasses/inputManager';
import WorldManager from './gameClasses/worldManager';
import Character from './gameClasses/character';
import CharacterController from './gameClasses/characterController';
//window.CANNON = CANNON;  //I can do this and then  gameScene.current.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin());
//or I can do the following (give cannon to the CannonJSPlugin) gameScene.current.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin(true, 10, CANNON));


const mystyle = {
    width: "100%",
    height: "100%"
}

const State = {
    START: 0,
    GAME: 1,
    LOSE: 2,
    CUTSCENE: 3
};

const GameEntryPoint = props => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [frameRate, setFrameRate] = useState(window.innerWidth <= 768 ? 20 : 40); //useState(20)//
    const canvasRef = useRef(null);
    const gameEngine = useRef(null);
    const gameScene = useRef(null);

    const serverLocation = useRef(".");//for itch i need a dot '.' and the build index.html needs relativev paths //I need to change this to "/game" here and also index.html to add /game to work in the server
    const characterName = useRef("remy_new_an_v15_fixed");
    const worldMeshesURL = useRef([serverLocation.current + "/assets/environment26.glb", serverLocation.current + "/assets/environment26_2.glb", serverLocation.current + "/assets/environment29_coins_simple_rot.glb", serverLocation.current + "/assets/environment32_simple.glb"]);
    const ui = useRef(new Hud(serverLocation.current));
    const worldManager = useRef(null);
    const pickedWorld = useRef(1);
    const character = useRef(null);
    const physicsEngine = useRef(new PhysicsEngine(19 / (frameRate / 20)));
    const inputManager = useRef(new InputManager(ui.current));
    const playerScore = useRef(0);
    const ambientSoundTrack = useRef(null);
    const finishedLoading = useRef(false);
    const gameState = useRef(State.START);
    const characterController = useRef(null);
    const controllerLoopId = useRef(null)

    const timestep = useRef(32); //16 //
    const lastUpdateTime = useRef(null);
    const accumulatedTime = useRef(null);
    const starPickSound = useRef(null)
    const storedWorldStates = JSON.parse(localStorage.getItem("worldStates"));
    const defaultWorldStates = [true, false, false, false];
    const worldAvailable = useRef(storedWorldStates || defaultWorldStates);
    const lastRenderTime = useRef(performance.now());

    const setUpGame = async () => {

        let scene = new BABYLON.Scene(gameEngine.current);
        //  gameScene.current.getEngine().hideLoadingUI(); // gameScene.current.getEngine().displayLoadingUI();
        gameScene.current.dispose()
        gameState.current = State.GAME;
        gameScene.current = scene;
        gameScene.current.getEngine().displayLoadingUI();


        var camera = new BABYLON.FreeCamera("camera3", new BABYLON.Vector3(0, 5, -10), gameScene.current);
        camera.attachControl(canvasRef.current, true);
        gameScene.current.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin(true, 10, CANNON));
        // Load the base world
        worldManager.current = new WorldManager(canvasRef.current, gameEngine.current, gameScene.current, worldMeshesURL.current, serverLocation.current);
        await worldManager.current.loadWorld(pickedWorld.current);
        // this.worldManager.render();
        character.current = new Character(gameScene.current, worldManager.current.assetsManager, serverLocation.current, frameRate / 20.0,inputManager.current);

        starPickSound.current = new BABYLON.Sound("mainmenumusic", serverLocation.current + "/assets/sounds/starPickSound.mp3", scene, null, {
            loop: false,
            autoplay: false,
            volume: 1
        })


    }

    const updateGame = (deltaTime) => {
        // Update character controller with fixed timestep
        characterController.current.update(deltaTime);

    };
    // let lastUpdateTime = performance.now();
    // let accumulatedTime = 0;
    const gameControlLoop = () => {

        //  if(document.hasFocus()){
        const currentTime = performance.now();
        const deltaTime = currentTime - lastUpdateTime.current;
        lastUpdateTime.current = currentTime;

        accumulatedTime.current += deltaTime;

        // Update game logic at fixed intervals
        while (accumulatedTime.current >= timestep.current) {
            updateGame(timestep.current / 1000.0); // Convert timestep to seconds //it was 1000 for 16
            accumulatedTime.current -= timestep.current;
        }

        // Request the next frame
        controllerLoopId.current = requestAnimationFrame(gameControlLoop);
        //  }

    };

    const goToGame = async () => {
        // this.ui.gameUI()
        // gameEngine.current.displayLoadingUI();

        await initializeCharacter()

        // const physicsEngine = new PhysicsEngine(9);

        // Configure the shadow generator to cast shadows from the character mesh
        worldManager.current.world.shadowGenerator.addShadowCaster(character.current.mesh);

        let cameraGame = new BABYLON.FreeCamera("camera11", new BABYLON.Vector3(2, 12, 2), gameScene.current);
        cameraGame.setTarget(new BABYLON.Vector3(0, 0, 0));
        cameraGame.attachControl(canvasRef.current, true);

        // Once the character is loaded, create the CharacterController
        characterController.current = new CharacterController(gameEngine.current, gameScene.current, character.current, inputManager.current, physicsEngine.current, ui.current, frameRate / 20.0);
        inputManager.current.setUpMobile(gameScene.current, canvasRef.current)
        // Register the beforeRender event to update the character controller before rendering
        initializeCoinPicker()
        gameScene.current.registerBeforeRender(() => {  //without capping i used getDeltaTime()
            characterController.current.update(0.016 * 4)//gameEngine.current.getDeltaTime() / 1000.0); //*5 because 12 is 5 times less than 60
            gameScene.current.getEngine().hideLoadingUI();
            if (inputManager.current.exitToMenuButtonPressed) {
                gameScene.current.getEngine().displayLoadingUI();
                console.log("go to menu pressed!!!")
                inputManager.current.exitToMenuButtonPressed = false
                goToStart()

            }
        });

    }

    const initializeCoinPicker = () => {
        var pickDistanceThreshold = 2.5
        gameScene.current.registerBeforeRender(() => {
            //  mesh.rotate(BABYLON.Axis.Y, Math.PI / 1080, BABYLON.Space.LOCAL); testdome
            gameScene.current.meshes.forEach((mesh) => {
                if (mesh.name.includes("coin_rot")) {


                    // Calculate distance between character and coin
                    var distance = BABYLON.Vector3.Distance(character.current.mesh.position.add(new BABYLON.Vector3(0, 1, 0)), mesh._absolutePosition);
                    //   console.log("LOL",distance,this.character.mesh.position,mesh.position)
                    // Check if character is within picking distance of the coin
                    if (distance < pickDistanceThreshold) {
                        // Perform actions when character is near the coin (e.g., count as picked)
                        pickUpCoin(mesh);
                    }
                };

                if (mesh.name.includes("Star")) {
                    // Calculate distance between character and coin
                    var distance = BABYLON.Vector3.Distance(character.current.mesh.position.add(new BABYLON.Vector3(0, 1, 0)), mesh._absolutePosition);
                    //   console.log("LOL",distance,this.character.mesh.position,mesh.position)
                    // Check if character is within picking distance of the coin
                    if (distance < pickDistanceThreshold) {
                        pickUpStar(mesh)
                    }

                }


            }
            );
        });
    }

    const pickUpCoin = (coinMesh) => {
        // Remove the coin from the scene or update its state (e.g., set it as inactive)
        coinMesh.dispose(); // Example: remove the coin from the scene
        character.current.coinSound.play()
        // Update the player's score or inventory
        playerScore.current += 1; // Example: increment player's score
    }
    const pickUpStar = (coinMesh) => {
        // Remove the coin from the scene or update its state (e.g., set it as inactive)
        starPickSound.current.play(0.2)
        coinMesh.dispose(); // Example: remove the coin from the scene
        //  character.current.coinSound.play()
        // Update the player's score or inventory
        playerScore.current += 1; // Example: increment player's score

        let tempWorldStates = worldAvailable.current
        if (pickedWorld.current < 5) {
            tempWorldStates[pickedWorld.current] = true
            worldAvailable.current = tempWorldStates
        } else {
            alert("nice, you won")
        }

        localStorage.setItem("worldStates", JSON.stringify(tempWorldStates));

        setTimeout(() => {
            gameScene.current.getEngine().displayLoadingUI();
            goToStart()
        }, 3000)
    }

    const stopGameLoop = (gameLoopId) => {
        cancelAnimationFrame(gameLoopId);
    };


    const goToStart = async () => {

        if (controllerLoopId.current) {
            stopGameLoop(controllerLoopId.current)
            controllerLoopId.current = null
        }
        // clearInterval(orangeIntervalChecker)
        //gameEngine.current.displayLoadingUI();
        gameScene.current.detachControl();
        let scene = new BABYLON.Scene(gameEngine.current);
        var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 0, -5), scene);
        camera.attachControl(canvasRef.current, true);
        //var uiMenuPage = await ui.menuPage()
        await ui.current.newMenuPage()
        await scene.whenReadyAsync();
        //  gameEngine.current.hideLoadingUI();

        //   scene.activeCamera = camera
        gameScene.current.getEngine().hideLoadingUI(); // gameScene.current.getEngine().displayLoadingUI();
        gameScene.current.dispose();
        gameScene.current = scene;  //useRef assigment is async, the change is not immediately available
        gameScene.current.activeCamera = camera;
        //  var here = this


        ambientSoundTrack.current = new BABYLON.Sound("mainmenumusic", serverLocation.current + "/assets/sounds/mainmenu.mp3", scene, null, {
            loop: true,
            autoplay: true,
            volume: 0.05
        });
        ui.current.moveLeftButton.onPointerDownObservable.add(() => {
            smoothTransitionX(camera, camera.position.x, camera.position.x - 3, 20, scene)
        });

        ui.current.moveRightButton.onPointerDownObservable.add(function () {
            // Mimic camera movement when the button is clicked
            //  camera.position.x += 3; // Adjust the camera position as needed
            smoothTransitionX(camera, camera.position.x, camera.position.x + 3, 20, scene)
        });



        var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 20, 0), scene);
        light.intensity *= 2;

        var dome = new BABYLON.PhotoDome(
            "testdome",
            serverLocation.current + "/assets/" + "/images/otherimage.jpg",
            {
                resolution: 32,
                size: 100
            },
            scene
        );

        const goToGameLoby = async () => {

            try {
                await setUpGame().then(res => {
                    finishedLoading.current = true;
                });

                if (finishedLoading.current) {
                    goToGame();
                }
            }
            catch (err) {
                alert(err)
            }
        }

        const pickWorld = (numb) => {
            finishedLoading.current = false
            gameScene.current.getEngine().displayLoadingUI();
            //  here.ui.pressButton(4)
            pickedWorld.current = numb
            console.log("Box clicked!");
            ambientSoundTrack.current.stop()
            goToGameLoby()
        }

        var panelsInfo = [
            { positionX: -3, panelName: "boxN", panelWorldNumber: 1, panelImage: "world1.png", isVisible: worldAvailable.current[0] },
            { positionX: 0, panelName: "box1", panelWorldNumber: 2, panelImage: "cigar.png", isVisible: worldAvailable.current[1] },
            { positionX: 3, panelName: "box2", panelWorldNumber: 3, panelImage: "platformsimple.png", isVisible: worldAvailable.current[2] },
            { positionX: 6, panelName: "box3", panelWorldNumber: 4, panelImage: "grassy.png", isVisible: worldAvailable.current[3] },
            { positionX: 9, panelName: "box4", panelWorldNumber: 5, panelImage: "grassy.png", isVisible: worldAvailable.current[4] }
        ];

        panelsInfo.forEach(panelInfo => {

            if (!panelInfo.isVisible) {
                return
            }

            var box = BABYLON.MeshBuilder.CreateBox(panelInfo.panelName, { width: 2, height: 2, depth: 0.1 }, scene);
            // Texture
            if (panelInfo.panelImage !== "") {
                var texture = new BABYLON.Texture(serverLocation.current + "/assets/images/" + panelInfo.panelImage, scene);
                // Material
                var material = new BABYLON.StandardMaterial("material", scene);
                material.diffuseTexture = texture;
                // Apply material to front face of the box
                box.material = material;
            }
            // Position
            box.position = new BABYLON.Vector3(panelInfo.positionX, 0, 0);
            // Action manager
            box.actionManager = new BABYLON.ActionManager(scene);
            box.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(
                    BABYLON.ActionManager.OnPickTrigger,
                    () => {
                        pickWorld(panelInfo.panelWorldNumber);
                    }
                )
            );
        });

        // _state = State.START;
        // var finishedLoading = false;
    }


    const smoothTransitionX = (camera, startX, endX, duration, scene) => {
        // Create animation
        var animation = new BABYLON.Animation(
            "cameraAnimation",
            "position.x",
            60,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        // Define keyframes
        var keys = [];
        keys.push({ frame: 0, value: startX });
        keys.push({ frame: duration, value: endX });
        animation.setKeys(keys);

        // Attach animation to the camera
        camera.animations.push(animation);

        // Run animation
        scene.beginAnimation(camera, 0, duration, false);
    }

    const initializeCharacter = async () => {
        // Define parameters for the character
        const scale = 0.7;
        const position = new BABYLON.Vector3(2, 5, 5); //i just had to set -0.5!!!!!! to avoid clipping into objects because of the messed up coord systems
        const ellipsoid = new BABYLON.Vector3(0.5, 1.2, pickedWorld.current > 4 ? 0.5 : -0.5); // this is the shape of what is colliding!  new BABYLON.Vector3(0.3, 1.1, 0.3); for blender -0.5, for babylon nativve shapes 0.5 
        const ellipsoidOffset = new BABYLON.Vector3(0, 1.3, 0); // this is the offset of the shape new BABYLON.Vector3(0, 1.2, 0);

        // Load the character with specified parameters
        var characterNameInit = characterName.current//'remy_new_an_v12_fixed'//'remy_v5'//'remy_v2'
        await character.current.load(characterNameInit, scale, position, ellipsoid, ellipsoidOffset);
    }

    useEffect(() => {
        const initScene = async () => {
            const canvas = canvasRef.current;
            const engine = new BABYLON.Engine(canvas, true);
            const scene = new BABYLON.Scene(engine);

            gameEngine.current = engine;
            gameScene.current = scene;
            gameScene.current.getEngine().displayLoadingUI();

            BABYLON.MeshBuilder.CreateBox("box", {});

            await goToStart();

            const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new BABYLON.Vector3(0, 0, 0));
            camera.attachControl(canvas, true);
            const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0));

            gameEngine.current.runRenderLoop(() => {  //cap the framrate to 15 fps for mobile
                if (gameScene.current.isReady() && document.hasFocus()) {
                    const currentTime = performance.now();
                    const deltaTime = currentTime - lastRenderTime.current;

                    // Cap frame rate to 15 FPS (approximately)
                    if (deltaTime >= 1000 / frameRate) {
                        gameScene.current.render();
                        lastRenderTime.current = currentTime;
                    }
                }
            });

            window.addEventListener("resize", () => {
                gameEngine.current.resize();
            });

            // Cleanup function
            return () => {
                gameEngine.current.stopRenderLoop();
                gameEngine.current.dispose();
            };
        };

        initScene();
    }, []);

    return <canvas id="" style={mystyle} ref={canvasRef} {...props}></canvas>;
}

export default GameEntryPoint;