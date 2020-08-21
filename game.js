//DEFINE CANVAS AND CONTEXT
//-------------------------------------------------------------------------
var cvs = document.getElementById('gamecvs');
//sets a variable which calls the game canvas/container
var ctx = cvs.getContext('2d');
//allows the 2d image variant to be drawn on the canvas
//--------------------------------------------------------------------------


//FRAMERATE EDITING VARIABLES
//--------------------------------------------------------------------------
lastFrameTimeMs = 0,
    maxFPS = 100,
    delta = 0,
    timestep = 1000 / maxFPS,
    framesThisSecond = 0,
    lastFpsUpdate = 0;
//--------------------------------------------------------------------------


//DEFINE GLOBAL VARIABLES
//--------------------------------------------------------------------------
const grav = 0.0025;      //sets gravitational acceleration
const jump = 0.75;       //sets instantaneous flap speed setting 
const DEGREE = Math.PI / 180;
let frames = 0;
let pace = 0.2;
const backgrounds = ['assets/back1.png', 'assets/back2.png']
let myBackground = new Image()
myBackground.src = backgrounds[0]
let position = []
let hb = false;
//--------------------------------------------------------------------------

//GAME STATES
//--------------------------------------------------------------------------
const state = {
    current: 0,
    getReady: 0,
    game: 1,
    over: 2
}
//--------------------------------------------------------------------------

//ASYNCH EVENTLISTENERS
//--------------------------------------------------------------------------
$("#overlay").on("click", function () {
    if (myBird.y - myBird.radius <= 0) { return; }
    myBird.flap();
    if (state.current === state.getReady) { state.current++ }
})

var down = false;
document.addEventListener('keydown', function (event) {
    if (down) return;
    down = true;
    if (event.which === 32) {
        if (myBird.y - myBird.radius <= 0) { return; }
        myBird.flap();
    }

}, false);

document.addEventListener('keyup', function (e) {
    down = false;
    if (e.which >= 48 && event.which <= 57) { myBackground.src = backgrounds[(parseInt(e.key) - 1) % backgrounds.length] }
    if (e.which === 20) { hb = (hb === false) ? true : false; }
}, false);
//--------------------------------------------------------------------------


//BACKGROUND
//--------------------------------------------------------------------------
var bg =
{
    draw: function () {
        ctx.drawImage(myBackground, 0, 0, cvs.width, cvs.height)
    },
}
//--------------------------------------------------------------------------


//DEFINE CLASS OF BIRD
//--------------------------------------------------------------------------
class Bird {
    constructor(x, y, height) {     //CONSTRUCTOR defines (and initializes some) properties which every new bird must contain
        this.username = prompt("Please enter your name", "");
        this.score = 0
        this.x = x                     //parameters
        this.y = y
        this.height = height
        this.width = height * 1.58333     //sets bird width so it's correct ratio to height
        this.radius = height * 0.56        //sets radius so it's correct ratio to bird size
        this.frame = 0                  //flapping animation frame init at 0
        this.speed = 0                  //velocity which combined with gravity can be used to obtain new y positions
        this.rotation = 0               //starts rotation off at 0 (These will be measured in ^^DEGREES)
        this.myAnimationArray = []        //initializes array to hold frames(will be different for each bird so it's empty)
        this.sprite = new Image();        //initializes the sprite as a new image so it can be draw and its src reset
    }


    draw() {
        document.getElementById("scoreboard").innerHTML = `<b>${this.score}</b>`;
        ctx.save(); //saves position of all elments
        ctx.translate(this.x, this.y);  //translates all elements
        ctx.rotate(this.rotation);  //rotates to the updated rotation angle
        ctx.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);
        //redraws the bird sprite while the canvas is at this angle
        if (hb === true) {  //if hitboxes have been turned on
            ctx.beginPath();    //begin defining stroke path
            ctx.arc(0 + (this.height * 0.1), 0, this.radius, 0, 2 * Math.PI); //"0" because already tanslated to bird x.  2pi radians (full circle) 
            ctx.strokeStyle = "#FF0000"; //makes the stroke red
            ctx.lineWidth = 2; //makes the outline of the hitbox slightly thicker
            ctx.stroke();   //makes the circle
        }
        ctx.restore(); //restores all element from b4 save to original values but keeps the skewed bird :)

    }
    flap() {
        this.speed = -jump; //speed is completely reset into jump (negative because the origin is at the top), 

    }//so the current downward speed won't affect the height of the jump.
    update(delta) {  //all properties are appropriately updated based on their conditions before redrawing can occur    
        this.frame += frames % delta == 0 ? 1 : 0;
        this.frame = this.frame % myAnimationArray.length;
        if (this.y + this.height / 2 >= cvs.height - fg.height) {
            if (this.speed >= 0) { this.speed = 0 }
            this.rotation = 0;
            this.frame = 2;
            this.y = cvs.height - fg.height - this.height / 2;
            this.y += this.speed * delta
        }
        else {
            this.speed += grav * delta; //velocity incremented by acceleration pixels/interval^2
            this.sprite.src = myAnimationArray[this.frame]  //finds the current frame to hold


            this.y += this.speed * delta;   //pos is changed by the speed b/c speed holds pos y change per interval

            if (this.speed >= jump * 0.6) {
                this.rotation = 90 * DEGREE;    //has fully finished its flap arc and is now in a nosedive
                this.frame = 1;
                if (this.speed <= jump * 0.6 + 0.5) { this.rotation = 0 }
            }


            else {
                this.rotation = -25 * DEGREE;       //is currently mid flapping arc and is thus tilted upward.
                //IF TIME ALLOWS, WE CAN ADD A MORE EASED TRANSITION JUST BY CREATING A ROTATION ARRAY RATHER THAN A SINGLE VARIABLE
                //AND ADDING ANOTHER FRAMES COUNTER

            }
        }

    }
}
//--------------------------------------------------------------------------


//OBJECT PLAYER's BIRD
//--------------------------------------------------------------------------
var myBird = new Bird(100, 300, 50)
{
    myAnimationArray = ['assets/up.svg', 'assets/mid.svg', 'assets/down.svg', 'assets/mid.svg']
}
//--------------------------------------------------------------------------


//FOREGROUND
//--------------------------------------------------------------------------
var fg = {
    img: new Image(),

    height: cvs.height * 0.144,
    x: 0,
    y: cvs.height * 0.855,
    width: cvs.width * 2,
    draw: function () {
        this.img.src = 'assets/front.png',
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height)

    },
    update: function (delta) {
        this.x <= -448 ? this.x = 0 : this.x -= pace * delta
    }
}
//--------------------------------------------------------------------------


//THE PIPE CLASS
//--------------------------------------------------------------------------
class Pipes {
    constructor(gap, y) {
        this.height = 720
        this.width = 110
        this.top = new Image()
        this.bottom = new Image()
        this.gap = gap                    //gap width (to be determined by a randomizer as well)
        this.top.src = 'assets/top.png'
        this.bottom.src = 'assets/bottom.png'  //sourcing the images to be used
        this.y = y;       //to be set to a rand no. by server
        this.x = cvs.width; //all new pipe objects start at the end of the canvas

    }

    draw() {
        ctx.drawImage(this.top, this.x, this.y, this.width, this.height);  //draws pipe at current x & @ the randomized y pos
        ctx.drawImage(this.bottom, this.x, this.y + this.height + this.gap, this.width, this.height);  //draws pipe w/ y relative to top pipe
    }


    update(delta) {  //all properties are appropriately updated based on their conditions before redrawing can occur       
        this.x -= pace * delta;
        // if the pipes go beyond canvas, we delete them from the array
        if (this.x + this.width <= 0) { position.shift() }

        //COLLISION DETECTION

        if (myBird.x + myBird.height * 0.1 + myBird.radius > this.x
            && myBird.x + myBird.height * 0.1 - myBird.radius < this.x + this.width
            && myBird.y + myBird.radius > this.y
            && myBird.y - myBird.radius < this.y + this.height) {
                state.current=2;
        }
        if (myBird.x + myBird.height * 0.1 + myBird.radius > this.x
            && myBird.x + myBird.height * 0.1 - myBird.radius < this.x + this.width
            && myBird.y + myBird.radius > this.y + this.height + this.gap
            && myBird.y - myBird.radius < this.y + this.height + this.gap + this.height) {
                state.current=2;
        }

        //PASS DETECTION

        if (this.x + this.width === myBird.x - myBird.radius / 2) { myBird.score++; }
    }
}
//--------------------------------------------------------------------------



function drawAll() {
    ctx.clearRect(0, 0, cvs.width, cvs.height);        //clears the entire canvas
    bg.draw()
    myBird.draw()
    for (var i = 0; i < position.length; i++) {
        position[i].draw()
    }
    fg.draw()
}

function updateAll(delta) {
    myBird.update(delta)
    fg.update(delta)
    for (var i = 0; i < position.length; i++) {
        position[i].update(delta)
    }
}


function panic() {
    delta = 0;
}

function mainLoop(timestamp) {
    if (timestamp < lastFrameTimeMs + (1000 / maxFPS)) {
        requestAnimationFrame(mainLoop);
        return;
    }
    delta += timestamp - lastFrameTimeMs;
    lastFrameTimeMs = timestamp;

    var numUpdateSteps = 0;
    while (delta >= timestep) {
        updateAll(timestep);
        if (frames % 200 * delta === 0) { position.push(new Pipes(Math.random() * 30 + 190, Math.random() * 350 - 690)) }
        frames++;
        delta -= timestep;
        if (++numUpdateSteps >= 240) {
            panic();
            break;
        }

    }
    



    drawAll()
    requestAnimationFrame(mainLoop)




}

requestAnimationFrame(mainLoop)
