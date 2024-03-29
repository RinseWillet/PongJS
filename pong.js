//animatie scherm en frames per second (60) klaarzetten
var animate = window.requestAnimationFrame ||  
    function (callback) {
         window.setTimeout(callback, 1000 / 60) 
    };

// query selector returns the first HTML Element in the document that matches the selector (here: canvas) -> if no elements could be found, no 
var canvas = document.querySelector("canvas");
var width = 1200;
var height = 800;
canvas.width = width;
canvas.height = height;

// the getContext method returns a drawing context on the canvas - the identifier '2d' leads to the creation of a CanvasRenderingContext2d object (a 2d rendering context)
var context = canvas.getContext('2d');

//game starten - startscherm -> spelen na spatiebalk
const startGame = () => {
    //appendChild method adds a node to the end of the list of children to a specific node, in this case the variable canvas (an HTML element) is appended to the body upon starting the game after window is loaded
    document.body.appendChild(canvas);
    startscreen();
    onkeyup = (e) => {
        if (e.code == "Space") {
            computer.score = 0;
            player.score = 0;
            animate(step);
        }
    }
}

//cyclus van animeren en updaten
var step = () => {
    update();
    render();
};

//creating the paddles
class Paddle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.x_speed = 0;
        this.y_speed = 0;
        this.score = 0;
    }
    render = () => {
        context.fillStyle = "#FFFFFF";
        context.fillRect(this.x, this.y, this.width, this.height);
    }

    move = (x, y) => {
        this.x += x;
        this.y += y;
        this.x_speed = x;
        this.y_speed = y;
        if (this.y < 0) { //helemaal naar boven - to the top
            this.y = 0;
            this.y_speed = 0;
        } else if (this.y + this.height > 800) { //helemaal naar beneden - to the bottom
            this.y = 800 - this.height;
            this.y_speed = 0;
        }
    }
}

//class for the player
class Player {
    constructor() {
        this.paddle = new Paddle(1180, 375, 10, 50);
        this.score = this.paddle.score;
    }
    render = () => {
        this.paddle.render();
    }
    update = () => {
        for (var key in keysDown) {
            var value = String(key);
            console.log(value);
            if (value == "ArrowUp") { //up arrow - moves paddle up
                this.paddle.move(0, -6);
            } else if (value == "ArrowDown") { //down arrow - moves paddle down
                this.paddle.move(0, 6);
            } else {
                this.paddle.move(0, 0);
            }
        }
    }
}

// class for the Computer player
class Computer {
    constructor() {
        this.paddle = new Paddle(10, 375, 10, 50);
        this.score = this.paddle.score;
    }
    render = () => {
        this.paddle.render();
    }

    // Computer player behaviour
    update = (ball) => {
        var y_pos = ball.y;
        var diff = -((this.paddle.y + (this.paddle.height / 2)) - y_pos);
        if (diff < 0 && diff < -6) { //snelheid boven - speed top
            diff = -5;
        } else if (diff > 0 && diff > 6) { //snelheid onder - speed bottom
            diff = 5;
        }
        this.paddle.move(0, diff);
        if (this.paddle.y < 0) {
            this.paddle.y = 0;
        } else if (this.paddle.y + this.paddle.height > 1200) {
            this.paddle.y = 1200 - this.paddle.height;
        }
    }
}

//creating the ball
class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.x_speed = 7;
        this.y_speed = 0;
        this.radius = 5;
    }
    render = () => {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 2 * Math.PI, false);
        context.fillStyle = "#FFFFFF";
        context.fill();
    }
    update = (paddle1, paddle2) => {
        this.x += this.x_speed;
        this.y += this.y_speed;
        var top_x = this.x - 7;
        var top_y = this.y - 7;
        var bottom_x = this.x + 7;
        var bottom_y = this.y + 7;

        if (this.y - 5 < 0) { // bouncing of the top wall - bovenmuur raken
            this.y = 5;
            this.y_speed = -this.y_speed;
            beep(300);
        } else if (this.y + 5 > 800) { // bouncing of the bottom wall - rechtermuur raken
            this.y = 795;
            this.y_speed = -this.y_speed;
            beep(300);
        }

        //scoring a point - punt scoren - ball reset
        if (this.x < 0 || this.x > 1200) {
            if (this.x < 0) {
                computer.score += 1;
                this.x_speed = -7;
            }
            if (this.x > 1200) {
                player.score += 1;
                this.x_speed = 7;
            }
            this.y_speed = 0;
            this.y = 400;
            this.x = 600;
            beep(600, 1, 'triangle');
        }

        // hitting the ball with the rackets - Hit detection - ball to paddle
        if (top_x > 600) {
            if (top_x < (paddle1.x + paddle1.width) && bottom_x > paddle1.x && top_y < (paddle1.y + paddle1.height) && bottom_y > paddle1.y) {
                // hit detection player paddle / speler paddle raken
                this.x_speed = -7;
                this.y_speed += (paddle1.y_speed / 2);
                this.x += this.y_speed;
                beep(200);
            }
        } else {
            if (top_x < (paddle2.x + paddle2.width) && bottom_x > paddle2.x && top_y < (paddle2.y + paddle2.height) && bottom_y > paddle2.y) {
                // hit detection computer paddle / computer paddle raken
                this.x_speed = 7;
                this.y_speed += (paddle2.y_speed / 2);
                this.x += this.x_speed;
                beep(200);
            }
        }
    }
}

var player = new Player();
var computer = new Computer();
var ball = new Ball(600, 400);

var startscreen = () => {
    context.fillStyle = "#000000";
    context.fillRect(0, 0, width, height);

    // Draw the net (Line in the middle)
    context.beginPath();
    context.setLineDash([7, 15]);
    context.moveTo(600, 0);
    context.lineTo(600, 800);
    context.lineWidth = 5;
    context.strokeStyle = "#ffffff";
    context.stroke();

    //press start to play    
    context.font = '100px Bit5x3';
    context.fillStyle = "white";
    context.textAlign = "center";
    context.fillText("press space to start", 600, 400);
}

var render = () => {
    context.fillStyle = "#000000";
    context.fillRect(0, 0, width, height);

    // Net tekenen - Draw the net (Line in the middle)
    context.beginPath();
    context.setLineDash([7, 15]);
    context.moveTo(600, 0);
    context.lineTo(600, 800);
    context.lineWidth = 5;
    context.strokeStyle = "#ffffff";
    context.stroke();

    // //printing scores
    context.font = "100px Bit5x3";    
    context.fillStyle = "white";
    context.textAlign = "center";
    context.fillText(player.score.toString(), 300, 100);
    context.fillText(computer.score.toString(), 900, 100);

    player.render();
    computer.render();
    ball.render();

    //keep playing game until one player reaches a score of 10
    if (player.score < 10 && computer.score < 10) {
        animate(step);
    }

    if (player.score == 10) {
        context.fillText("Computer wins", 600, 400);
        setTimeout(startGame, 3000);
    }

    if (computer.score == 10) {
        context.fillText("Player wins", 600, 400);
        setTimeout(startGame, 3000);
    }
};

var update = () => {
    ball.update(player.paddle, computer.paddle);
};

//Controls - input and conversion to movement Player - JSON to temporarily store the key-press event in.
var keysDown = {};

window.addEventListener("keydown", (event) => {
    keysDown[event.code] = true,
    console.log(keysDown)
});

window.addEventListener("keyup", (event) => {
    delete keysDown[event.code],
    console.log(keysDown)
});

// Paddles en bal updaten
var update = () => {
    player.update();
    computer.update(ball);
    ball.update(player.paddle, computer.paddle);
};

//Geluidscontext - standaard AudioContext
var audioCtx = new (window.AudioContext || window.webkitAudioContext || window.audioContext);

//Synthesizer voor geluid (beeps):

//standaard staat de tijdsduur (duration) op 100 ms
//de frequentie (frequency) van de toon staat standaard op 440 hz
//Het geluidsvolume (volume) staat standaard op 1, 0 is uit. 
//De golfvorm (type) staat standaard op sinus (sine), andere opties zijn square, sawtooth, triangle, en custom.
const beep = (frequency, volume, type) => {
    var oscillator = audioCtx.createOscillator();
    var gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (volume) { gainNode.gain.value = volume; }
    if (frequency) { oscillator.frequency.value = frequency; }
    if (type) { oscillator.type = type; }

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + ((100) / 1000));
};

window.onload = () => {
    startGame();
}