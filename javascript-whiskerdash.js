// Board
let board;
let boardWidth = 750;
let boardHeight = 250;
let context;

// Katze
let katzeWidth = 88;
let katzeHeight = 94;
let katzeX = 50;
let katzeY = boardHeight - katzeHeight;
let katzeImg;
let katzeDeadImg;
let katzeDuckDeadImg; 
let isDead = false;
let isJumping = false;

let katze = {
    x: katzeX,
    y: katzeY,
    width: katzeWidth,
    height: katzeHeight
};

// Barrier
let barrierArray = [];

let barrier1Width = 37; // Knäul
let barrier2Width = 58; // Hund
let barrier3Width = 31; // Pflanze
let barrier4Width = 60; // Schuh
let barrier5Width = 37; // Sprühflasche

let barrierHeight = 44;
let barrierX = 700;
let barrierY = boardHeight - barrierHeight;

let barrier1Img; // Knäul
let barrier2Img; // Hund
let barrier3Img; // Pflanze
let barrier4Img; // Schuh
let barrier5Img; // Sprühflasche

// Physics
let velocityX = -8; // Barrier bewegt sich nach links
let velocityY = 0;
let gravity = 0.4;

let gameOver = false;
let score = 0;

// Hintergründe
let backgroundImages = [];
let currentBackgroundIndex = 0;
let nextBackgroundIndex = 1;
let backgroundChangeScore = 500; 
let transitioning = false;
let transitionOpacity = 0; 
let transitionSpeed = 0.002; // Langsame Transition vom HG

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;

    context = board.getContext("2d"); 

    // Katze Images
    katzeImg = new Image();
    katzeImg.src = "./bilder/katze.png";
    katzeImg.onload = function () {
        context.drawImage(katzeImg, katze.x, katze.y, katze.width, katze.height);
    }

    katzeDeadImg = new Image();
    katzeDeadImg.src = "./bilder/katze-tot.png";

    katzeDuckDeadImg = new Image();
    katzeDuckDeadImg.src = "./bilder/katze-duck-tot.png"; // Bild wenn Katze beim jumpen stirbt

    // Barrier Images
    barrier1Img = new Image();
    barrier1Img.src = "./bilder/knaeul.png";

    barrier2Img = new Image();
    barrier2Img.src = "./bilder/hund.png";

    barrier3Img = new Image();
    barrier3Img.src = "./bilder/pflanze.png";

    barrier4Img = new Image();
    barrier4Img.src = "./bilder/schuh.png";

    barrier5Img = new Image();
    barrier5Img.src = "./bilder/Flasche.png";

    // Hintergründe Images
    let background1 = new Image();
    background1.src = "./bilder/background1.png"; // Western
    backgroundImages.push(background1);

    let background2 = new Image();
    background2.src = "./bilder/background2.png"; // Wohnzimmer
    backgroundImages.push(background2);

    let background3 = new Image();
    background3.src = "./bilder/background3.png"; // Strand
    backgroundImages.push(background3);

    requestAnimationFrame(update);
    setInterval(placeBarrier, 1000);
    document.addEventListener("keydown", moveKatze);
    document.addEventListener("keyup", stopJumping);
}

function update() {
    if (gameOver) {
        document.getElementById("restartButton").style.display = "block";
        return;
    }
    requestAnimationFrame(update);
    context.clearRect(0, 0, board.width, board.height);

    // HG Transition
    if (transitioning) {
        context.globalAlpha = 1 - transitionOpacity; // Fade out
        context.drawImage(backgroundImages[currentBackgroundIndex], 0, 0, board.width, board.height);

        context.globalAlpha = transitionOpacity; // Fade in
        context.drawImage(backgroundImages[nextBackgroundIndex], 0, 0, board.width, board.height);

        transitionOpacity += transitionSpeed; // Geschwindigkeit
        if (transitionOpacity >= 1) {
            transitioning = false;
            transitionOpacity = 0;
            currentBackgroundIndex = nextBackgroundIndex;
        }
    } else {
        context.globalAlpha = 1;
        context.drawImage(backgroundImages[currentBackgroundIndex], 0, 0, board.width, board.height);
    }

    // HG Wechselt anhand von Score
    if (score >= backgroundChangeScore && !transitioning) {
        transitioning = true;
        nextBackgroundIndex = (currentBackgroundIndex + 1) % backgroundImages.length;
    }

    context.globalAlpha = 1;

    // Katze
    velocityY += gravity;
    katze.y = Math.min(katze.y + velocityY, katzeY);

    if (!isDead) {
        context.drawImage(katzeImg, katze.x, katze.y, katze.width, katze.height);
    } else {
        if (isJumping) {
            context.drawImage(katzeDuckDeadImg, katze.x, katze.y, katze.width, katze.height);
        } else {
            context.drawImage(katzeDeadImg, katze.x, katze.y, katze.width, katze.height);
        }
    }

    // Barrier
    for (let i = 0; i < barrierArray.length; i++) {
        let barrier = barrierArray[i];
        barrier.x += velocityX;
        context.drawImage(barrier.img, barrier.x, barrier.y, barrier.width, barrier.height);

        if (detectCollision(katze, barrier)) {
            gameOver = true;
        }
    }

    // Score
    context.fillStyle = "white";
    context.font = "20px helvetica";
    score++; 
    context.fillText(score, 5, 20);
}

function moveKatze(e) {
    if (gameOver) {
        return;
    }

    if ((e.code == "Space" || e.code == "ArrowUp") && katze.y == katzeY) {
        // Jump
        velocityY = -10;
        isJumping = true; 
        if (!isDead) {
            katzeImg.src = "./bilder/katze-duck.png"; // wechsel zu katze jump
        }
    }
}

function stopJumping(e) {
    if (gameOver) {
        return;
    }

    if ((e.code == "Space" || e.code == "ArrowUp") && velocityY < 0) {
        // wechsel zu standard katze
        if (!isDead) {
            katzeImg.src = "./bilder/katze.png";
        }
    }
    isJumping = false; 
}

// Barrier platzierung
function placeBarrier() {
    if (gameOver) {
        return;
    }

    let barrier = {
        img: null,
        x: barrierX,
        y: barrierY,
        width: null,
        height: barrierHeight
    }

    let placeBarrierChance = Math.random(); // Wahrscheinlichkeit von Gegenstandspawn

    if (placeBarrierChance > .80) {
        barrier.img = barrier5Img; // Sprühflasche
        barrier.width = barrier5Width;
    } else if (placeBarrierChance > .60) {
        barrier.img = barrier4Img; // Schuh
        barrier.width = barrier4Width;
    } else if (placeBarrierChance > .40) {
        barrier.img = barrier3Img; // Pflanze
        barrier.width = barrier3Width;
    } else if (placeBarrierChance > .20) {
        barrier.img = barrier2Img; // Hund
        barrier.width = barrier2Width;
    } else {
        barrier.img = barrier1Img; // Knäul
        barrier.width = barrier1Width;
    }

    barrierArray.push(barrier);

    if (barrierArray.length > 5) {
        barrierArray.shift();
    }
}

// Collision
function detectCollision(a, b) {
    if (a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y) {
        
        if (!isDead) {
            isDead = true;
            gameOver = true;

            if (isJumping) {
                katzeImg.src = "./bilder/katze-duck-tot.png";
            } else {
                katzeImg.src = "./bilder/katze-tot.png";
            }
        }
        return true;
    }
    return false;
}

// Restart 
function restartGame() {
    katze.y = katzeY;
    velocityY = 0;
    gameOver = false;
    isDead = false;
    isJumping = false;
    score = 0;
    barrierArray = [];
    katzeImg.src = "./bilder/katze.png";

    // HG Reset
    currentBackgroundIndex = 0;
    nextBackgroundIndex = 1;

    document.getElementById("restartButton").style.display = "none";

    requestAnimationFrame(update);
}
