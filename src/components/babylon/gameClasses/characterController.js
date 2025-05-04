import * as BABYLON from '@babylonjs/core';
// required imports
import "@babylonjs/core/Loading/loadingScreen";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Materials/Textures/Loaders/envTextureLoader";

export default class CharacterController {
    constructor(gameEngine,gameScene,character, inputManager,physicsEngine, ui,speedFrameScale) {
        this.speedFrameScale = speedFrameScale
        this.character = character;
        this.inputManager = inputManager;
        this.physicsEngine = physicsEngine;
        this.scene = gameScene
        this.engine = gameEngine
        this.floorStandingPoint = null
        this.arrowKeyPressed = false
        this.arrowDownKeyPressed = false
        this.isTouchingGround =false
        this.punchingButtonPressed = false
        this.jumpingButtonPressed = false
        this.punchingTimeOut = null
        this.punchLagEnded = true
        this.jumpForce = 1
        this.characterPhysicsImpostor =null
        this.jumpImpulse = 0
        this.ui = ui
        this.landingOnce = false

       

        this.isFollowCameraActivated = true
      //  this.ORIGINAL_TILT = new BABYLON.Vector3(0.3, 0, 0);
        this.pickedFloorPoint = null

        //moving platform related variables
        this.onMovingPlatform = false
        this.movingPlatformExampleZ = [0,0]
        this.movingPlatformExampleX = [0,0]
        this.movingPlatformExampleY = [0,0]

        this.movingPlatformVector = [null,null]
        this.cumulativeMovingPlatformVector = [null,null]

        this.cumulativeMovingPlatformExampleZ = 0
        this.cumulativeMovingPlatformExampleX = 0
        this.cumulativeMovingPlatformExampleY = 0

        this.currentMovingPlatform = null
        this.cameraFixedX=true

        this.standingMovingPlatform = null


        this.ORIGINAL_TILT = new BABYLON.Vector3(0.3, 0, 0);

        this.cameraOffsetRadious = 10; //12
        this.cameraHighOffset = 8 //10
        this.cameraXoffset = 1 //1
        this.cameraZoffset = 1 //1
        this.init();

        this.dialogsStates = {cigGuy:false}

        this.timeOutLandingOnce = true
      //  this._setupPlayerCamera()
        //this.deltaTime = this.character.scene.getEngine().getDeltaTime()/1000.0
    }

    init() {
        setInterval(()=>{
            console.log("delta time!!!!",this.scene.getEngine().getDeltaTime() / 1000.0)
        },2000)
        // Add any initialization code here
        this.setupCameraFixedZ()
        console.log("impostor",BABYLON.PhysicsImpostor.BoxImpostor)
        this.character.mesh.physicsImpostor = this.physicsEngine.setupPhysicsImpostor(this.character.mesh,  BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0, friction: 0.5 },this.scene) 
    }

    hearInputActions(deltaTime){ //this will be looping and hearing inputs from the user
        let isAnyArrowKeyPressed = false
        let wasPunchingButtonPressed = false
        let wasJumpingButtonPressed = false
        let wasArrowDownPressed = false

        let moveScale = (this.inputManager.isKeyDown('ArrowLeft') && this.inputManager.isKeyDown('ArrowUp')) || (this.inputManager.isKeyDown('ArrowLeft') && this.inputManager.isKeyDown('ArrowDown')) || (this.inputManager.isKeyDown('ArrowRight') && this.inputManager.isKeyDown('ArrowUp')) || (this.inputManager.isKeyDown('ArrowRight') && this.inputManager.isKeyDown('ArrowDown')) ? 0.5 : 1
        let mobileScale = (this.inputManager.mobileLeft && this.inputManager.mobileUp) || (this.inputManager.mobileLeft && this.inputManager.mobileDown) || (this.inputManager.mobileRight && this.inputManager.mobileUp) || (this.inputManager.mobileRight && this.inputManager.mobileDown) ? 0.5 : 1
     
        moveScale=moveScale*mobileScale
       // console.log(moveScale,mobileScale)
        // if(this.inputManager.isKeyDown('ArrowUp') && this.inputManager.isKeyDown('ArrowLeft')){
        //     this.character.moveDiagForwardLeft(deltaTime);
        //     isAnyArrowKeyPressed= true
        // }

        // if(this.inputManager.isKeyDown('ArrowUp') && this.inputManager.isKeyDown('ArrowRight')){
        //     this.character.moveDiagForwardRight(deltaTime);
        //     isAnyArrowKeyPressed= true
        // }

        if (( (this.inputManager.isKeyDown('ArrowUp')  )|| this.inputManager.mobileUp) && !this.character.characterState['isPunching'] && !this.character.characterState['isClimbing']&& !this.character.characterState['isCrouchingUp']) { //isCrouchingUp
            // Move the character forward
          //  console.log("movving fofrward!!!")

            

            this.character.moveForward(deltaTime,moveScale);
            isAnyArrowKeyPressed= true
        }
        if (((this.inputManager.isKeyDown('ArrowDown') ) || this.inputManager.mobileDown) && !this.character.characterState['isPunching'] && !this.character.characterState['isClimbing']&& !this.character.characterState['isCrouchingUp']) {
            // Move the character backward
            this.character.moveBackward(deltaTime,moveScale);
         //   isAnyArrowKeyPressed= true
            wasArrowDownPressed = true
            
        }
        if (((this.inputManager.isKeyDown('ArrowLeft') ) || this.inputManager.mobileLeft) && !this.character.characterState['isPunching'] && !this.character.characterState['isClimbing']&& !this.character.characterState['isCrouchingUp']) {
            // Rotate the character left
            this.character.rotateLeft(deltaTime,moveScale);
            isAnyArrowKeyPressed= true
        }
        if (((this.inputManager.isKeyDown('ArrowRight') ) || this.inputManager.mobileRight) && !this.character.characterState['isPunching'] && !this.character.characterState['isClimbing']&& !this.character.characterState['isCrouchingUp']) {
            // Rotate the character right
            this.character.rotateRight(deltaTime,moveScale);
            isAnyArrowKeyPressed= true
          //  console.log(this.inputManager.keys)
        }

        if ((this.inputManager.isKeyDown('KeyS') || this.inputManager.mobileJump) && this.isTouchingGround && this.jumpImpulse == 0) {
            // Rotate the character right
            wasJumpingButtonPressed = true
        }

        if ((this.inputManager.isKeyDown('KeyF') || this.inputManager.mobilePunch) && !this.character.characterState['isPunching'] && this.punchLagEnded ) { //&& !this.character.characterState['isPunching'] && (this.character.characterState['isIddle'])
           this.punchLagEnded = false
           clearTimeout(this.punchingTimeOut)
           this.punchingTimeOut =  setTimeout(()=>{this.punchLagEnded = true;},700)
           wasPunchingButtonPressed=true
        }
        this.jumpingButtonPressed = wasJumpingButtonPressed
        this.punchingButtonPressed = wasPunchingButtonPressed
        this.arrowKeyPressed = isAnyArrowKeyPressed
        this.arrowDownKeyPressed = wasArrowDownPressed
        if(this.arrowDownKeyPressed){
          //  console.log("here!!",this.isTouchingGround && this.arrowDownKeyPressed && !this.character.characterState['isPunching'] && this.jumpImpulse==0)
        }
    }

    resetMovingPlatformOffsets(){
        this.movingPlatformExampleZ = [0,0]
        this.movingPlatformExampleX = [0,0]
        this.movingPlatformExampleY = [0,0]
        this.movingPlatformVector = [null,null]
    }

    update(deltaTime) {
        // Update the character's state based on user inputs
        this.hearInputActions(deltaTime)
        this.applyGravity(deltaTime)
        this.handleCharacterStates()
        this.handleCharacterAnimations()
        this.frontRayCast()
        this.handleClimbCameraTransition()
        this.handleCameraType()
        this.handleCharacterFall()
        this.updateLightPosition()
        this.handleOtherGuiButtons()
        

    }

    handleOtherGuiButtons(){
        if(this.inputManager.respawnButtonPressed){
            this.inputManager.respawnButtonPressed = false
            this.character.mesh.position = new BABYLON.Vector3(2,10,2)
        }

    }

    updateLightPosition(){
        // Get the light by its ID
        var light = this.scene.getLightByID("dir01");
        // Check if the light exists
        if (light) {
            // Update the light's properties
            // For example, you can change its intensity
          //  light.intensity = 0.5;
            // Or change its position
            light.position = this.character.mesh.position.add(new BABYLON.Vector3(0, 20, 0));
        }
    }

    handleCameraType(){
        if(this.inputManager.fixedCamera==1){

            if(this.scene.activeCamera.name != "FixedCam"){
                this.setupCameraFixedZ()
                this.camera.position = new BABYLON.Vector3(this.character.tempCylinder.position.x+this.cameraXoffset, this.character.tempCylinder.position.y + this.cameraHighOffset, this.character.tempCylinder.position.z+this.cameraOffsetRadious);
            }

                     //   this.camera.position = new BABYLON.Vector3(this.character.tempCylinder.position.x, this.character.tempCylinder.position.y+15, this.camera.position.z);
            // Define the target position for the camera
            var targetPosition = new BABYLON.Vector3(this.character.tempCylinder.position.x +this.cameraXoffset, this.character.tempCylinder.position.y + this.cameraHighOffset, this.character.tempCylinder.position.z+this.cameraOffsetRadious)//this.camera.position.z);
            
            // Set a lerp factor to control the speed of the transition (0 for instant, 1 for no movement)
            var lerpFactor = 0.06; // Adjust this value to control the smoothness of the transition
            
            // Interpolate between the current camera position and the target position using lerp
            var newPosition = BABYLON.Vector3.Lerp(this.camera.position, targetPosition, lerpFactor);
            
            // Update the camera position
            this.camera.position.copyFrom(newPosition);

        }else if(this.inputManager.fixedCamera==2){

            if(this.scene.activeCamera.name != "FixedCamX"){
                this.setupCameraFixedX()

                this.camera.position = new BABYLON.Vector3(this.character.tempCylinder.position.x+this.cameraOffsetRadious,this.character.tempCylinder.position.y + this.cameraHighOffset,this.character.tempCylinder.position.z+this.cameraZoffset );
            }

                     //   this.camera.position = new BABYLON.Vector3(this.character.tempCylinder.position.x, this.character.tempCylinder.position.y+15, this.camera.position.z);
            // Define the target position for the camera
            var targetPosition = new BABYLON.Vector3(this.character.tempCylinder.position.x+this.cameraOffsetRadious, this.character.tempCylinder.position.y + this.cameraHighOffset,this.character.tempCylinder.position.z+this.cameraZoffset );  //this.camera.position.z
            
            // Set a lerp factor to control the speed of the transition (0 for instant, 1 for no movement)
            var lerpFactor = 0.06; // Adjust this value to control the smoothness of the transition
            
            // Interpolate between the current camera position and the target position using lerp
            var newPosition = BABYLON.Vector3.Lerp(this.camera.position, targetPosition, lerpFactor);
            
            // Update the camera position
            this.camera.position.copyFrom(newPosition);

        }else if(this.inputManager.fixedCamera==3){

            if(this.scene.activeCamera.name != "FixedCamZN"){
                this.setupCameraFixedZN()
                this.camera.position = new BABYLON.Vector3(this.character.tempCylinder.position.x+this.cameraXoffset, this.character.tempCylinder.position.y + this.cameraHighOffset, this.character.tempCylinder.position.z-this.cameraOffsetRadious);
            }

                     //   this.camera.position = new BABYLON.Vector3(this.character.tempCylinder.position.x, this.character.tempCylinder.position.y+15, this.camera.position.z);
            // Define the target position for the camera
            var targetPosition = new BABYLON.Vector3(this.character.tempCylinder.position.x +this.cameraXoffset, this.character.tempCylinder.position.y + this.cameraHighOffset, this.character.tempCylinder.position.z-this.cameraOffsetRadious)//this.camera.position.z);
            
            // Set a lerp factor to control the speed of the transition (0 for instant, 1 for no movement)
            var lerpFactor = 0.06; // Adjust this value to control the smoothness of the transition
            
            // Interpolate between the current camera position and the target position using lerp
            var newPosition = BABYLON.Vector3.Lerp(this.camera.position, targetPosition, lerpFactor);
            
            // Update the camera position
            this.camera.position.copyFrom(newPosition);



        }else if(this.inputManager.fixedCamera==4){

            if(this.scene.activeCamera.name != "FixedCamXN"){
                this.setupCameraFixedXN()

                this.camera.position = new BABYLON.Vector3(this.character.tempCylinder.position.x-this.cameraOffsetRadious,this.character.tempCylinder.position.y + this.cameraHighOffset,this.character.tempCylinder.position.z+this.cameraZoffset );
            }

                     //   this.camera.position = new BABYLON.Vector3(this.character.tempCylinder.position.x, this.character.tempCylinder.position.y+15, this.camera.position.z);
            // Define the target position for the camera
            var targetPosition = new BABYLON.Vector3(this.character.tempCylinder.position.x-this.cameraOffsetRadious, this.character.tempCylinder.position.y + this.cameraHighOffset,this.character.tempCylinder.position.z+this.cameraZoffset );  //this.camera.position.z
            
            // Set a lerp factor to control the speed of the transition (0 for instant, 1 for no movement)
            var lerpFactor = 0.06; // Adjust this value to control the smoothness of the transition
            
            // Interpolate between the current camera position and the target position using lerp
            var newPosition = BABYLON.Vector3.Lerp(this.camera.position, targetPosition, lerpFactor);
            
            // Update the camera position
            this.camera.position.copyFrom(newPosition);

        }else{
            if(this.scene.activeCamera.name != "FollowCam"){
                this.setupCamera()
            }
        }
    }

    handleCharacterFall(){
        if(this.character.mesh.position.y <-60){
            this.character.mesh.position = new BABYLON.Vector3(0, 5, 0)
            this.physicsEngine.resetVelocity(this.character.mesh)
        }
    }

    handleClimbCameraTransition() { //when the system is slow i have to make the transition faster
        if (this.character.charIsClimbing && this.isFollowCameraActivated) {
            
            //the slower the pc the less frames we want to spend so we need to lower the frames the bigger the deltatime (time between frames)
            let deltaTime = (this.scene.getEngine().getDeltaTime() / 10.0)
            let deltaTimeScale = 2/deltaTime
            let minNumberDeltaTimeScale = Math.min(1, deltaTimeScale) //nevevr be more than 1, we want to diminish not enlarge
            let framesScaled = Math.round(minNumberDeltaTimeScale * 90)

            let frameScaledFastMoving = Math.round(minNumberDeltaTimeScale * 20)

            console.log("SCALATION!!!",deltaTime,deltaTimeScale,framesScaled)



            // Create a temporary cylinder for the camera to follow during the transition
            this.character.charIsClimbing = false
            this.character.tempCylinder.position.copyFrom(this.character.initialClimbPosition);
            this.character.climbTransition = true
            this.character.climbTransitionCylinder = true
            if(!this.inputManager.fixedCamera){
            this.camera.lockedTarget = this.character.tempCylinder;
            }
            // Perform cylinder transition to the final climb position
        //    var here = this                                                                        //50 original for nomal pc 10 for trash itch.io  //test with 20 //THEN 80 WORKED FOR PC
            this.cylinderTransition(this.character.tempCylinder, this.character.finalClimbPosition,framesScaled).then(() => {

             //   if(this.onMovingPlatform || true){
                    this.character.cameraTransitioning = true                 
                    this.fastMovingTransition(this.character.tempCylinder,frameScaledFastMoving) //20 original
              //  }else{
                    this.character.climbTransitionCylinder = false;
             //   }
            });
        }
    }
    
    cylinderTransition(initialPosition, finalPosition, numFrames =40) { //original 76
        return new Promise((resolve, reject) => {
            // Calculate the direction and distance between initial and final positions
            const direction = finalPosition.subtract(initialPosition.position);
            const distance = direction.length();
            const step = direction.scale(1 / numFrames);
    
            let currentPosition = initialPosition.position.clone();
            console.log("currentPosition: ",currentPosition,finalPosition)
     
            // Function to update cylinder position each frame
            const updatePosition = () => {
                currentPosition.addInPlace(step);
                initialPosition.position.copyFrom(currentPosition);

                // Check if reached final position
                if (currentPosition.subtract(finalPosition).lengthSquared() < 0.01) {
                    // If reached, resolve the promise
                    
                    resolve();
                } else {
                    // If not reached, continue updating position
                    requestAnimationFrame(updatePosition);
                }
            };
    
            // Start updating position
            updatePosition();
        });
    }

    fastMovingTransition(initialPosition, numFrames = 40) {
        return new Promise((resolve, reject) => {
            // Function to update position each frame
            const updatePosition = () => {
                const finalPosition = this.character.mesh.position.clone();
                const direction = finalPosition.subtract(initialPosition.position);
                // const minDirection = direction.lengthSquared() < 3 ? direction.normalize().scale(3) : direction.clone();
                const minDirection = direction.length() < 2 ? direction.normalize().scale(2) : direction.clone();

                const distance = direction.length();
                const step = minDirection.scale(1 / numFrames);
    
                // Update the current position
                initialPosition.position.addInPlace(step);

                // Copy rotation
                initialPosition.rotationQuaternion = this.character.mesh.rotationQuaternion.clone();

    
                // Check if reached moving final position
                if (initialPosition.position.subtract(finalPosition).lengthSquared() < 0.02) {
                    this.character.climbTransitionCylinder = false
                    this.character.cameraTransitioning = false
                    // If reached, resolve the promise
                    resolve();
                } else {
                    // If not reached, continue updating position
                    requestAnimationFrame(updatePosition);
                }
            };
    
            // Start updating position
            updatePosition();
        });
    }


    movingPlatformOffset(mesh){

        if(this.standingMovingPlatform != mesh.id){
            this.resetMovingPlatformOffsets()
            this.standingMovingPlatform = mesh.id
        }
        if((mesh.movingPlatform == true)){
            this.onMovingPlatform = true
            this.movingPlatformVector.push(mesh.absolutePosition.clone())
            this.movingPlatformVector.shift();

           if(this.movingPlatformVector[0] && this.movingPlatformVector[1]){
               this.character.mesh.position = this.character.mesh.position.clone().add(this.movingPlatformVector[1].subtract(this.movingPlatformVector[0]))

            // //Initial position of the character
            // let initialPosition = this.character.mesh.position.clone();
            
            // // Final position after applying the difference vector
            // let finalPosition = initialPosition.add(this.movingPlatformVector[1].subtract(this.movingPlatformVector[0]));
            
            // // Amount of interpolation (usually between 0 and 1)
            // let t = 0.5;
            
            // // Number of iterations for interpolation
            // let iterations = 10/* number of iterations */;
            
            // for (let i = 0; i < iterations; i++) {
            //     // Perform linear interpolation between initial and final positions
            //     let interpolatedPosition = BABYLON.Vector3.Lerp(initialPosition, finalPosition, t);
            
            //     // Update character's position
            //     this.character.mesh.position.copyFrom(interpolatedPosition);
            
            //     // Update initial position for next iteration
            //     initialPosition.copyFrom(interpolatedPosition);
            // }
         
         }


        }else{
            this.resetMovingPlatformOffsets()
        }

        // if((mesh.movingPlatform == true)){
        //     this.onMovingPlatform = true
        //     this.movingPlatformExampleZ.push(mesh.absolutePosition.z)
        //     this.movingPlatformExampleZ.shift();

        //    if(this.movingPlatformExampleZ[0]!= 0 && this.movingPlatformExampleZ[1]!=0){
        //        this.character.mesh.position.z = this.character.mesh.position.z  +   this.movingPlatformExampleZ[1] - this.movingPlatformExampleZ[0]
        //        this.cumulativeMovingPlatformExampleZ = this.cumulativeMovingPlatformExampleZ + this.movingPlatformExampleZ[1] - this.movingPlatformExampleZ[0]
        //     }
   
        //    this.movingPlatformExampleY.push(mesh.absolutePosition.y)
        //    this.movingPlatformExampleY.shift();

        //    if(this.movingPlatformExampleY[0]!= 0 && this.movingPlatformExampleY[1]!=0){
        //         this.character.mesh.position.y = this.character.mesh.position.y  +   this.movingPlatformExampleY[1] - this.movingPlatformExampleY[0]
        //         this.cumulativeMovingPlatformExampleY = this.cumulativeMovingPlatformExampleY + this.movingPlatformExampleY[1] - this.movingPlatformExampleY[0]
        //    }
   
        //    this.movingPlatformExampleX.push(mesh.absolutePosition.x)
        //    this.movingPlatformExampleX.shift();
   
        //    if(this.movingPlatformExampleX[0]!= 0 && this.movingPlatformExampleX[1]!=0){
        //         this.character.mesh.position.x = this.character.mesh.position.x  +   this.movingPlatformExampleX[1] - this.movingPlatformExampleX[0]
        //         this.cumulativeMovingPlatformExampleX = this.cumulativeMovingPlatformExampleX + this.movingPlatformExampleX[1] - this.movingPlatformExampleX[0]
        //    }
        // }else{
        //     this.onMovingPlatform = false
        //     this.resetMovingPlatformOffsets()
        //     this.cumulativeMovingPlatformExampleZ = 0
        //     this.cumulativeMovingPlatformExampleX = 0
        //     this.cumulativeMovingPlatformExampleY = 0
        // }

    }

    movingPlatformClimbOffset(mesh){

        if((mesh.movingPlatform == true)){
            this.onMovingPlatform = true
            this.movingPlatformExampleZ.push(mesh.absolutePosition.z)
            this.movingPlatformExampleZ.shift();

           if(this.movingPlatformExampleZ[0]!= 0 && this.movingPlatformExampleZ[1]!=0){
               this.character.mesh.position.z = this.character.mesh.position.z  +   this.movingPlatformExampleZ[1] - this.movingPlatformExampleZ[0]
           }
   
           this.movingPlatformExampleY.push(mesh.absolutePosition.y)
           this.movingPlatformExampleY.shift();

           if(this.movingPlatformExampleY[0]!= 0 && this.movingPlatformExampleY[1]!=0){
                this.character.mesh.position.y = this.character.mesh.position.y  +   this.movingPlatformExampleY[1] - this.movingPlatformExampleY[0]
           }
   
           this.movingPlatformExampleX.push(mesh.absolutePosition.x)
           this.movingPlatformExampleX.shift();
   
           if(this.movingPlatformExampleX[0]!= 0 && this.movingPlatformExampleX[1]!=0){
                this.character.mesh.position.x = this.character.mesh.position.x  +   this.movingPlatformExampleX[1] - this.movingPlatformExampleX[0]
           }

        }else{
            this.onMovingPlatform = false
            this.resetMovingPlatformOffsets()

        }

    }

    setupCamera() {
        // Create a follow camera
        this.camera = new BABYLON.FreeCamera("FollowCam", new BABYLON.Vector3(this.character.mesh.position.x, this.character.mesh.position.y+4, this.character.mesh.position.z+7), this.scene);
// Set the target of the camera
this.camera.setTarget(BABYLON.Vector3.Zero());
var canvas = this.engine.getRenderingCanvas();
// Attach camera controls to the canvas
this.camera.attachControl(canvas, true);

        this.scene.activeCamera = this.camera; // Set the camera as the active camera in the scene
    }


    // setupCamera() {
    //     // Create a follow camera
    //     this.camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(this.character.mesh.position.x, this.character.mesh.position.y+4, this.character.mesh.position.z+7), this.scene);

    //     this.camera.lockedTarget = this.character.tempCylinder//this.character.mesh; // Make the camera follow the character
    //     this.camera.radius = 12; //12
    //     this.camera.heightOffset = 8//8;
    //     // Acceleration of camera in moving from current to goal position
    //     this.camera.cameraAcceleration = 0.007; //0.01
    //     this.camera.inertia = 0
    //     // The speed at which acceleration is halted
    //     this.camera.maxCameraSpeed = 100; //10
    //     this.camera.fov = 0.8  //fish eye lense or not
    //     //this.camera.upperHeightOffsetLimit = 8;
    //    // this.camera.lowerRadiusLimit = this.camera.upperRadiusLimit = 30;
    //     this.camera.rotationOffset = 180;  //camera rotation offset
    //     this.scene.activeCamera = this.camera; // Set the camera as the active camera in the scene
    // }

    setupCameraFixedZ() {
        // Create a new free camera
        this.camera = new BABYLON.FreeCamera("FixedCam", new BABYLON.Vector3(0, 20, 20), this.scene);
        
        // Set the target of the camera
        this.camera.setTarget(BABYLON.Vector3.Zero());
    
        // Set camera position and rotation
        this.camera.position = new BABYLON.Vector3(10, 15,12);
        this.camera.rotation = new BABYLON.Vector3(Math.PI/4, Math.PI, 0); // Optionally adjust rotation if needed
    
        // Set camera's parent to null to avoid inheriting rotation from other objects
        this.camera.parent = null;
    
        // Set the camera as the active camera in the scene
        this.scene.activeCamera = this.camera;
    }

    setupCameraFixedZN() {
        // Create a new free camera
        this.camera = new BABYLON.FreeCamera("FixedCamZN", new BABYLON.Vector3(0, 20, 20), this.scene);
        
        // Set the target of the camera
        this.camera.setTarget(BABYLON.Vector3.Zero());
    
        // Set camera position and rotation
        this.camera.position = new BABYLON.Vector3(10, 15,-12);
        this.camera.rotation = new BABYLON.Vector3(Math.PI/4, 0, 0); // Optionally adjust rotation if needed
    
        // Set camera's parent to null to avoid inheriting rotation from other objects
        this.camera.parent = null;
    
        // Set the camera as the active camera in the scene
        this.scene.activeCamera = this.camera;
    }

    setupCameraFixedX() {
        // Create a new free camera
        this.camera = new BABYLON.FreeCamera("FixedCamX", new BABYLON.Vector3(20, 20, 0), this.scene);
        
        // Set the target of the camera
        this.camera.setTarget(BABYLON.Vector3.Zero());
    
        // Set the camera's position to be above the origin (0, 0, 0) along the X-axis
        // Set camera position and rotation
        this.camera.position = new BABYLON.Vector3(0, 35, 0);
        this.camera.rotation = new BABYLON.Vector3(Math.PI/4, Math.PI +Math.PI/2, 0); // Adjusted for rotation around Z-axis
        // Set camera's parent to null to avoid inheriting rotation from other objects
        this.camera.parent = null;
    
        // Set the camera as the active camera in the scene
        this.scene.activeCamera = this.camera;
    }

    setupCameraFixedXN() {
        // Create a new free camera
        this.camera = new BABYLON.FreeCamera("FixedCamXN", new BABYLON.Vector3(20, 20, 0), this.scene);
        
        // Set the target of the camera
        this.camera.setTarget(BABYLON.Vector3.Zero());
    
        // Set the camera's position to be above the origin (0, 0, 0) along the X-axis
        // Set camera position and rotation
        this.camera.position = new BABYLON.Vector3(0, 35, 0);
        this.camera.rotation = new BABYLON.Vector3(Math.PI/4, Math.PI/2, 0); // Adjusted for rotation around Z-axis
        // Set camera's parent to null to avoid inheriting rotation from other objects
        this.camera.parent = null;
    
        // Set the camera as the active camera in the scene
        this.scene.activeCamera = this.camera;
    }

    floorRaycast(){ 
        let raycastFloorPos = new BABYLON.Vector3(this.character.mesh.position.x, this.character.mesh.position.y + 1.5, this.character.mesh.position.z);
        let rayDirection = BABYLON.Vector3.Up().scale(-1);
        let rayLength = 1.6;
        let ray = new BABYLON.Ray(raycastFloorPos, rayDirection, rayLength);
        var here = this
    
        let predicate = function (mesh) {
            here.pickedMesh = mesh
            return mesh.isPickable && mesh.isEnabled();
        }
    
        let pick = this.scene.pickWithRay(ray, predicate);
        let endPosition = raycastFloorPos.add(rayDirection.scale(rayLength));


        let raycast_2 = new BABYLON.Vector3(this.character.mesh.position.x, this.character.mesh.position.y + 1.5, this.character.mesh.position.z + .25);
        let ray_2 = new BABYLON.Ray(raycast_2, BABYLON.Vector3.Up().scale(-1), 1.5);
        let pick_2 = this.scene.pickWithRay(ray_2, predicate);

    
        // //debug lines
        // if (!this.rayLine) {
        //     // Create the line if it doesn't exist
        //     this.rayLine = BABYLON.Mesh.CreateLines("rayLine", [raycastFloorPos.subtract(this.character.mesh.position), endPosition.subtract(this.character.mesh.position)], this.scene);
        //     // Set the character mesh as the parent of the line mesh
        //     this.rayLine.checkCollisions = false;
        //     this.rayLine.isPickable = false;
        //     this.rayLine.parent = this.character.mesh;
        // } else {
        //     // Update the existing line
        //     BABYLON.Mesh.CreateLines(null, [raycastFloorPos.subtract(this.character.mesh.position), endPosition.subtract(this.character.mesh.position)], null, null, this.rayLine);
        // }
        // ////debug lines END

        if (pick.hit) { 
            
            this.movingPlatformOffset(pick.pickedMesh)
            this.counter += 1;
            this.pickedFloorPoint = pick.pickedPoint
            return pick.pickedPoint;
        } else { 
            this.movingPlatformExampleZ = [0,0];
            return BABYLON.Vector3.Zero();
        }
    }

    floorRaycastLanding(){
        let raycastFloorPos = new BABYLON.Vector3(this.character.mesh.position.x, this.character.mesh.position.y + 1.5, this.character.mesh.position.z);
        let rayDirection = BABYLON.Vector3.Up().scale(-1);
        let rayLength = 3.3;//1.6 //3.6 wroked
        let ray = new BABYLON.Ray(raycastFloorPos, rayDirection, rayLength);
        var here = this
    
        let predicate = function (mesh) {
            here.pickedMeshLanding = mesh
            return mesh.isPickable && mesh.isEnabled();
        }
    
        let pick = this.scene.pickWithRay(ray, predicate);
        let endPosition = raycastFloorPos.add(rayDirection.scale(rayLength));


        let raycast_2 = new BABYLON.Vector3(this.character.mesh.position.x, this.character.mesh.position.y + 1.5, this.character.mesh.position.z + .25);
        let ray_2 = new BABYLON.Ray(raycast_2, BABYLON.Vector3.Up().scale(-1), 1.5);
        let pick_2 = this.scene.pickWithRay(ray_2, predicate);

    
        // //debug lines
        // if (!this.rayLine) {
        //     // Create the line if it doesn't exist
        //     this.rayLine = BABYLON.Mesh.CreateLines("rayLine", [raycastFloorPos.subtract(this.character.mesh.position), endPosition.subtract(this.character.mesh.position)], this.scene);
        //     // Set the character mesh as the parent of the line mesh
        //     this.rayLine.checkCollisions = false;
        //     this.rayLine.isPickable = false;
        //     this.rayLine.parent = this.character.mesh;
        // } else {
        //     // Update the existing line
        //     BABYLON.Mesh.CreateLines(null, [raycastFloorPos.subtract(this.character.mesh.position), endPosition.subtract(this.character.mesh.position)], null, null, this.rayLine);
        // }
        ////debug lines END

        if (this.character.previousAnimation == 'fall' && pick.hit && !this.isTouchingGround && !this.character.characterState['isLanding']&& !this.character.characterState['isJumping'] && this.character.mesh.characterVelocity<0) { 
            this.character.characterState['isLanding'] = true //this.character.characterState['isLanding'] = false
            this.character.characterState['isFalling'] = false
            this.character.characterState['isIddle'] = false
            
         //   alert("k")

            console.log(this.character.characterState)
            this.landingOnce ? (()=>{})() :this.character.playLandingAnimation(true)
            this.landingOnce = true
            return pick.pickedPoint;
        } else { 
            this.movingPlatformExampleZ = [0,0];
            return BABYLON.Vector3.Zero();
        }
    }

    climbMovingPlatCompensation(){ 

        if(this.currentMovingPlatform.movingPlatform ){
       //     console.log(this.currentMovingPlatform.id)
            this.movingPlatformOffset(this.currentMovingPlatform)
        }

    }

    frontRayCast() {
        // Define the start position of the first raycast from the center of the character mesh
        let reducer = 1.6
        let raycastStartPosition1 = this.character.mesh.position.clone();
        
        // Define an offset to adjust the location of the beginning of the first ray (debugging)
        let offset1 = new BABYLON.Vector3(0, 4-reducer, 0); // Adjust the offset as needed
    
        // Apply the offset to the first raycast start position
        raycastStartPosition1.addInPlace(offset1);
    
        // Define the direction of the first raycast (forward from the character)
        let rayDirection1 = this.character.mesh.forward.clone()//.negate();
    
        // Define the length of the first raycast
        let rayLength = 0.8//0.6; //before third ray // Adjust the length of the ray as needed
    
        // Create the first ray
        let ray1 = new BABYLON.Ray(raycastStartPosition1, rayDirection1, rayLength);
    
        // Define the predicate function for the pickWithRay method
        let predicate = (mesh) => {
            // Add your custom conditions for picking meshes here
            return mesh.isPickable && mesh.isEnabled();
        };
    
        // Perform the first raycasting
        let pick1 = this.scene.pickWithRay(ray1, predicate);
    
        // Calculate the end position of the first raycast
        let endPosition1 = raycastStartPosition1.add(rayDirection1.negate().scale(rayLength));
    
        // Debugging: Create or update the debug line for the first ray
        if (!this.frontRayLine1) {
            // Create the line if it doesn't exist
            this.frontRayLine1 = BABYLON.Mesh.CreateLines("frontRayLine1", [raycastStartPosition1.subtract(this.character.mesh.position.scale(0.7)), endPosition1.subtract(this.character.mesh.position.scale(0.7))], this.scene);
            // Set the character mesh as the parent of the line mesh
            this.frontRayLine1.checkCollisions = false;
            this.frontRayLine1.isPickable = false;
            this.frontRayLine1.parent = this.character.mesh;

        } else {
            // Update the existing line
            BABYLON.Mesh.CreateLines(null, [raycastStartPosition1.subtract(this.character.mesh.position.scale(0.7)), endPosition1.subtract(this.character.mesh.position.scale(0.7))], null, null, this.frontRayLine1);
        }

        // Define the start position of the second raycast from the center of the character mesh
        let raycastStartPosition2 = this.character.mesh.position.clone();
    
        // Define an offset to adjust the location of the beginning of the second ray (debugging)
        let offset2 = new BABYLON.Vector3(0, 3.2-reducer, 0); // Adjust the offset as needed
    
        // Apply the offset to the second raycast start position
        raycastStartPosition2.addInPlace(offset2);
    
        // Define the direction of the second raycast (forward from the character)
        let rayDirection2 = this.character.mesh.forward.clone();
    
        // Create the second ray
        let ray2 = new BABYLON.Ray(raycastStartPosition2, rayDirection2, rayLength);
    
        // Perform the second raycasting
        let pick2 = this.scene.pickWithRay(ray2, predicate);
    
        // Calculate the end position of the second raycast
        let endPosition2 = raycastStartPosition2.add(rayDirection2.negate().scale(rayLength));
    
        // Debugging: Create or update the debug line for the second ray
        if (!this.frontRayLine2) {
            // Create the line if it doesn't exist
            this.frontRayLine2 = BABYLON.Mesh.CreateLines("frontRayLine2", [raycastStartPosition2.subtract(this.character.mesh.position.scale(0.7)), endPosition2.subtract(this.character.mesh.position.scale(0.7))], this.scene);
            // Set the character mesh as the parent of the line mesh
            this.frontRayLine2.checkCollisions = false;
            this.frontRayLine2.isPickable = false;
            this.frontRayLine2.parent = this.character.mesh;
        } else {
            // Update the existing line
            BABYLON.Mesh.CreateLines(null, [raycastStartPosition2.subtract(this.character.mesh.position.scale(0.7)), endPosition2.subtract(this.character.mesh.position.scale(0.7))], null, null, this.frontRayLine2);
        }

        ///////////////////////////////////////////////////////////
        // Define the start position of the second raycast from the center of the character mesh
      //  let raycastStartPosition3 = this.character.mesh.position.clone();
    
        // Define an offset to adjust the location of the beginning of the second ray (debugging)
      //  let offset3 = new BABYLON.Vector3(0, 3.6-reducer, 0); // Adjust the offset as needed
    
        // Apply the offset to the second raycast start position
     //   raycastStartPosition3.addInPlace(offset3);
    
        // Define the direction of the second raycast (forward from the character)
     //   let rayDirection3 = this.character.mesh.forward.clone();
    
        // Create the second ray
      //  let ray3 = new BABYLON.Ray(raycastStartPosition3, rayDirection3, rayLength);
    
        // Perform the second raycasting
    //    let pick3 = this.scene.pickWithRay(ray3, predicate);
    
        // Calculate the end position of the second raycast
     //   let endPosition3 = raycastStartPosition3.add(rayDirection3.negate().scale(rayLength));
    
        // Debugging: Create or update the debug line for the second ray
        // if (!this.frontRayLine3) {
        //     // Create the line if it doesn't exist
        //     this.frontRayLine3 = BABYLON.Mesh.CreateLines("frontRayLine3", [raycastStartPosition3.subtract(this.character.mesh.position.scale(0.7)), endPosition3.subtract(this.character.mesh.position.scale(0.7))], this.scene);
        //     // Set the character mesh as the parent of the line mesh
        //     this.frontRayLine3.checkCollisions = false;
        //     this.frontRayLine3.isPickable = false;
        //     this.frontRayLine3.parent = this.character.mesh;
        // } else {
        //     // Update the existing line
        //     BABYLON.Mesh.CreateLines(null, [raycastStartPosition3.subtract(this.character.mesh.position.scale(0.7)), endPosition3.subtract(this.character.mesh.position.scale(0.7))], null, null, this.frontRayLine3);
        // }
        //////////////////////////////////////////////////////////////

    let isHang = false

    // if(pick3.hit && pick3.pickedMesh.id.includes("boss")){

    //     if(!this.dialogsStates.cigGuy){
    //         this.dialogsStates.cigGuy = true
    //     this.ui.cigarGuyDialog(pick3.pickedMesh,this.engine,this.scene,this.scene.activeCamera,this.dialogsStates) //meshCig,engine,scene,camera
    //     }
    // }

    if(!pick1.hit && (pick2.hit ) && !this.character.characterState['isClimbing']){
     //   pick2 = pick2.hit ? pick2 : pick3
        console.log("edge2")
        let surfaceNormal = pick2.getNormal();

        let contactPoint = pick2.pickedPoint.clone();


    // 1. Get the cube's top Y position (assuming it's a cube)
    let cubeMesh = pick2.pickedMesh;
    let cubeTopY = cubeMesh.getBoundingInfo().boundingBox.maximumWorld.y;
    
    // 2. Create edge point using:
    // - X/Z from contact point
    // - Y from cube top
    let edgePoint = new BABYLON.Vector3(
        contactPoint.x,
        cubeTopY,  // This is the exact top edge of the cube
        contactPoint.z
    );


        // Calculate the angle between the ray direction and the surface normal
        let angleInRadians = Math.acos(rayDirection2.negate().dot(surfaceNormal));
        let angleInDegrees = BABYLON.Tools.ToDegrees(angleInRadians);
        console.log("edge degrees",angleInDegrees,pick2.pickedMesh)  //.includes("platform")
        if(angleInDegrees<30 || Math.abs(angleInDegrees-180)<30 || (pick2.pickedMesh.id.includes("platform")  && Math.abs(angleInDegrees-90)<30)){
           // console.log("hang!!")
           // isHang=true
          //  this.character.characterState['isClimbing'] = true
            this.character.characterState['isJumping'] = false
            this.character.characterState['isRunning'] = false
            this.character.characterState['isRunningBack'] = false
            this.character.characterState['isPunching'] = false
            this.character.characterState['isIddle'] = false
            this.character.characterState['isFalling'] = false
            this.character.characterState['isLanding'] = false

        // SIMPLE ROTATION ALIGNMENT - JUST DO THIS:

        // Correct normal if it's facing the wrong way (angle > 90°)
        if ( angleInDegrees<30) {
            surfaceNormal.scaleInPlace(-1); // Flip the normal
          //  angleInDegrees = 180 - angleInDegrees; // Update angle
        }

        if (pick2.pickedMesh.id.includes("platform") && Math.abs(angleInDegrees-90)<30) {
            // Create a rotation matrix for 90 degrees left around Y axis
            const rotationMatrix = BABYLON.Matrix.RotationY(-Math.PI/2);
            
            // Transform the normal using the rotation matrix
            const rotatedNormal = BABYLON.Vector3.TransformNormal(surfaceNormal, rotationMatrix);
            surfaceNormal.copyFrom(rotatedNormal);
            
            // Alternative simpler method (same result):
            // surfaceNormal = new BABYLON.Vector3(-surfaceNormal.z, surfaceNormal.y, surfaceNormal.x);
        }
            
        this.character.mesh.lookAt(
            this.character.mesh.position.add(surfaceNormal)
        );


        // Store the critical edge reference points (with height adjustment)
        this.character.climbingEdgePoint = edgePoint.add(surfaceNormal.scale(-0.5));
        this.character.climbingSurfaceNormal = surfaceNormal.clone();
        this.currentMovingPlatform = pick2.pickedMesh;
        
        // Position character relative to edge point (subtract 2.4 from Y)
        const characterPosition = this.character.climbingEdgePoint.clone();
        characterPosition.y -= this.character.highOffset_2; // Adjust for character height
        this.character.mesh.position.copyFrom(characterPosition);

        isHang=true
        this.character.characterState['isClimbing'] = true

        }
    }
        // Return the result of the first raycast
        return [pick1.hit ? pick1.pickedPoint : null,pick2.hit ? pick2.pickedPoint : null,isHang];
    }
    
    handleCharacterStates(){ //make a function that will give back the boolean given the variables


        if(this.character.characterState['isClimbing'] || this.character.characterState['isCrouchingUp'] || this.character.characterState['isLanding']){
            return -1
        }

        if(this.isTouchingGround && this.jumpImpulse==0 ){
            this.character.characterState['isFalling'] = false
            this.character.characterState['isLanding'] = false
        }

        if(this.isTouchingGround && this.arrowKeyPressed && !this.character.characterState['isPunching'] && this.jumpImpulse==0){
            this.character.characterState['isRunning'] = true
            this.character.characterState['isRunningBack'] = false
            this.character.characterState['isIddle'] = false
            this.character.characterState['isPunching'] = false
            this.character.characterState['isJumping'] = false
            this.character.characterState['isLanding'] = false
        }else if(this.isTouchingGround && !this.arrowKeyPressed && this.punchingButtonPressed && !this.character.characterState['isPunching']&& this.jumpImpulse==0){
            this.character.characterState['isRunning'] = false
            this.character.characterState['isRunningBack'] = false
            this.character.characterState['isPunching'] = true
            this.character.characterState['isIddle'] = false
            this.character.characterState['isJumping'] = false
            this.character.characterState['isLanding'] = false
        }else if(this.isTouchingGround && !this.character.characterState['isPunching'] && !this.character.characterState['isIddle'] && this.jumpImpulse==0 && !this.arrowDownKeyPressed && !this.character.characterState['isFalling']){
            console.log("IDDLE ACTIVATED!!!")
            this.character.characterState['isIddle'] = true
            this.character.characterState['isRunningBack'] = false
            this.character.characterState['isRunning'] = false
            this.character.characterState['isPunching'] = false
            this.character.characterState['isJumping'] = false
            this.character.characterState['isLanding'] = false
        }else if(this.isTouchingGround && this.arrowDownKeyPressed && !this.character.characterState['isPunching'] && this.jumpImpulse==0){
         //   console.log("controller runing back!!")
            this.character.characterState['isRunning'] = true
            this.character.characterState['isRunningBack'] = false
            this.character.characterState['isPunching'] = false
            this.character.characterState['isIddle'] = false
            this.character.characterState['isJumping'] = false
            this.character.characterState['isLanding'] = false

        }else if(this.jumpImpulse>0 && !this.character.characterState['isJumping'] && !this.character.characterState['isFalling']){
         //   console.log("jumping")
            this.character.characterState['isJumping'] = true
            this.character.characterState['isRunning'] = false
            this.character.characterState['isRunningBack'] = false
            this.character.characterState['isPunching'] = false
            this.character.characterState['isIddle'] = false
            this.character.characterState['isLanding'] = false
        }else if(!this.isTouchingGround  && this.jumpImpulse==0 && !this.character.characterState['isLanding']){
        //    console.log("falling!!!",JSON.stringify(this.character.characterState),this.character.previousAnimation)
            this.character.characterState['isJumping'] = false
            this.character.characterState['isRunning'] = false
            this.character.characterState['isRunningBack'] = false
            this.character.characterState['isPunching'] = false
            this.character.characterState['isIddle'] = false
            this.character.characterState['isFalling'] = true
            this.character.characterState['isLanding'] = false
        }
    }

    handleCharacterAnimations(){
        this.character.startCharacterAnimations()
    }

    isGrounded(){
        if (this.floorRaycast().equals(BABYLON.Vector3.Zero())) {
            this.isTouchingGround =false
            return false
        } else {
            if(!this.isTouchingGround && !this.character.characterState['isCrouchingUp']){
              //   this.character.landingSound.play()
         //     this.character.playLandingAnimation()
            }
            this.isTouchingGround =true
            

            return true
        }
    }

    applyGravity(deltaTime){

        if(this.character.characterState['isClimbing'] ){ //this.character.characterState['isCrouchingUp']
            this.climbMovingPlatCompensation()
            this.physicsEngine.resetVelocity(this.character.mesh)
            return
        }

        let isGrounded = this.isGrounded()
        if(!isGrounded || this.jumpImpulse>0){

            
            this.landingOnce ? (() => {})() :this.floorRaycastLanding()

            
            this.resetMovingPlatformOffsets()
            this.physicsEngine.applyGravity(this.character.mesh, deltaTime,this.jumpImpulse); //  this.physicsEngine.applyGravity(this.character.mesh, this.scene.getEngine().getDeltaTime()/1000.0);
         
            // if(this.physicsEngine.accumulatedJumpHeight>this.physicsEngine.capHeight){
            //     console.log("CAP REACHED: ")
            //     this.jumpImpulse = 0
            //     this.physicsEngine.accumulatedJumpHeight = 0
            //  //   this.physicsEngine.applyGravity(this.character.mesh, deltaTime,this.jumpImpulse); //  this.physicsEngine.applyGravity(this.character.mesh, this.scene.getEngine().getDeltaTime()/1000.0);
         
            // }
         
         
            // Diminish the jump impulse over time
            this.jumpImpulse -= 300*deltaTime/this.speedFrameScale; //150*deltaTime;
            // Ensure jump impulse doesn't go negative
            this.jumpImpulse = Math.max(0, this.jumpImpulse);
      
        }else if(this.jumpingButtonPressed && !this.character.characterState['isCrouchingUp']){
          //  console.log("DELTA TIME: ",deltaTime)
            this.resetMovingPlatformOffsets()
            this.physicsEngine.resetVelocity(this.character.mesh)
            this.jumpImpulse = 60/(this.speedFrameScale**(1/1.5))//75//here i set the jumpimpulse //60 for 15 framrate max
            this.physicsEngine.applyGravity(this.character.mesh, deltaTime,this.jumpImpulse);
            this.jumpingButtonPressed = false;


            if(!this.character.characterState['isLanding'] &&(this.character.characterState['isJumping'] || this.character.characterState['isIddle']|| this.character.characterState['isRunning'])){
                if(this.timeOutLandingOnce){
 
                 this.timeOutLandingOnce = false
                 setTimeout(()=>{
                     this.timeOutLandingOnce = true
                     this.landingOnce = false
                 },800)
                 
             }
 
             }




         //   console.log("jump!!")
        }else if(isGrounded && !this.character.characterState['isCrouchingUp']){ 
           
            if(Math.abs(Math.abs(this.character.mesh.position.y) -Math.abs(this.pickedFloorPoint.y)) <2.5){
              //if(this.character.previousAnimation !="run" && this.character.previousAnimation != "walk" && this.character.previousAnimation != "iddle"){
              this.character.mesh.position.y = this.pickedFloorPoint.y
            }
            this.physicsEngine.resetVelocity(this.character.mesh)
            this.physicsEngine.accumulatedJumpHeight = 0

            if(!this.character.characterState['isLanding'] &&(this.character.characterState['isJumping'] || this.character.characterState['isIddle']|| this.character.characterState['isRunning'])){
               if(this.timeOutLandingOnce){

                this.timeOutLandingOnce = false
                setTimeout(()=>{
                    this.timeOutLandingOnce = true
                    this.landingOnce = false
                },800)
                
            }

            }


     
        }else{
            console.log("IS THIS EVER REACHED???")
            this.physicsEngine.accumulatedJumpHeight = 0
            this.physicsEngine.resetVelocity(this.character.mesh)
        }

        if(this.character.characterState['isCrouchingUp'] ){ //this.character.characterState['isCrouchingUp']
            this.climbMovingPlatCompensation()
        }

    }









}