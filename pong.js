var animate = window.requestAnimationFrame ||
window.webkitRequestAnimationFrame ||
window.mozRequestAnimationFrame ||
function(callback) {window.setTimeout(callback,1000/60)};

var canvas = document.createElement('canvas');
var width = 600;
var height = 400;
canvas.width = width;
canvas.height = height;
var context = canvas.getContext('2d');



window.onload = function() {
    document.body.appendChild(canvas);
    animate(step);
};

var step = function() {
    update();
    render();
    animate(step);
};

//creating the paddles
function Paddle (x,y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.x_speed = 0;
    this.y_speed = 0;
    this.score= 0;
}

Paddle.prototype.render = function() {
    context.fillStyle = "#FFFFFF";
    context.fillRect(this.x, this.y, this.width, this.height);
};

function Player() {
    this.paddle = new Paddle (580, 175, 10, 50);
    this.score = this.paddle.score
}

function Computer() {
    this.paddle = new Paddle (10, 175, 10, 50);
    this.score = this.paddle.score
   }

Player.prototype.render = function(){
    this.paddle.render();
};

Computer.prototype.render = function(){
    this.paddle.render();
};

//creating the ball
function Ball (x,y) {
    this.x = x;
    this.y = y;
    this.x_speed = 6;
    this.y_speed = 0;
    this.radius = 5;
}

Ball.prototype.render = function(){
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 2 * Math.PI, false);
    context.fillStyle = "#FFFFFF";
    context.fill();
};

var player = new Player();
var computer = new Computer();
var ball = new Ball(300, 200);


var render = function() {
    context.fillStyle = "#000000";
    context.fillRect(0,0, width, height);
    
    // Draw the net (Line in the middle)
    context.beginPath();
    context.setLineDash([7, 15]);
    context.moveTo(300, 0);
    context.lineTo(300, 400);
    context.lineWidth = 5;
    context.strokeStyle = "#ffffff";

    // //printing scores
    context.font = "30px Comic Sans MS";
    context.fillStyle = "white";
    context.textAlign = "center";
    context.fillText(player.score.toString(), 150, 40);
    context.fillText(computer.score.toString(), 450, 40);

    context.stroke();
    player.render();
    computer.render();
    ball.render();
};

var update = function() {
    ball.update(player.paddle, computer.paddle);
};

Ball.prototype.update = function(paddle1, paddle2) {
    this.x += this.x_speed;
    this.y += this.y_speed;
    var top_x = this.x - 5;
    var top_y = this.y - 5;
    var bottom_x = this.x + 5;
    var bottom_y = this.y + 5;

    if(this.y -5 < 0) { // bouncing of the top wall - bovenmuur raken
        this.y = 5;
        this.y_speed = -this.y_speed;
        beep(300);
    } else if(this.y + 5 > 400) { // bouncing of the bottom wall - rechtermuur raken
            this.y = 395;
            this.y_speed = -this.y_speed;
            beep(300);
    }

//volume of the tone. Default is 1, off is 0.
//type of tone. Possible values are sine, square, sawtooth, triangle, and custom. Default is sine.
//callback to use on end of tone
//function beep(frequency, volume, type, callback) {

//scoring a point - punt scoren - ball reset
 
    if(this.x < 0 || this.x > 600){
        this.y_speed = 0;
        this.x_speed = 5;
        this.y = 200;
        this.x = 300;
        beep(600, 1, 'triangle');        
        if(this.x < 0){
            player.score += 1;
        }
        if(this.x > 600){
            computer.score += 1;
        }
    }
// Hit detection - ball to paddle

    if(top_x > 300) {
        if(top_x < (paddle1.x + paddle1.width) && bottom_x > paddle1.x && top_y < (paddle1.y + paddle1.height) && bottom_y > paddle1.y) {
            // hit detection player paddle / speler paddle raken
            this.x_speed = -3;
            this.y_speed += (paddle1.y_speed / 2);
            this.x += this.y_speed;
            beep(200);
        }
    } else {
        if(top_x < (paddle2.x + paddle2.width) && bottom_x > paddle2.x && top_y < (paddle2.y + paddle2.height) && bottom_y > paddle2.y) {
            // hit detection computer paddle / computer paddle raken
            this.x_speed = 3;
            this.y_speed += (paddle2.y_speed / 2);
            this.x += this.x_speed;
            beep(200);

        }   
    }
};

//Controls - input and conversion to movement Player

var keysDown ={};

window.addEventListener("keydown", function(event) {
    keysDown[event.keyCode] = true;
});

window.addEventListener("keyup", function(event) {
delete keysDown[event.keyCode];
});

var update = function() {
    player.update();
    ball.update(player.paddle, computer.paddle);
};

Player.prototype.update = function () {
    for(var key in keysDown) {
        var value = Number(key);
        if(value == 38) { //left arrow - linkerpijl
        this.paddle.move(0, -4);
        } else if (value == 40) { //right arrow - rechterpijl
        this.paddle.move(0, 4);
        } else {
            this.paddle.move(0, 0);
        }
    }
};

Paddle.prototype.move = function(x, y){
    this.x += x;
    this.y += y;
    this.x_speed = x;
    this.y_speed = y;
    if(this.y < 0) { //helemaal naar boven - to the top
        this.y = 0;
        this.y_speed = 0;
    } else if(this.y + this.height > 400 ) { //helemaal naar beneden - to the bottom
        this.y = 400 - this.height;
        this.y_speed = 0;
    }
}

// Computer AI

var update = function() {
    player.update();
    computer.update(ball);
    ball.update(player.paddle, computer.paddle);
};

Computer.prototype.update = function(ball) {
    var y_pos = ball.y;
    var diff = -((this.paddle.y + (this.paddle.height / 2)) - y_pos);
    if(diff < 0 && diff < -4) { //snelheid boven - speed top
        diff = -5;
    } else if(diff > 0 && diff > 4) { //snelheid onder - speed bottom
        diff = 5;
    }
    this.paddle.move(0, diff);
    if(this.paddle.y < 0) {
        this.paddle.y = 0;
    } else if(this.paddle.y + this.paddle.height > 600) {
        this.paddle.y = 600 - this.paddle.height;
    }
};

//Sound context - if you use another AudioContext class use that one, as some browsers have a limit
var audioCtx = new (window.AudioContext || window.webkitAudioContext || window.audioContext);

//Synthesizer for sound (beeps):

//duration is set at 100 ms
//frequency of the tone in hertz. default is 440
//volume of the tone. Default is 1, off is 0.
//type of tone. Possible values are sine, square, sawtooth, triangle, and custom. Default is sine.
function beep(frequency, volume, type) {
    var oscillator = audioCtx.createOscillator();
    var gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (volume){gainNode.gain.value = volume;}
    if (frequency){oscillator.frequency.value = frequency;}
    if (type){oscillator.type = type;}   

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + ((100) / 1000));
};



    



