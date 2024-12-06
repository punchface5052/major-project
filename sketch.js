// Major Project
// Liam Thorpe
// Nov. 22, 2024
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let state = 'title';
let groundLevel;
let you;
let gravity = 0.5;
const MAX_FLY_JUICE = 100;

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 25;
    this.speed = 10;
    this.jumpHeight = 10;
    this.health = 100;
    this.dy = 0;
    this.flyJuice = 100;
    this.dashStrength = 30;
    this.isJumpable = false;
    this.isCollidable = true;
  }

  display() {
    // image( "IMAGEPLACEHOLDER" ,this.x,this.y,this.size,this.size);
    fill('white');
    circle(this.x, this.y, this.radius * 2);
    noFill();
    this.checkHealth();
    this.dispFlyJuice();
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
    if (this.health > 0) {
      fill('orange');
      rect(50, 50, width / 4 * (this.health / 100), 20);
      fill('black');
      text(this.health,width/8,65);
    }
    else {
      return 'dead';
    }
  }


  applyGravity() {
    if (!this.isJumpable && keyIsDown(16) && this.flyJuice > 0) {
      this.flight();
    }
    else {
      gravity = 1;
      this.radius = 25;
      this.speed = 10;
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
    }
    else { // apply gravity for jumps & on ground in general
      this.y += this.dy;
      if (this.flyJuice < MAX_FLY_JUICE && millis() % 2 === 0) {
        this.flyJuice+=2;
      }
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
      this.radius = 10;
      this.dy = 0;
      this.isCollidable = false;
      this.speed = 10;
      if (keyIsDown(83)) {
        this.y += this.speed;
      }
      if (keyIsDown(87)) {
        if (this.y - this.radius > 0) {
          this.y -= this.speed;
        }
      }
      if (millis() % 2 === 0) {
        this.flyJuice-=2;
      }
    }
  }

  dash() {
    if (this.flyJuice > this.dashStrength && this.y + this.radius === groundLevel && millis()) {
      if (keyIsDown(65)) {
        this.x -= this.dashStrength * 5;
      }
      else if (keyIsDown(68)) {
        this.x += this.dashStrength * 5;
      }

      if(keyIsDown(65) || keyIsDown(68)){
        this.flyJuice -= this.dashStrength;
      }
    }
  }

  dispFlyJuice(){
    noFill();
    rect(50,75,width/4,20);
    fill('yellow');
    rect(50, 75, width / 4 * (this.flyJuice / 100), 20);
    noFill();
    rect(50,75,width/12,20);
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
  if(state === 'title'){
    dispTitle();
  }
  else if(state === 'game'){
    background(220);
    you.update();
    you.display();
    fill('black');
    text(frameRate(),400,400);
    // text(you.flyJuice, 100, 90);
    noFill();
    line(0, groundLevel, width, groundLevel);
  }
}

function keyPressed() {
  if (keyCode === 16) {
    you.dash();
  }
}


function mousePressed(){
  if(state === 'title'){
    state = 'game';
    textSize(11);
  }
}

function dispTitle(){
  textAlign(CENTER);
  textSize(100);
  text('hi',width/2,height/2);
}