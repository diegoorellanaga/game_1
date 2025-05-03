// import * as BABYLON from '@babylonjs/core';
// // required imports
// import "@babylonjs/core/Loading/loadingScreen";
// import "@babylonjs/loaders/glTF";
// import "@babylonjs/core/Materials/standardMaterial";
// import "@babylonjs/core/Materials/Textures/Loaders/envTextureLoader";

export default class InputManager {
    constructor(ui) {
        this.keys = {}; // Object to store the state of each key
        this.initListeners();
        this.ui = ui
        this.gameScene=null;
        this.mobileJump=null;
        this.mobilePunch=null;
        this.fixedCamera=1
    }

    initListeners() {
        // Event listeners for keydown and keyup events
        document.addEventListener('keydown', (event) => this.handleKeyDown(event));
        document.addEventListener('keyup', (event) => this.handleKeyUp(event));
    }

    handleKeyDown(event) {
        // Set the state of the pressed key to true
        this.keys[event.code] = true;
    }

    handleKeyUp(event) {
        // Set the state of the released key to false
        this.keys[event.code] = false;
    }

    isKeyDown(keyCode) {
        // Check if the specified key is currently pressed
        return this.keys[keyCode] || false;
    }

    pointClassifier(elementWidth, point,scaleDown) {
        var halfWidth = scaleDown*elementWidth / 2;

        if(point<=0){

            if(point<-halfWidth/2){
                return -1
            }else{
                return 0
            }


        }else{
            if(point>halfWidth/2){
                return 1
            }else{
                return 0
            }
        }
    

    }

    setUpMobile(gameScene, canvasRef) {

        this.gameScene = gameScene

        this.ui.gameUI()  //rotateButton
       // this.ui.createArrowPad()

        this.ui.rotateButton.onPointerDownObservable.add(() => {
            //   this.character._isJumping = true;
               let nextNumber = this.fixedCamera+1
               
               if(nextNumber>4){
                this.fixedCamera = 0
               }else{
                this.fixedCamera = nextNumber
               }
        });

        this.ui.respawnButton.onPointerDownObservable.add(() => {
            //   this.character._isJumping = true;
               this.respawnButtonPressed = true
        });
        this.ui.exitToMenu.onPointerDownObservable.add(() => {
            //   this.character._isJumping = true;
               this.exitToMenuButtonPressed = true
        });



        if(this.ui.isMobile ){
            this.ui.createJoystick(canvasRef)
        this.ui.jumpBtn.onPointerDownObservable.add(() => {
         //   this.character._isJumping = true;
            this.mobileJump = true;
        });
        this.ui.jumpBtn.onPointerUpObservable.add(() => {
          //  this.character._isJumping = false;
            this.mobileJump = false;
        });

        //Dash Button
        this.ui.dashBtn.onPointerDownObservable.add(() => {
            this.mobilePunch = true;
        });
        this.ui.dashBtn.onPointerUpObservable.add(() => {
            this.mobilePunch = false;
        });
    

        /////////////////////////////////////////////////////////////
        ////////////////first try buuttons //////////////////////
        // this.ui.buttonUp.onPointerDownObservable.add(() => {
        //     //  this.character._isJumping = false;
        //       this.mobileUp = true;
        //   });

        // this.ui.buttonUp.onPointerUpObservable.add(() => {
        //   //  this.character._isJumping = false;
        //     this.mobileUp = false;
        // });

        // this.ui.buttonDown.onPointerDownObservable.add(() => {
        //     //  this.character._isJumping = false;
        //       this.mobileDown = true;
        //   });

        // this.ui.buttonDown.onPointerUpObservable.add(() => {
        //   //  this.character._isJumping = false;
        //     this.mobileDown = false;
        // });
        
        
        // this.ui.buttonLeft.onPointerDownObservable.add(() => {
        //     //  this.character._isJumping = false;
        //       this.mobileLeft = true;
        //   });

        // this.ui.buttonLeft.onPointerUpObservable.add(() => {
        //   //  this.character._isJumping = false;
        //     this.mobileLeft = false;
        // });        
    
        // this.ui.buttonRight.onPointerDownObservable.add(() => {
        //     //  this.character._isJumping = false;
        //       this.mobileRight = true;
        //   });

        // this.ui.buttonRight.onPointerUpObservable.add(() => {
        //   //  this.character._isJumping = false;
        //     this.mobileRight = false;
        // });   
 ///////////////////////////////////////stick/////////////////////////////////////      

        this.gameScene.onBeforeRenderObservable.add(() => {
                if (this.ui.leftPuck.isDown) {

                    var moveX = Math.round(this.ui.xAddPos / (this.ui.thumbAreaWidth/3)) //xAddPos goes from [-this.ui.thumbAreaWidth/2, this.ui.thumbAreaWidth/2]
                    var moveY = Math.round(this.ui.yAddPos / (this.ui.thumbAreaWidth/3)) // we divide by 3 make movex and movey bigger and thus less sensitive (but at least bust be 2)

                
                    console.log("moveXwhole",this.ui.xAddPos,"moveYwhole",this.ui.yAddPos)
                    console.log("moveX",moveX,"moveY",moveY)

            
                    if (moveX <= -1 && moveY <= -1) {
                        this.mobileLeft = true;
                        this.mobileRight = false
                        this.mobileUp = false
                        this.mobileDown = true


                    } else if (moveX >= 1 && moveY <= -1) {
                        this.mobileLeft = false;
                        this.mobileRight = true
                        this.mobileUp = false
                        this.mobileDown = true


                        
                    } else if (moveX <= -1 && moveY >= 1) {
                        this.mobileLeft = true;
                        this.mobileRight = false
                        this.mobileUp = true
                        this.mobileDown = false


                        
                    } else if (moveX >= 1 && moveY >= 1) {
                        this.mobileLeft = false;
                        this.mobileRight = true
                        this.mobileUp = true
                        this.mobileDown = false


                        
                    } else if (moveX >= 1 && moveY == 0) {
                        this.mobileLeft = false;
                        this.mobileRight = true
                        this.mobileUp = false
                        this.mobileDown = false


                        
                    } else if (moveX <= -1 && moveY == 0) {
                        this.mobileLeft = true;
                        this.mobileRight = false
                        this.mobileUp = false
                        this.mobileDown = false


                        
                    } else if (moveX == 0 && moveY >= 1) {
                        this.mobileLeft = false;
                        this.mobileRight = false
                        this.mobileUp = true
                        this.mobileDown = false


                        
                    } else if (moveX == 0 && moveY <= -1) {
                        this.mobileLeft = false;
                        this.mobileRight = false
                        this.mobileUp = false
                        this.mobileDown = true


                        
                    } else if (moveX == 0 && moveY == 0) {
                        this.mobileLeft = false;
                        this.mobileRight = false
                        this.mobileUp = false
                        this.mobileDown = false

                       // this.character._isWalking = false
                    }
                    //console.log("moveX",Math.round(moveX),"moveZ",Math.round(moveY))

                } else {
                    this.mobileLeft = false;
                    this.mobileRight = false
                    this.mobileUp = false
                    this.mobileDown = false

                   // this.character._isWalking = false
                }
            }
        )
    }
//////////////////////////////stick
        



          }

          
          


}


// class PlayerInput {


//     constructor(scene, character, ui) {

//         this.scene = scene
//         this.inputMap;
//         this.character;

//         this.isCheckingConstantWaling = false

//         //Mobile Input trackers
//         this._ui;
//         this.mobileLeft;
//         this.mobileRight;
//         this.mobileUp;
//         this.mobileDown;
//         this._mobileJump;
//         this._mobileDash;

//         this._isRotating = false;

//         this.horizontal = 0
//         this.vertical = 0
//         this.horizontalAxis = 0
//         this.verticalAxis = 0
//         this.jumpKeyDown = false
//         this.dashing = false

//         this._ui = ui;

//         this.keyDown = false

//         this.character = character
//         scene.actionManager = new BABYLON.ActionManager(scene);

//         this.inputMap = {};
//         scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
//             this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
//            // console.log("key down")
//             this.keyDown = true
//         }));

//         scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => {
//             this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
//           //  console.log("key up")
//             this.keyDown = false
//         }));

//         scene.onBeforeRenderObservable.add(() => {
//             this._updateFromKeyboard();
//         });

//         // Set up Mobile Controls if on mobile device
//         if (this.ui.isMobile) {
//             this._setUpMobile();
//         }

//     }

//     checkConstantWalking(){
//         if(!this.isCheckingConstantWaling){
//             this.isCheckingConstantWaling = true
//             setTimeout(()=>{
//                 this.isCheckingConstantWaling = false
//              //   console.log((this.character._isWalking || (this.mobileLeft || this.mobileRight || this.mobileUp || this.mobileDown)) && (this.keyDown || this.ui.leftPuck.isDown) && !this.character._isJumping)
//                 if((this.character._isWalking || (this.mobileLeft || this.mobileRight || this.mobileUp || this.mobileDown)) && (this.keyDown || this.ui.leftPuck.isDown) && !this.character._isJumping){
//                     this.character._isConstantWalking = true
//                 }else{
//                     this.character._isConstantWalking = false
//                 }
//             },300)
//     }
//     }
//     //avoid inputmap 
//     _updateFromKeyboard() {
//         if ((this.inputMap["w"] || this.inputMap["ArrowUp"] || this.mobileUp) && !this.character.isDead) {
//             this.character._isWalking = true
//             this.vertical = BABYLON.Scalar.Lerp(this.vertical, 1, 0.2);
//             this.verticalAxis = 1;
//             
//          //   console.log("run",this.vertical,this.verticalAxis)

//         } else if ((this.inputMap["s"] || this.inputMap["ArrowDown"] || this.mobileDown) && !this.character.isDead) {
//             this.character._isWalking = true
//             this.vertical = BABYLON.Scalar.Lerp(this.vertical, -1, 0.2);
//             this.verticalAxis = -1;
//             
//         } else {
//             this.vertical = 0;
//             this.verticalAxis = 0;
//         }

//         if ((this.inputMap["a"] || this.inputMap["ArrowLeft"] || this.mobileLeft) && !this.character.isDead) {
//             this.character._isWalking = true
//             this.horizontal = BABYLON.Scalar.Lerp(this.horizontal, -1, 0.2);
//             this.horizontalAxis = -1;
//             

//             //console.log("pressing arrowleft!!!")

//         } else if ((this.inputMap["d"] || this.inputMap["ArrowRight"] || this.mobileRight) && !this.character.isDead) {
//             this.character._isWalking = true
//             this.horizontal = BABYLON.Scalar.Lerp(this.horizontal, 1, 0.2);
//             this.horizontalAxis = 1;
//             
//         } else {
//             this.horizontal = 0;
//             this.horizontalAxis = 0;
//         }

//         if (this.horizontal == 0 && this.vertical == 0) {
//             this.character._isWalking = false
//         }

//         if (this.inputMap["e"]) {
//             this._isRotating = true
//         }else{
//             this._isRotating = false
//         }

//         //dash
//         if (this.inputMap["a"]) {
//             // this.character._isRunning = true
//             this.dashing = false;
//         } else {
//             //  this.character._isRunning = false
//             this.dashing = false;
//         }

//         //Jump Checks (SPACE)
//         if ((this.inputMap["c"] ||this.inputMap[" "] || this._mobileJump) && !this.character.isDead) {
//             this.jumpKeyDown = true;
//             this.character._isJumping = true;
//         } else {
//             this.jumpKeyDown = false;
//             this.character._isJumping = false;
//         }
//     }

//     // Mobile controls
//     _setUpMobile() {
//         //Jump Button
//         this.ui.jumpBtn.onPointerDownObservable.add(() => {
//             this.character._isJumping = true;
//             this._mobileJump = true;
//         });
//         this.ui.jumpBtn.onPointerUpObservable.add(() => {
//             this.character._isJumping = false;
//             this._mobileJump = false;
//         });

//         //Dash Button
//         this.ui.dashBtn.onPointerDownObservable.add(() => {
//             this._mobileDash = true;
//         });
//         this.ui.dashBtn.onPointerUpObservable.add(() => {
//             this._mobileDash = false;
//         });


//         this.ui.createJoystick()

//         this.scene.onBeforeRenderObservable.add(() => {
//                 if (this.ui.leftPuck.isDown) {

//                     var moveX = Math.round(this.ui.xAddPos / 140)
//                     var moveY = Math.round(this.ui.yAddPos / 140)
//                     console.log(moveX, moveY)
//                     if (moveX <= -1 && moveY <= -1) {
//                         this.mobileLeft = true;
//                         this.mobileRight = false
//                         this.mobileUp = false
//                         this.mobileDown = true

// 
//                         

//                     } else if (moveX >= 1 && moveY <= -1) {
//                         this.mobileLeft = false;
//                         this.mobileRight = true
//                         this.mobileUp = false
//                         this.mobileDown = true

// 
//                         
//                     } else if (moveX <= -1 && moveY >= 1) {
//                         this.mobileLeft = true;
//                         this.mobileRight = false
//                         this.mobileUp = true
//                         this.mobileDown = false

// 
//                         
//                     } else if (moveX >= 1 && moveY >= 1) {
//                         this.mobileLeft = false;
//                         this.mobileRight = true
//                         this.mobileUp = true
//                         this.mobileDown = false

// 
//                         
//                     } else if (moveX >= 1 && moveY == 0) {
//                         this.mobileLeft = false;
//                         this.mobileRight = true
//                         this.mobileUp = false
//                         this.mobileDown = false

// 
//                         
//                     } else if (moveX <= -1 && moveY == 0) {
//                         this.mobileLeft = true;
//                         this.mobileRight = false
//                         this.mobileUp = false
//                         this.mobileDown = false

// 
//                         
//                     } else if (moveX == 0 && moveY >= 1) {
//                         this.mobileLeft = false;
//                         this.mobileRight = false
//                         this.mobileUp = true
//                         this.mobileDown = false

// 
//                         
//                     } else if (moveX == 0 && moveY <= -1) {
//                         this.mobileLeft = false;
//                         this.mobileRight = false
//                         this.mobileUp = false
//                         this.mobileDown = true

// 
//                         
//                     } else if (moveX == 0 && moveY == 0) {
//                         this.mobileLeft = false;
//                         this.mobileRight = false
//                         this.mobileUp = false
//                         this.mobileDown = false

//                        // this.character._isWalking = false
//                     }
//                     //console.log("moveX",Math.round(moveX),"moveZ",Math.round(moveY))

//                 } else {
//                     this.mobileLeft = false;
//                     this.mobileRight = false
//                     this.mobileUp = false
//                     this.mobileDown = false

//                    // this.character._isWalking = false
//                 }
//             }

//         )

//     }

// }