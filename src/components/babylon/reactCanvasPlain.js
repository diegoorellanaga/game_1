import React, {useRef, useEffect, useState} from 'react'

import {Engine, Scene, MeshBuilder, ArcRotateCamera, HemisphericLight, Vector3, SceneLoader} from '@babylonjs/core';
// required imports
import "@babylonjs/core/Loading/loadingScreen";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Materials/Textures/Loaders/envTextureLoader";

const mystyle = {
    width: "100%",
    height: "100%"
}

const ReactCanvas = props => {
    const canvasRef = useRef(null);
    const engineRef = useRef(null);
    const sceneRef = useRef(null);

    const loadMap = async () => {
        let sceneFilename = "environment29_coins_simple_rot.glb";
        let rootUrl = "./assets/";
        SceneLoader.ImportMeshAsync("", "/assets/coin.glb", "", sceneRef.current)
            .then((meshes) => {
                console.log("Meshes loaded successfully:", meshes);
            })
            .catch((error) => {
                console.error("Error loading mesh:", error);
            });
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        const engine = new Engine(canvas, true);
        const scene = new Scene(engine);

        engineRef.current = engine;
        sceneRef.current = scene;

        // Load the map and initialize Babylon.js scene logic
        loadMap();
        MeshBuilder.CreateBox("box", {});

        const camera = new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new Vector3(0, 0, 0));
        camera.attachControl(canvas, true);
        const light = new HemisphericLight("light", new Vector3(1, 1, 0));

        engine.runRenderLoop(() => {
            scene.render();
        });

        window.addEventListener("resize", () => {
            engine.resize();
        });

        // Cleanup function
        return () => {
            engine.stopRenderLoop();
            engine.dispose();
        };
    }, []);

    return <canvas style={mystyle} ref={canvasRef} {...props}></canvas>;
}

export default ReactCanvas;