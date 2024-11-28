// Major Project
// Liam Thorpe
// Nov. 22, 2024
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let groundLevel;
let you;
let gravity = 1;

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 25;
    this.speed = 5;
    this.jumpHeight = 10;
    this.health = 5;
    this.dy = 0;
    this.flyJuice = 100;
    this.isJumpable = false;
  }
  display() {
    // image( "IMAGEPLACEHOLDER" ,this.x,this.y,this.size,this.size);
    circle(this.x, this.y, this.radius * 2);
  }
  update() {
    if (keyIsDown(65)) {
      this.x -= this.speed;
    }
    if (keyIsDown(68)) {
      this.x += this.speed;
    }
    this.applyGravity();
  }
  shoot() {
    console.log("shoot");
  }
  checkHealth() {
    console.log("checkHealth");
  }
  applyGravity() {
    if (!this.isJumpable && keyIsDown(16) && this.flyJuice >= 0) {
      this.flight();
    }
    else {
      gravity = 1;
    }
    if (this.y + this.radius < groundLevel) { // falling
      this.dy += gravity;
      this.y += this.dy;
      this.isJumpable = false;
    }
    else if (this.y + this.radius > groundLevel) { // snap to ground level
      this.dy = 0;
      this.isJumpable = true;
      this.y = groundLevel - this.radius;
      this.flyJuice = 100;
    }
    else { // apply gravity in general
      this.y += this.dy;
    }
    this.jump();
  }
  jump() {
    if (keyIsDown(32) && this.isJumpable) {
      this.dy -= this.jumpHeight;
    }
  }
  flight() {
    if (this.flyJuice > 0) {
      gravity = 0;
      this.dy = 0;
      this.speed = 10;
      if (keyIsDown(83)) {
        this.y += this.speed;
      }
      if (keyIsDown(87)) {
        this.y -= this.speed;
      }
    }
    this.flyJuice--;
  }
}

class Boss {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 50;
    this.speed = 5;
    this.health = 5;
  }
  display() {
    image("IMAGEPLACEHOLDER", this.x, this.y, this.size, this.size);
  }
  update() {

  }
  move() {

  }
  shoot() {

  }
  checkHealth() {

  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  you = new Player(50, 50);
  groundLevel = height - height / 16;
}

function draw() {
  background(220);
  you.update();
  you.display();
  line(0, groundLevel, width, groundLevel);
}

function keyPressed() {
}