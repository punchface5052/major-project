// Major Project
// Liam Thorpe
// Nov. 22, 2024
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"


let state = 'title';
let groundLevel;
let you;
let bossMan;
let gravity = 0.98;
let playerBullets = [];
let lastBulletShot = 0;
let bulletDelay = 100;
let weapon = 'normal';
let weaponMap = new Map();
weaponMap.set('normal',1);
weaponMap.set('double',2);
weaponMap.set('lazer',10);
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
    this.flyJuice = MAX_FLY_JUICE;
    this.dashStrength = 40;
    this.isJumpable = false;
    this.isDamagable = true;
    this.canShoot = true;
  }

  displayChar() {
    fill('white');
    // image( "IMAGEPLACEHOLDER" ,0,0,this.size,this.size);
    circle(this.x, this.y, this.radius * 2);
    noFill();
  }

  update() {
    if (keyIsDown(65)) {
      if (this.x > 0 + this.radius) {
        this.x -= this.speed;
      }
      else {
        this.x = 0 + this.radius;
      }
    }
    if (keyIsDown(68)) {
      if (this.x < width - this.radius) {
        this.x += this.speed;
      }
      else {
        this.x = width - this.radius;
      }
    }
    this.applyGravity();
  }

  checkHealth() {
    if (this.health > 0) {
      fill('orange');
      rect(50, 50, width / 4 * (this.health / 100), 20);
      fill('black');
      text(this.health, width / 8, 65);
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
      this.canShoot = true;
    }
    if (this.y + this.radius < groundLevel) { // falling
      this.dy += gravity;
      if (keyIsDown(87) && dist(0,this.y,0,groundLevel) > this.jumpHeight*12.5) {
        this.dy = 1.5;
      }
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
      if (this.flyJuice < MAX_FLY_JUICE) {
        this.flyJuice++;
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
      this.speed = 10;
      this.isDamagable = false;
      this.canShoot = false;
      if (keyIsDown(83)) {
        this.y += this.speed;
      }
      if (keyIsDown(87)) {
        if (this.y - this.radius > 0) {
          this.y -= this.speed;
        }
        else {
          this.y = 0 + this.radius;
        }
      }
      if (millis() % 2 === 0) {
        this.flyJuice -= 2;
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

      if (keyIsDown(65) || keyIsDown(68)) {
        this.flyJuice -= this.dashStrength;
      }
    }
  }

  dispFlyJuice() {
    noFill();
    rect(50, 75, width / 4, 20);
    fill('yellow');
    rect(50, 75, width / 4 * (this.flyJuice / 100), 20);
    noFill();
    rect(50, 75, width / 10, 20);
  }
}

class PlayerProjectile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 20;
    this.dx = 0;
    this.dy = 0;
    this.size = 5;
    this.damage = weapon;
  }
  calcStatus() {
    let angle = atan2(mouseY - you.y, mouseX - you.x);
    this.dx = cos(angle) * this.speed;
    this.dy = sin(angle) * this.speed;

  }
  update() {
    this.x += this.dx;
    this.y += this.dy;

  }
  dispBullet() {
    if (this.damage === 'normal') {
      circle(this.x, this.y, this.size);
    }
    else if (this.damage === 'double'){
      circle(this.x+5,this.y,this.size);
      circle(this.x-5,this.y,this.size);
    }
  }
  deleteBullet() {
    if (this.x < 0 || this.x > width || this.y > groundLevel || this.y < 0) {
      return true;
    }
  }
}

class Boss {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 50;
    this.speed = 5;
    this.health = 1000;
    this.hit = false;
  }
  display() {
    square(this.x, this.y, this.size);
    this.checkHealth();
  }
  update() {

  }
  shoot() {

  }
  hitDetec() {
    for (let i = 0; i < playerBullets.length; i++) {
      this.hit = collideRectCircle(this.x, this.y, this.size, this.size, playerBullets[i].x, playerBullets[i].y, playerBullets[i].size);
      if (this.hit) {
        this.health -= weaponMap.get(playerBullets[i].damage);
        playerBullets.splice(i, 1);
      }
    }
  }
  checkHealth() {
    this.hitDetec();
    fill('black');
    text(this.health, width / 2, height / 2);
    noFill();
    // if('yes'){

    // }
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  you = new Player(50, 50);
  boss = new Boss(width / 2, height / 2);
  groundLevel = height - height / 16;
}

function draw() {
  if (state === 'title') {
    dispTitle();
  }
  else if (state === 'game') {
    background(220);
    you.update();
    you.displayChar();
    bullets();
    you.checkHealth();
    you.dispFlyJuice();
    boss.display();


    fill('black');
    // text(you.flyJuice, 100, 90);
    fill('white');
    rect(-10, groundLevel, width + 10, groundLevel);
    noFill();
  }
}

function bullets() {
  push();
  translate(you.x, you.y);

  if (mouseIsPressed && lastBulletShot < millis() - bulletDelay && you.canShoot) {
    let newPP = new PlayerProjectile(you.x, you.y);
    newPP.calcStatus();
    playerBullets.push(newPP);
    lastBulletShot = millis();
  }
  pop();

  if (playerBullets.length > 0) {
    for (let i = 0; i < playerBullets.length; i++) {
      playerBullets[i].update();
      playerBullets[i].dispBullet();
      if (playerBullets[i].deleteBullet()) {
        playerBullets.splice(i, 1);
      }
    }
  }
}

function keyPressed() {
  if (keyCode === 16) {
    you.dash();
  }
}


function mousePressed() {
  if (state === 'title') {
    state = 'game';
    textSize(11);
    lastBulletShot = millis();
  }
}

function dispTitle() {
  textAlign(CENTER);
  textSize(100);
  text('hi', width / 2, height / 2);
}