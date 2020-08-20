
//DEFINE CANVAS AND CONTEXT

var cvs = document.getElementById('gamecvs');
//sets a variable which calls the game canvas/container
var ctx = cvs.getContext('2d');
//allows the 2d image variant to be drawn on the canvas


//DEFINE GLOBAL VARIABLES AND CONSTANTS
const grav = 0.5;      //sets gravitational acceleration
const jump = 10 ;       //sets instantaneous flap speed setting 
const DEGREE = Math.PI / 180;
let frames = 0;
let pace = 2;
const backgrounds = ['assets/back1.png', 'assets/back2.png']
let position = []
let hb=false;
let bgno=0;

//TEMP place for bg


class Packet {
    constructor(socket) {
        this.ws = socket        
    }

    sendFlap(bird) {
        this.ws.send(JSON.stringify(
            {
                type: "flap",
                attr: {
                    usr: bird.username,
                    y : bird.y,
                    vy : -jump
                }
            }
        ))
    }

    sendDeath(bird) {
        this.ws.send(JSON.stringify(
            {
                type : "death",
                attr : {
                    usr : bird.username,
                    points: bird.points
                }
            }
        ))
    }

    sendNewPlayer(bird) {
        this.ws.send(JSON.stringify(
            {
                type : "new",
                attr : {
                    usr : bird.username,
                    x: bird.points
                }
            }
        ))
    }

    sendInfo(bird) {
        this.ws.send(JSON.stringify(
            {
                type : "info",
                attr : {
                    usr : bird.username,
                    x : bird.x,
                    y : bird.y,
                    vy : bird.speed
                }
            }
        ))
    }
}

var packet = new Packet(new WebSocket("ws://localhost:4000"))


const state = {
    current: 0,
    getReady: 0,
    game: 1,
    over: 2
}


$("#overlay").on("click", function(){if (myBird.y - myBird.radius <= 0) { return;}myBird.flap();})

var down = false;
document.addEventListener('keydown', function () {
    if(down) return;
    down = true;
   if(event.which===32)
   {
    if (myBird.y - myBird.radius <= 0) { return; }
    myBird.flap();
   }

}, false);

document.addEventListener('keyup', function () {
    down = false;
    if(event.which>=48 && event.which<=57){bgno (bgno=0) ? 'assets/back2.png': 'assets/back.png';}
    if(event.which===20){hb = (hb===false) ? true:false;}
}, false);


//BACKGROUND OBJECT
const bg=
{
    img:new Image(),

    draw: function()
    {
        this.img.src=backgrounds[bgno]
        ctx.drawImage(this.img, 0, 0, cvs.width, cvs.height)
    },

}

//DEFINE CLASS OF BIRD
class Bird {
    constructor(x, y, height) {     //CONSTRUCTOR defines (and initializes some) properties which every new bird must contain
        this.username = prompt("Please enter your name", "");
        this.x = x                     //Birds' x position should always be fixed until death.
        this.y = y                      //parameters
        this.height = height
        this.width = height*1.58333
        this.radius= height*0.56
        this.frame = 0                  //flapping animation frame init at 0
        this.speed = 0                  //velocity which combined with gravity can be used to obtain new y positions
        this.rotation = 0               //starts rotation off at 0 (These will be measured in ^^DEGREES)
        this.animationArray = []        //initializes array to hold frames(will be different for each bird so it's empty)
        this.sprite = new Image();        //initializes the sprite as a new image so it can be draw and its src reset
    }


    draw() {
        ctx.save(); //saves position of all elments
        ctx.translate(this.x, this.y);  //translates all elements
        ctx.rotate(this.rotation);  //rotates to the updated rotation angle
        ctx.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);
        //redraws the bird sprite while the canvas is at this angle
        if(hb===true){
            ctx.beginPath();
            ctx.arc(0+(this.height*0.1), 0 / 8, this.radius, 0, 2 * Math.PI);
            ctx.strokeStyle = "#FF0000";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        ctx.restore(); //restores all element from b4 save to original values but keeps the skewed bird :)

    }
    flap() {
        this.speed = -jump; //speed is completely reset into jump (negative because the origin is at the top), 
    }//so the current downward speed won't affect the height of the jump.
    update() {  //all properties are appropriately updated based on their conditions before redrawing can occur    
        this.frame += frames % 5 == 0 ? 1 : 0;
        this.frame = this.frame % animationArray.length;
        if (this.y + this.height/2 >= cvs.height-fg.height) {
            if (this.speed >= 0) { this.speed = 0 }
            this.rotation = 0;
            this.frame = 2;
            this.y = cvs.height-fg.height-this.height/2;
            this.y +=this.speed
        }
        else {
            this.speed += grav; //velocity incremented by acceleration pixels/interval^2
            this.sprite.src = animationArray[this.frame]  //finds the current frame to hold


            this.y += this.speed;   //pos is changed by the speed b/c speed holds pos y change per interval

            if (this.speed >= jump) {
                this.rotation = 90 * DEGREE;    //has fully finished its flap arc and is now in a nosedive
                this.frame = 1;
                if (this.speed <= jump + 0.75) { this.rotation = 0 }
            }


            else {
                this.rotation = -25 * DEGREE;       //is currently mid flapping arc and is thus tilted upward.
                //IF TIME ALLOWS, WE CAN ADD A MORE EASED TRANSITION JUST BY CREATING A ROTATION ARRAY RATHER THAN A SINGLE VARIABLE
                //AND ADDING ANOTHER FRAMES COUNTER

            }
        }
    }
}


var myBird = new Bird(100, 300, 55)
{
    animationArray = ['assets/up.svg', 'assets/mid.svg', 'assets/down.svg', 'assets/mid.svg']
}




var fg = {
    img: new Image(),

    height: cvs.height*0.144,
    x: 0,
    y: cvs.height*0.855,
    width: cvs.width*2,
    draw: function () {
        this.img.src = 'assets/front.png',
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height)

    },
    update: function () {
        this.x === -448 ? this.x = 0 : this.x -= pace
    }
}



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


    update() {  //all properties are appropriately updated based on their conditions before redrawing can occur       
        this.x -= pace;
        // if the pipes go beyond canvas, we delete them from the array
        if (this.x + this.width <= 0) { position.shift() }


    
    if(myBird.x+myBird.height*0.1 + myBird.radius > this.x && myBird.x+myBird.height*0.1 - myBird.radius < this.x + this.width && myBird.y + myBird.radius > this.y && myBird.y - myBird.radius < this.y + this.height){
        console.log("Collision T")
    }
    if(myBird.x+myBird.height*0.1 + myBird.radius > this.x && myBird.x+myBird.height*0.1 - myBird.radius < this.x + this.width && myBird.y + myBird.radius > this.y + this.height + this.gap && myBird.y - myBird.radius <  this.y + this.height + this.gap + this.height){
        console.log("Collision B")
    }

    }
}




function drawAll() {
    ctx.clearRect(0, 0, cvs.width, cvs.height);        //clears the entire canvas
    bg.draw()
    myBird.draw()
    for (var i = 0; i < position.length; i++) {
    position[i].draw()
    }
    fg.draw()

}
function loop() {
    
    myBird.update()
    fg.update()
    bg.draw()
    if (frames % 200 === 0) {position.push(new Pipes(Math.random() * 30 + 170, Math.random() * 350 - 690)) }
    drawAll()
    for (var i = 0; i < position.length; i++) {
        position[i].update()
        
    }
    frames++;
    
    
}
function start() {
    document.getElementById("overlay").innerHTML = ""
    setInterval(loop,15);
}

function fps()
{


}


    // var loops;
// startgamestate = setInterval(function(){
//     loops++
//     if(loops=5){clearInterval(startgamestate)}
// },1000)