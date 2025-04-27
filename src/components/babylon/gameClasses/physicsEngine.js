import * as BABYLON from '@babylonjs/core';
// required imports
import "@babylonjs/core/Loading/loadingScreen";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Materials/Textures/Loaders/envTextureLoader";

export default class PhysicsEngine {
    constructor(gravity = 9.81) {
        this.gravity = gravity; // Gravity acceleration (m/s^2)

        this.capHeight = 3.3 //2.2
        this.accumulatedJumpHeight = 0
       // this.characterVelocity = 0
    }


    applyGravity(mesh, deltaTime, jumpImpulse) {
        // Calculate gravity force
        const gravityForce = this.gravity;
        const gravityAcceleration = gravityForce;
        mesh.characterVelocity += (jumpImpulse-gravityAcceleration) * deltaTime;
            // Update position based on velocity
       // console.log(jumpImpulse,gravityAcceleration,deltaTime,mesh.characterVelocity,mesh.characterVelocity * deltaTime)
      //  mesh.position.y += mesh.characterVelocity * deltaTime;
        var newPosition;
        // if(mesh.characterVelocity>0){
        //   this.accumulatedJumpHeight = this.accumulatedJumpHeight + mesh.characterVelocity*deltaTime
        //   if(this.accumulatedJumpHeight>this.capHeight){
        //     mesh.characterVelocity= 0
        //     newPosition = mesh.position.add(new BABYLON.Vector3(0, 0 , 0));
        //   }else{
        //     newPosition = mesh.position.add(new BABYLON.Vector3(0, mesh.characterVelocity*deltaTime , 0));
        //   }
        // }else{
        //     newPosition = mesh.position.add(new BABYLON.Vector3(0, mesh.characterVelocity*deltaTime , 0));
        // }
        newPosition = mesh.position.add(new BABYLON.Vector3(0, mesh.characterVelocity*deltaTime , 0));
     //   const newPosition = mesh.position.add(new BABYLON.Vector3(0, mesh.characterVelocity*deltaTime , 0)); //new BABYLON.Vector3(0, mesh.characterVelocity * deltaTime, 0)

        // Move the character mesh with collision detection
        mesh.moveWithCollisions(newPosition.subtract(mesh.position));

    }

    resetVelocity(mesh){
        mesh.characterVelocity= 0
    }

    // Method to set up physics impostor for a mesh
    setupPhysicsImpostor(mesh, impostorType, options,scene) {
        return new BABYLON.PhysicsImpostor(mesh, impostorType, options, scene);
    }

    applyImpulse(mesh, direction, deltaTime) {
        if (!mesh.physicsImpostor) {
            console.error("Mesh does not have a physics impostor.");
            return;
        }
    
        // Calculate the impulse force based on the direction and deltaTime
        const impulseForce = direction.scale(mesh.physicsImpostor.mass / deltaTime);
    
        // Apply the impulse to the mesh
        mesh.physicsImpostor.applyImpulse(impulseForce, mesh.getAbsolutePosition());
    
        // Optionally, you may want to handle any other logic related to the impulse, such as sound effects or visual effects
    }
}