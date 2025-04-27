import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';
// required imports
import "@babylonjs/core/Loading/loadingScreen";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Materials/Textures/Loaders/envTextureLoader";
import { Coordinate } from '@babylonjs/core';

export default class Hud {

    constructor(serverLocation) {
        this.serverLocation = serverLocation 
        this.next1=null;
        this.next2=null;
        this.next3=null;
        this.next4=null;
        this.textsArray = [["Fail Attempts: 0","Success Attempts: 0","Success Rate: 0%"],["F: 0","S: 0","R: 0%"]]

        this.isMobile = false
        this.scaleFactor = 0.5
        this.extraScaleFactor = 1
        this.leftPuck = false;
        this.forceMovile = false
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || this.forceMovile ) {
            this.extraScaleFactor = 0.8
            this.isMobile = true; // tells inputController to track mobile inputs
        }

        this.mF = this.isMobile*this.scaleFactor+!this.isMobile*1
        this.selector = this.isMobile*1
        this.rotateButton=null;
        this.respawnButton=null;

        this.temp =  new BABYLON.Vector3();

        this.cigClickCount= 0
    }

    async newMenuPage(){
        var sizeButtonParam = 10
        var screenSize = Math.min(window.innerWidth, window.innerHeight) / sizeButtonParam;
        var respawnSize = Math.min(screenSize, screenSize); // Set both width and height to the calculated size
        // Create a button
        var guiMenu = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
var button = GUI.Button.CreateImageOnlyButton("buttonLeft", this.serverLocation+ "/assets/buttons/buttonLeft.png");
button.width = respawnSize+"px";
button.height = respawnSize+"px";
button.color = "black";

button.thickness = 0;
// button.background = "green";
button.cornerRadius = 20;
button.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
button.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
button.top = "20px";
button.left = "20px";
guiMenu.addControl(button);
this.moveLeftButton = button


var button1 = GUI.Button.CreateImageOnlyButton("buttonRight", this.serverLocation+ "/assets/buttons/buttonRight.png");
button1.width = respawnSize+"px";
button1.height = respawnSize+"px";
button1.color = "black";
// button.background = "green";
button1.cornerRadius = 20;
button1.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
button1.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
button1.top = "20px";
button1.left = "-20px";
button1.thickness = 0;
guiMenu.addControl(button1);
this.moveRightButton = button1


    }

   
 getDialogBoxCoordinates(mesh,engine,scene,camera) {
    const vertices = mesh.getBoundingInfo().boundingBox.vectorsWorld;
    const viewport = camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight());
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    
    for (const vertex of vertices) {
        BABYLON.Vector3.ProjectToRef(vertex, BABYLON.Matrix.IdentityReadOnly, scene.getTransformMatrix(), viewport, this.temp);
    
        minX = Math.min(minX, this.temp.x);
        maxX = Math.max(maxX, this.temp.x);
        minY = Math.min(minY, this.temp.y);
        maxY = Math.max(maxY, this.temp.y);
    }
    
    const canvasZone = engine.getRenderingCanvas().parentNode;
    const offsetLeft = canvasZone.offsetLeft; //we compensate to babylonjs center coord system we devide by 2
    const offsetTop = canvasZone.offsetTop;
    const canvasWidth = engine.getRenderWidth();
    const canvasHeight = engine.getRenderHeight();

    const left = (minX < 0) ? offsetLeft : minX + offsetLeft;
    const top = (minY < 0) ? offsetTop : minY + offsetTop;
    const width = (maxX > canvasWidth) ? canvasWidth - ((minX > 0) ? minX : 0) : maxX - ((minX > 0) ? minX : 0);
    const height = (maxY > canvasHeight) ? canvasHeight - ((minY > 0) ? minY : 0) : maxY - ((minY > 0) ? minY : 0);

    var coordinates_boundary_box = [0,0,0,0]
    coordinates_boundary_box[0] =parseInt((minX>0)*minX)
    coordinates_boundary_box[1] =parseInt((minY>0)*minY)
    coordinates_boundary_box[2] =parseInt((maxX<canvasWidth)*maxX + (maxX>canvasWidth)*canvasWidth)
    coordinates_boundary_box[3] =parseInt((maxY<canvasHeight)*maxY + (maxY>canvasHeight)*canvasHeight)

///console.log("data from boundary box",coordinates_boundary_box)
  //  console.log("data from canvas",offsetLeft,offsetTop,canvasWidth,canvasHeight)

    return [(left-canvasWidth/2), top-canvasHeight/2, width, height]//[left, top, width, height];
}


    cigarGuyDialog(meshCig,engine,scene,camera,dialogStates){
// Create GUI
const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');

// Create a translucent square for the dialog box
const dialogContainer = new GUI.Rectangle();
dialogContainer.isVisible = false
dialogContainer.width = '350px';
dialogContainer.height = '200px';
dialogContainer.background = 'rgba(0, 0, 0, 0.4)'; // Translucent black
dialogContainer.cornerRadius = 20;
dialogContainer.thickness = 0; // No border
dialogContainer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
dialogContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
advancedTexture.addControl(dialogContainer);

// Create dialog text
const dialogText = new GUI.TextBlock();
dialogText.text = 'Hello, welcome to Babylon.js!';
dialogText.color = 'white';
dialogText.fontSize = 24;
dialogText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
dialogText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
dialogText.paddingTop = '20px';
dialogContainer.addControl(dialogText);

// Create button
const nextButton = GUI.Button.CreateSimpleButton('nextButton', 'Next');
nextButton.width = '100px';
nextButton.height = '40px';
nextButton.color = 'white';
nextButton.cornerRadius = 10;
nextButton.background = 'green';
nextButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
nextButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
nextButton.bottom = '-20px';
nextButton.isVisible = false;
dialogContainer.addControl(nextButton);


// Function to convert mesh position to screen coordinates and adjust dialog box position and size
const adjustDialogBoxPosition = (mesh, dialogContainer) => {
    const coordinates = this.getDialogBoxCoordinates(mesh,engine,scene,camera);
    dialogContainer.left = `${coordinates[0]+100}px`;
    dialogContainer.top = `${coordinates[1]-150}px`;

    
   // dialogContainer.width = `${coordinates[2]}px`;
  //  dialogContainer.height = `${coordinates[3]}px`;
    //console.log("COORDINATES: ",coordinates)
}



// Event handler for button click
nextButton.onPointerUpObservable.add(() => {
    // Replace dialog text with new content
    this.cigClickCount = this.cigClickCount + 1
    dialogText.text = 'This is the next dialog!';

        // Check if the click count is 2
        if (this.cigClickCount === 2) {
            this.cigClickCount= 0
            // Hide or remove the dialog box
            dialogContainer.isVisible = false; // Or advancedTexture.removeControl(dialogContainer);
                    // Clear the interval
        clearInterval(this.cigGuyInterval);
        dialogStates.cigGuy = false
        }

        


});

// Show button after some delay
this.cigGuyInterval = setInterval(() => {

    adjustDialogBoxPosition(meshCig, dialogContainer) 
    nextButton.isVisible = true;
    dialogContainer.isVisible = true;
}, 50);

    }

    async menuPage() {
        var guiMenu = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI"); //https://static.wixstatic.com/media/0e7f19_83673e799add4bf9a956e4bf69f7c6a4~mv2.jpg
       // guiMenu.idealHeight = 720; //fit our fullscreen ui to this height //https://static.wixstatic.com/media/e0858c_3659117970ea4acca86a6fa3ece32816~mv2.png
    //    var image = new GUI.Image("portada", "https://static.wixstatic.com/media/0e7f19_0f9af7c4bd2140bbbb0b17b43937d270~mv2.jpg");
     //   guiMenu.addControl(image);

        var next = GUI.Button.CreateSimpleButton("next", "PLAY");
        next.color = "black";
        next.background = "green"
        next.cornerRadius = 20*this.mF;
        next.thickness = 4*this.mF;
        next.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        next.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        next.width = 84*this.mF+"px";
        next.height = 54*this.mF+"px";
        next.top = "-3%";
        next.left = "-3%";
        if(this.isMobile){
            next.fontSize =10
        }

       // guiMenu.addControl(next);

        // GUI
        //var guiMenu = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
         
        this.next1 = GUI.Button.CreateSimpleButton("next1", "World 1");
        this.next1.color = "white";
        this.next1.background = "red"
        this.next1.thickness = 0;
        this.next1.cornerRadius = 20*this.mF;
        this.next1.thickness = 2*this.mF;
        this.next2 = GUI.Button.CreateSimpleButton("next2", "World 2");
        this.next2.color = "red";
        this.next2.background = "yellow"
        this.next2.thickness = 0;
        this.next2.cornerRadius = 20*this.mF;
        this.next2.thickness = 2;
        this.next3 = GUI.Button.CreateSimpleButton("next3", "World 3 (X)");
        this.next3.color = "red";
        this.next3.background = "yellow"
        this.next3.thickness = 0;
        this.next3.cornerRadius = 20*this.mF;
        this.next3.thickness = 2*this.mF;
        this.next4 = GUI.Button.CreateSimpleButton("next4", "World 4 (X)");
        this.next4.color = "red";
        this.next4.background = "yellow"
        this.next4.thickness = 0;
        this.next4.cornerRadius = 20*this.mF;
        this.next4.thickness = 2*this.mF;
    
        var grid = new GUI.Grid();   
        grid.background = "rgba(0,255,0,0.2)"; 
        grid.cornerRadius = 6;
        grid.thickness = 4;


        //guiMenu.addControl(rect1); 
        
        grid.width = 220*this.mF+"px";
        grid.height = 220*this.mF+"px";
    
        grid.addColumnDefinition(0.5);
        grid.addColumnDefinition(0.5);
        grid.addRowDefinition(0.5);
        grid.addRowDefinition(0.5);
        
        grid.addRowDefinition(0.7);
        grid.addRowDefinition(1);

    
        grid.addControl(this.next1, 0, 0);     
    
        grid.addControl(this.next2, 0, 1);  
    
        grid.addControl(this.next3, 1, 0); 
    
        grid.addControl(this.next4, 1, 1); 

        grid.addControl(next, 3, 1); 

        grid.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        grid.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    
     //   grid.top = "-3%";
      //  grid.left = "-3%";

        var text = new GUI.TextBlock();
        text.text = "Pick World!";
      //  text.left = "-100px";
        text.verticalAlignment =GUI.Control.VERTICAL_ALIGNMENT_TOP;  
      //  text.top = "1%";
        text.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;        

        var rect1 = new GUI.Rectangle();
        rect1.width = 250*this.mF+"px";
        rect1.height = 280*this.mF+"px";
        rect1.cornerRadius = 20*this.mF;
        rect1.color = "Orange";
        rect1.thickness = 4*this.mF;
        rect1.background = "green";
        rect1.clipChildren = false;
        rect1.addControl(text);
        rect1.addControl(grid);

        rect1.top = "-9%";
        rect1.left = "-3%";

        
        rect1.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        rect1.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;


      //  var rect2 = new GUI.Rectangle();
        var rect2 = new GUI.Rectangle();
        rect2.width = 110*this.mF+"px";
        rect2.height = 20*this.mF+"px";
        rect2.cornerRadius = 10*this.mF;
        rect2.color = "Orange";
        rect2.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        rect2.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        rect2.top = "-1%";
        rect2.left = "2%";

        this.checkbox = new GUI.Checkbox();
        this.checkbox.width = 20*this.mF+"px";
        this.checkbox.height = 20*this.mF+"px";
        this.checkbox.isChecked = false;
        this.checkbox.color = "green";
        // checkbox.onIsCheckedChangedObservable.add(function(value) {
        //     if (skull) {
        //         skull.useVertexColors = value;
        //     }
        // });

        this.checkbox.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.checkbox.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
       // this.checkbox.top = "-9%";
        this.checkbox.left = "-3%";


        var header = new GUI.TextBlock();
        header.text = "Cheat";
        header.width = 70*this.extraScaleFactor+"px";
       // header.marginLeft = "5px";
        header.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        header.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        header.color = "black";
    //    header.top = "-9%";
      //  header.left = "6%";
      if(this.isMobile){
        header.fontSize =8
    }


        rect2.addControl(header);
        rect2.addControl(this.checkbox);

        rect1.addControl(rect2)
       // guiMenu.addControl(rect1); 
        guiMenu.addControl(rect1); 

        //alert(3)
        return [guiMenu,0,next,this.next1,this.next2,this.next3,this.next4,this.checkbox]
    }


    deselectAllButtons(){
        this.next1.color = "red";
        this.next1.background = "yellow"

        this.next2.color = "red";
        this.next2.background = "yellow"

        this.next3.color = "red";
        this.next3.background = "yellow"

        this.next4.color = "red";
        this.next4.background = "yellow"
    }

    pressButton(buttonSelected){

        if(buttonSelected==1){
            this.deselectAllButtons()
            this.next1.color = "white";
            this.next1.background = "red"
        }else if(buttonSelected==2){
            this.deselectAllButtons()
            this.next2.color = "white";
            this.next2.background = "red"
        }else if(buttonSelected==3){
            this.deselectAllButtons()
            this.next3.color = "white";
            this.next3.background = "red"            
        }else if(buttonSelected==4){
            this.deselectAllButtons()
            this.next4.color = "white";
            this.next4.background = "red"            
        }

    }

    startedGameUI(){
        var guiMenu = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI"); //https://static.wixstatic.com/media/0e7f19_83673e799add4bf9a956e4bf69f7c6a4~mv2.jpg
        var text = new GUI.TextBlock();
        text.text = this.textsArray[this.selector][0];
        text.verticalAlignment =GUI.Control.VERTICAL_ALIGNMENT_TOP;  
        text.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;      
        if(this.isMobile){
            text.fontSize =10
        }
        var text1 = new GUI.TextBlock();
        text1.text = this.textsArray[this.selector][1];
        text1.verticalAlignment =GUI.Control.VERTICAL_ALIGNMENT_TOP;  
        text1.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;    

        if(this.isMobile){
            text1.fontSize =10
        }

        var text2 = new GUI.TextBlock();
        text2.text = this.textsArray[this.selector][2];
        text2.verticalAlignment =GUI.Control.VERTICAL_ALIGNMENT_TOP;  
        text2.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;   
        if(this.isMobile){
            text2.fontSize =10
        }

        var rect1 = new GUI.Rectangle();
        rect1.width = 250*this.mF*this.mF*this.extraScaleFactor+"px";
        rect1.height = 34*this.mF+"px";
        rect1.cornerRadius = 20*this.mF;
        rect1.color = "Orange";
        rect1.thickness = 4*this.mF;
        rect1.background = "green";
        rect1.clipChildren = false;
        rect1.addControl(text);
       // rect1.addControl(text1);

        rect1.top = -9/this.mF+"%";
        rect1.left = "-2%";

        var rect2 = new GUI.Rectangle();
        rect2.width = 250*this.mF*this.mF*this.extraScaleFactor+"px";
        rect2.height = 34*this.mF+"px";
        rect2.cornerRadius = 20*this.mF;
        rect2.color = "Orange";
        rect2.thickness = 4*this.mF;
        rect2.background = "green";
        rect2.clipChildren = false;
      //  rect2.addControl(text);
        rect2.addControl(text1);

        rect2.top = -14/this.mF+"%";
        rect2.left = "-2%";

        var rect3 = new GUI.Rectangle();
        rect3.width = 250*this.mF*this.mF*this.extraScaleFactor+"px";
        rect3.height = 34*this.mF+"px";
        rect3.cornerRadius = 20*this.mF;
        rect3.color = "Orange";
        rect3.thickness = 4*this.mF;
        rect3.background = "green";
        rect3.clipChildren = false;
      //  rect2.addControl(text);
        rect3.addControl(text2);

        rect3.top = -19/this.mF+"%";
        rect3.left = "-2%";



        rect1.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT; 
        rect2.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT; 
        rect3.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT; 
        guiMenu.addControl(rect1)

        guiMenu.addControl(rect2)

        guiMenu.addControl(rect3)




        var next = GUI.Button.CreateSimpleButton("Again", "AGAIN");
        next.color = "black";
        next.background = "blue"
        next.cornerRadius = 5*this.mF;
        next.thickness = 4*this.mF;
        next.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        next.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        next.width = 84*this.mF+"px";
        next.height = 64*this.mF+"px";
        next.top = -9/this.mF+"%";
        next.left = "-3%";


        if(this.isMobile){
            next.fontSize =10
        }

        guiMenu.addControl(next)


        return [text,text1,text2,next]
    }

    gameUI(){
        this.playerUI = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        const actionContainer = new GUI.Rectangle();
        actionContainer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        actionContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        actionContainer.height = 0.4;
        actionContainer.width = 0.2;
        actionContainer.left = "-2%";
        actionContainer.top = "-2%";
        actionContainer.thickness = 0;
        this.playerUI.addControl(actionContainer);


        if(this.isMobile || true){
        //grid for action button placement
        const actionGrid = new GUI.Grid();
        actionGrid.addColumnDefinition(.5);
        actionGrid.addColumnDefinition(.5);
        actionGrid.addRowDefinition(.5);
        actionGrid.addRowDefinition(.5);
        actionContainer.addControl(actionGrid);

        const dashBtn = GUI.Button.CreateImageOnlyButton("dash", "https://static.wixstatic.com/media/0e7f19_c098fcb255254ac692d850542a06cebf~mv2.png");
        dashBtn.thickness = 0;
        dashBtn.alpha = 0.8;
        dashBtn.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.dashBtn = dashBtn;

        const jumpBtn = GUI.Button.CreateImageOnlyButton("jump", "https://static.wixstatic.com/media/0e7f19_cf2414447fd944c6a73f06aaaf95236d~mv2.png");
        jumpBtn.thickness = 0;
        jumpBtn.alpha = 0.8;
        jumpBtn.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.jumpBtn = jumpBtn;

        actionGrid.addControl(dashBtn, 0, 1);
        actionGrid.addControl(jumpBtn, 1, 0);





        }
        // Calculate the size based on screen dimensions
        var sizeButtonParam = 8
        var screenSize = Math.min(window.innerWidth, window.innerHeight) / sizeButtonParam;
        var respawnSize = Math.min(screenSize, screenSize); // Set both width and height to the calculated size
        
        // Create the container for the buttons
        var guiMenu = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        
        // Create the 'next' button and position it at the top right
      //  var next = GUI.Button.CreateSimpleButton("next", "RESPAWN"); //respawn
        var respawn = new GUI.Image("next", this.serverLocation+ "/assets/buttons/person.png");
        respawn.color = "black";
        respawn.background = "green";
        respawn.cornerRadius = 35 * this.mF;
        respawn.thickness = 4 * this.mF;
        respawn.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        respawn.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        respawn.width = respawnSize+"px";
        respawn.height = respawnSize+"px";
        respawn.top = "3%";
        respawn.left = "-3%";
        guiMenu.addControl(respawn);
        this.respawnButton = respawn
        
        // Create the 'rotate' button and position it at the top left
        var rotate = new GUI.Image("rotate", this.serverLocation+ "/assets/buttons/3d.png");
        rotate.width = respawnSize+"px";
        rotate.height = respawnSize+"px";
        rotate.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        rotate.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        rotate.top = "3%";
        rotate.left = "-12%";
        guiMenu.addControl(rotate);
        this.rotateButton = rotate


        var exitToMenu = new GUI.Image("next", this.serverLocation+ "/assets/buttons/exit.png");
        exitToMenu.color = "black";
        exitToMenu.background = "green";
        exitToMenu.cornerRadius = 35 * this.mF;
        exitToMenu.thickness = 4 * this.mF;
        exitToMenu.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        exitToMenu.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        exitToMenu.width = respawnSize/1.2+"px";
        exitToMenu.height = respawnSize/1.2+"px";
        exitToMenu.top = "3%";
        exitToMenu.left = "3%";
        guiMenu.addControl(exitToMenu);
        this.exitToMenu = exitToMenu

        guiMenu.addControl(respawn)
        guiMenu.addControl(rotate)
      //  guiMenu.addControl(rotateChar)

        return [respawn,rotate,{}]//rotateChar]
    }

    createArrowPad(){

// Create the container for the arrow pad
this.arrowContainer = new GUI.Rectangle();
this.arrowContainer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
this.arrowContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
this.arrowContainer.height = 0.4;
this.arrowContainer.width = 0.2;
this.arrowContainer.left = "2%";
this.arrowContainer.top = "-2%";
this.arrowContainer.thickness = 0;
this.playerUI.addControl(this.arrowContainer);

// Create the grid for the arrow pad
const arrowGrid = new GUI.Grid();
arrowGrid.addColumnDefinition(0.33);
arrowGrid.addColumnDefinition(0.34);
arrowGrid.addColumnDefinition(0.33);
arrowGrid.addRowDefinition(0.33);
arrowGrid.addRowDefinition(0.34);
arrowGrid.addRowDefinition(0.33);
this.arrowContainer.addControl(arrowGrid);

// Create the button images for the arrow pad
this.buttonUp = GUI.Button.CreateImageOnlyButton("buttonUp",this.serverLocation+ "/assets/buttons/buttonUp.png");
this.buttonUp.thickness = 0;
this.buttonDown = GUI.Button.CreateImageOnlyButton("buttonDown",this.serverLocation+  "/assets/buttons/buttonDown.png");
this.buttonDown.thickness = 0;
this.buttonLeft = GUI.Button.CreateImageOnlyButton("buttonLeft", this.serverLocation+ "/assets/buttons/buttonLeft.png");
this.buttonLeft.thickness = 0;
this.buttonRight = GUI.Button.CreateImageOnlyButton("buttonRight", this.serverLocation+ "/assets/buttons/buttonRight.png");
this.buttonRight.thickness = 0;

// Set button positions
arrowGrid.addControl(this.buttonUp, 0, 1);
arrowGrid.addControl(this.buttonDown, 2, 1);
arrowGrid.addControl(this.buttonLeft, 1, 0);
arrowGrid.addControl(this.buttonRight, 1, 2);




    }

    createJoystick(canvasRef){
    
    
        //var element = document.getElementById('gameCanvas');
        var element = canvasRef
      var positionInfo = element.getBoundingClientRect();
      var height = positionInfo.height;
      var width = positionInfo.width;
    

      
        /////joystick tunning parameters:

        var scaleMainJoystickArea = 18 // this parameter tunnes the size of the whole thumb area, affecting all proportionally, the bigger the smaller
        var size = Math.round(height/scaleMainJoystickArea)  
        var scaleMainCircle = 10  //tunning parameter of the size of the big joystick circle 
        var scaleMiddleStaticCircle = 3  //tunning parameter of the size of the middle static circle of the joystick
        var scaleTouchMovingCircle = 2  // tunning parameter of the size of the thumb mark (moving small circle, appears when touched)
        var leftOffsetInner = 40 // the bigger the closer is to the left of the scree
        var bottomOffsetInner = 10 // the bigger the closer is to the bottom of the screen
        /////joystick tunning parameters:
    
        let adt = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.xAddPos = 0;
        this.yAddPos = 0;
        let xAddRot = 0;
        let yAddRot = 0;
        let sideJoystickOffset = Math.round(parseInt(width)/leftOffsetInner);  // distance from the left Math.round(parseInt(width)/50);
        let bottomJoystickOffset = - Math.round(parseInt(height)/bottomOffsetInner); //botom?? original 50 // the bigger the further way from bottom
        let translateTransform;    
        

     // console.log("size and scale",scale_puck,size)
      this.thumbAreaWidth = size*scaleMainCircle
      let leftThumbContainer = this.makeThumbArea("leftThumb", 2, "blue", null);
          leftThumbContainer.height = size*scaleMainCircle +"px"; //
          leftThumbContainer.width = size*scaleMainCircle +"px"; //
          leftThumbContainer.isPointerBlocker = true;
          leftThumbContainer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
          leftThumbContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
          leftThumbContainer.alpha = 0.1;
          leftThumbContainer.left = sideJoystickOffset;
          leftThumbContainer.top = bottomJoystickOffset;
         // leftThumbContainer.isVisible = false;
    
      let leftInnerThumbContainer = this.makeThumbArea("leftInnterThumb", 4, "blue", null);
          leftInnerThumbContainer.height = size*scaleMiddleStaticCircle +"px";//  //control the inner circle
          leftInnerThumbContainer.width = size*scaleMiddleStaticCircle+"px";//
          leftInnerThumbContainer.isPointerBlocker = true;
          leftInnerThumbContainer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
          leftInnerThumbContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
          
    
      this.leftPuck = this.makeThumbArea("leftPuck",0, "blue", "blue");
              this.leftPuck.height = size*scaleTouchMovingCircle +"px";//  //control the moving thumb area touched circle
              this.leftPuck.width = size*scaleTouchMovingCircle +"px";//
              this.leftPuck.isPointerBlocker = true;
              this.leftPuck.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
              this.leftPuck.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
              this.leftPuck.isMoving = false
    
          leftThumbContainer.onPointerDownObservable.add((coordinates) => {

              console.log("size and coordinates!!",size*scaleMainCircle,coordinates.x,coordinates.y,coordinates.x-(leftThumbContainer._currentMeasure.width*.5)-sideJoystickOffset,adt._canvas.height - coordinates.y-(leftThumbContainer._currentMeasure.height*.5)+bottomJoystickOffset)

              if(!this.leftPuck.isMoving){
              this.xAddPos = (coordinates.x-(leftThumbContainer._currentMeasure.width*.5)-sideJoystickOffset)// //this is the same center x calculation from the center of leftThumbContainer but multiplied with a scalar
              this.yAddPos = (adt._canvas.height - coordinates.y-(leftThumbContainer._currentMeasure.height*.5)+bottomJoystickOffset)////this is the same center y calculation from the center of leftThumbContainer but multiplied with a scalar
              }


              this.leftPuck.isVisible = true;                                                                           //leftThumbContainer._currentMeasure.width  width of the joystick (big area) we need to divide by half to get the radious
              this.leftPuck.floatLeft = coordinates.x-(leftThumbContainer._currentMeasure.width*.5)-sideJoystickOffset; //pixels from the center of the joystick to the touched point inn the x plane //sideJoystickOffset distance to the left of the joystick
              this.leftPuck.left = this.leftPuck.floatLeft;
              this.leftPuck.floatTop = adt._canvas.height - coordinates.y-(leftThumbContainer._currentMeasure.height*.5)+bottomJoystickOffset; // we do the same inn the y coordinate: distance of the touching point with respect to the center of the joystick
              this.leftPuck.top = this.leftPuck.floatTop*-1;  // you need to invert becuase if for instance we got -6                          //height of the screen - coordY - (height of the joysticl /2) + bottomJoystickOffset (but this is negative, when is negativev it means the distance with respect to the bottom, even if you give it to the top, that is why his name is bottom...)
              this.leftPuck.isDown = true;                    //meaning 6 pixels below the center y of the joysticks we need to transform                                                                                 // all this give us the distance of the x,y with respect to the center of the joystick
              leftThumbContainer.alpha = 0.4;                 // to the right coordinates in which goinng down is positive, this would be 6
          }); //INPORTANT INFO: in babylon js top and left are with respect to the center of the parent, that is why youu are calculating the coordinates like this, and you dont neeed to compensate with the "change of coordinates"
    
          leftThumbContainer.onPointerUpObservable.add((coordinates) =>{
              this.xAddPos = 0;
              this.yAddPos = 0;
              this.leftPuck.isDown = false;
              this.leftPuck.isVisible = false;
              this.leftPuck.isMoving = false
              leftThumbContainer.alpha = 0.1;
          });
    
    
          leftThumbContainer.onPointerMoveObservable.add((coordinates) => {
           
              if (this.leftPuck.isDown) { 
                  //here we redraw the thumb position in order to follow the touching area, and also we register the touching area to decide where to movev
                  this.leftPuck.isMoving = true
                  this.xAddPos = (coordinates.x-(leftThumbContainer._currentMeasure.width*.5)-sideJoystickOffset)// //this is the same center x calculation from the center of leftThumbContainer but multiplied with a scalar
                  this.yAddPos = (adt._canvas.height - coordinates.y-(leftThumbContainer._currentMeasure.height*.5)+bottomJoystickOffset)////this is the same center y calculation from the center of leftThumbContainer but multiplied with a scalar
                  this.leftPuck.floatLeft = this.xAddPos;
                  this.leftPuck.floatTop = this.yAddPos*-1;
                  this.leftPuck.left = this.leftPuck.floatLeft;
                  this.leftPuck.top = this.leftPuck.floatTop;

                  }
          });
    
       adt.addControl(leftThumbContainer);
       leftThumbContainer.addControl(leftInnerThumbContainer);
       leftThumbContainer.addControl(this.leftPuck);
       this.leftPuck.isVisible = false;
    
    }
    makeThumbArea(name, thickness, color, background, curves){
        let rect = new GUI.Ellipse();
            rect.name = name;
            rect.thickness = thickness;
            rect.color = color;
            rect.background = background;
            rect.paddingLeft = "0px";
            rect.paddingRight = "0px";
            rect.paddingTop = "0px";
            rect.paddingBottom = "0px";
            return rect;
     }

     makeOrangeCounter(number,total){
        var guiMenu = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI"); //https://static.wixstatic.com/media/0e7f19_83673e799add4bf9a956e4bf69f7c6a4~mv2.jpg
        var text = new GUI.TextBlock();
        text.text = number+"/"+total;
        text.verticalAlignment =GUI.Control.VERTICAL_ALIGNMENT_TOP;  
        text.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;    
        
        text.top = "3%";;
        text.left = "-3%";

        if(this.isMobile){
            text.fontSize =10
        }

       //var image = new GUI.Image("portada", "./assets2/smallorange.png");
       var image = new GUI.Image("portada", "http://localhost:8000/assets2/smallorange.png");
     //  guiMenu.addControl(image);  //http://localhost:8000

        var rect2 = new GUI.Rectangle();
        rect2.width = 80*this.mF*this.mF*this.extraScaleFactor+"px";
        rect2.height = 50*this.mF+"px";
        rect2.cornerRadius = 20*this.mF;
        // rect2.color = "Orange";
         rect2.thickness = 0;
        // rect2.background = "green";
        rect2.clipChildren = false;

        rect2.verticalAlignment =GUI.Control.VERTICAL_ALIGNMENT_TOP;  
        rect2.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;   
        rect2.top = "3%";;
        rect2.left = "-3%";



            const actionGrid = new GUI.Grid();
            actionGrid.addColumnDefinition(.5);
            actionGrid.addColumnDefinition(.5);
            actionGrid.addControl(image, 0, 0);
            actionGrid.addControl(text, 0, 1);

            rect2.addControl(actionGrid)


        guiMenu.addControl(rect2)
        return [text]        
     }
     

}



// //additional comments with respect to the joystick:

// ok so to be sure

// for the y calculation i give myself the following numbers as exmaple:


// height of the screen: 800 pixels:  position of the pointer 746 , bottom offset (-50) height of the thumbArea = 20 pixels, according to my calculation the 

// this.leftPuck.floatTop = adt._canvas.height - coordinates.y-(leftThumbContainer._currentMeasure.height*.5)+bottomJoystickOffset;

// gives me -6     this means that the y of the pointer is 6 pixels below the center y of the joystick 

// then you invert it this.leftPuck.top = this.leftPuck.floatTop*-1;   

// to mean that is 6 position down from the center y (since going down is positive) 
// because the this.leftPuck.top is the top with respect to the center of the joysticks, is this correct?? so 6 will be 6 down

// can you confirm this calculations and this reasoning?
// ChatGPT
// Yes, your calculations and reasoning are correct!

// Let's confirm the calculations step by step:

// Given:

// Height of the screen (canvas): 800 pixels
// Position of the pointer (y-coordinate): 746 pixels
// Bottom offset (bottomJoystickOffset): -50 pixels
// Height of the leftThumbContainer: 20 pixels
// Calculate the initial position of the joystick's puck (this.leftPuck.floatTop):
// arduino
// Copy code
// adt._canvas.height - coordinates.y - (leftThumbContainer._currentMeasure.height * 0.5) + bottomJoystickOffset
// = 800 - 746 - (20 * 0.5) - 50
// = 800 - 746 - 10 - 50
// = 800 - 806
// = -6
// Invert the value to match the typical graphical coordinate system orientation:
// kotlin
// Copy code
// this.leftPuck.top = this.leftPuck.floatTop * -1
// = -6 * -1
// = 6
// So, after inverting the value, this.leftPuck.top becomes 6 pixels, indicating that the joystick's puck is positioned 6 pixels downwards from the center y-coordinate of the joystick. This aligns with your understanding that the positive direction for this.leftPuck.top represents movement downwards from the center of the joystick, consistent with typical graphical coordinate systems.

// Your reasoning regarding the interpretation of positive and negative values for this.leftPuck.top is correct. Positive values indicate movement downwards from the center of the joystick, while negative values indicate movement upwards. Therefore, in this case, a value of 6 pixels represents a position 6 pixels downwards from the center y-coordinate of the joystick.

// User
// aa so when we do:

//        adt.addControl(leftThumbContainer);
//        leftThumbContainer.addControl(leftInnerThumbContainer);
//        leftThumbContainer.addControl(this.leftPuck);
//        this.leftPuck.isVisible = false;


// then we say that the coordinates of the leftPuck will be with respect to the center of the leftThimbContainer, is this correct? then what I said before is indeed correct? can you confirm?
// ChatGPT
// Yes, you're correct!

// When you add this.leftPuck as a control within leftThumbContainer using leftThumbContainer.addControl(this.leftPuck), the position of this.leftPuck will be relative to the top-left corner of leftThumbContainer. In other words, the coordinates of this.leftPuck will be with respect to the top-left corner of leftThumbContainer.

// Therefore, your earlier interpretation is indeed correct. When you calculated the position of this.leftPuck.floatTop and inverted it to set this.leftPuck.top, you correctly interpreted the position of this.leftPuck relative to the center of leftThumbContainer.

// In summary, your understanding that this.leftPuck.top represents the position of this.leftPuck relative to the center of leftThumbContainer is correct. The calculations and reasoning provided earlier align with this interpretation.