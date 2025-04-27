import * as BABYLON from '@babylonjs/core';
// required imports
import "@babylonjs/core/Loading/loadingScreen";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Materials/Textures/Loaders/envTextureLoader";

export default class AssetsManager {
    constructor(scene,serverURL) {
        this.scene = scene;
        this.assets = {};
        this.serverURL = serverURL
    }

    async loadAsset(assetName, assetPath) {
        try {
            const meshes = await BABYLON.SceneLoader.ImportMeshAsync("", assetPath, assetName + ".glb", this.scene);
            this.assets[assetName] = meshes;
            return meshes;
        } catch (error) {
            console.error(`Failed to load asset '${assetName}' from '${assetPath}':`, error);
            throw error;
        }
    }

    disposeAsset(assetName) {
        if (this.assets[assetName]) {
            this.assets[assetName].forEach(mesh => mesh.dispose());
            delete this.assets[assetName];
        }
    }

    async loadCharacterModel(characterName) {
        try {
            // Load the player character's model and animations
            const playerModel = await this.loadAsset(characterName, this.serverURL+"/assets/");
            
            // Additional setup for animations, materials, etc. may be done here
            
            return playerModel;
        } catch (error) {
            console.error("Failed to load player character model:", error);
            throw error;
        }
    }
}
