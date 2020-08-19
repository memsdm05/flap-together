
//DEFINE CANVAS AND CONTEXT

var cvs = document.getElementById('gamecvs');
//sets a variable which calls the game canvas/container
var ctx = cvs.getContext('2d');
//allows the 2d image variant to be drawn on the canvas


//DEFINE GLOBAL VARIABLES AND CONSTANTS
const grav = 0.25;      //sets gravitational acceleration
const jump = 7.5;       //sets instantaneous flap speed setting 
const radius = 40;      //sets hitbox radius
const DEGREE = Math.PI / 180;
let frames = 0;
let pace=1.5;
const backgrounds=['assets/background.png','assets/background2.png']
var bgno=0;


//TEMP place for bg

let background = new Image();    //bkgrd temp init inside of class for easier reference. will eventually be its own class
        background.src = backgrounds[bgno];   //""

const state = {
    current: 0,
    getReady: 0,
    game: 1,
    over: 2
}


var nPipe = { x: 10, y: 20, width: 40, height: 40 };
var sPipe = {}

// $("#overlay").on("click", function (evt) {

// });

document.onkeyup = function(event) {
    if (bird1.y - bird1.radius <= 0) { return; }
    bird1.flap();
}

function changeBG(){
        bgno++;
        bgno=bgno%2;
        background.src = backgrounds[bgno];
    }

//DEFINE CLASS OF BIRD
class Bird {
    constructor(x, y, width, height) {     //CONSTRUCTOR defines (and initializes some) properties which every new bird must contain
        this.x = x                     //Birds' x position should always be fixed until death.
        this.y = y                      //parameters
        this.width = width
        this.height = height
        this.frame = 0                  //flapping animation frame init at 0
        this.speed = 0                  //velocity which combined with gravity can be used to obtain new y positions
        this.rotation = 0               //starts rotation off at 0 (These will be measured in ^^DEGREES)
        this.animationArray = []        //initializes array to hold frames(will be different for each bird so it's empty)
        this.sprite = new Image();        //initializes the sprite as a new image so it can be draw and its src reset
    }


    draw() {
        ctx.clearRect(0, 0, cvs.width, cvs.height);        //clears the entire canvas
        ctx.drawImage(background, 0, 0, cvs.width, cvs.height) //draws background (MOVE THIS INTO BG VARIABLE LATER)
        ctx.save(); //saves position of all elments
        ctx.translate(this.x, this.y);  //translates all elements
        ctx.rotate(this.rotation);  //rotates to the updated rotation angle
        ctx.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);
        //redraws the bird sprite while the canvas is at this angle
        ctx.restore(); //restores all element from b4 save to original values but keeps the skewed bird :)

    }
    flap() {
        this.speed = -jump; //speed is completely reset into jump (negative because the origin is at the top), 
    }//so the current downward speed won't affect the height of the jump.
    update() {  //all properties are appropriately updated based on their conditions before redrawing can occur    
        this.frame += frames%5 == 0 ? 1 : 0;
            this.frame = this.frame%animationArray.length;
        if (this.y + this.height >= cvs.height - fg.height) {
            if (this.speed >= 0) { this.speed = 0 }
                this.rotation=0;
                this.frame=2;  
                this.y += this.speed;
        }
        else {
            this.speed += grav; //velocity incremented by acceleration pixels/interval^2
            this.sprite.src = animationArray[this.frame]  //finds the current frame to hold
        

        this.y += this.speed;   //pos is changed by the speed b/c speed holds pos y change per interval

        if (this.speed >= jump) {
            this.rotation = 90 * DEGREE;    //has fully finished its flap arc and is now in a nosedive
            this.frame = 1;
            if(this.speed<=jump+0.75)
            {this.rotation=0}
        }
        

        else {
            this.rotation = -25 * DEGREE;       //is currently mid flapping arc and is thus tilted upward.
            //IF TIME ALLOWS, WE CAN ADD A MORE EASED TRANSITION JUST BY CREATING A ROTATION ARRAY RATHER THAN A SINGLE VARIABLE
            //AND ADDING ANOTHER FRAMES COUNTER
            
        }
    }
    }
}  


var bird1 = new Bird(50, 300, 80, 50)
{
    animationArray = ['assets/up.svg', 'assets/mid.svg', 'assets/down.svg', 'assets/mid.svg']
}




var fg = {
    img: new Image(),
    
    height: 130,
    x: 0,
    y: 570,
    width: cvs.width*2,
    draw: function () {
        this.img.src='assets/front.png',
        // this.img.src = 'fg.png'     
        // ctx.rect(this.x, this.y, this.width, this.height)
        // let ptn = ctx.createPattern(fg.img, 'repeat-x');
        // ctx.fillStyle = ptn;
        // ctx.fill();
        ctx.drawImage(this.img,this.x,this.y,this.width,this.height)

    },
    update: function () 
    {
    this.x===-105 ? this.x=0:this.x-=pace
    }
}

function drawAll() {
    bird1.draw()
    fg.draw()
}
function loop() {
    bird1.update()
    fg.update()
    drawAll()

    requestAnimationFrame(loop);
    frames++;
}
function start() {
    document.getElementById("overlay").innerHTML = ""
    loop();
}

    // var loops;
// startgamestate = setInterval(function(){
//     loops++
//     if(loops=5){clearInterval(startgamestate)}
// },1000)