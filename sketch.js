// Major Project
// Liam Thorpe
// Nov. 22, 2024
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"


let counter = 0;

let bossHitSound, playerHitSound, bgm, dashSwoosh, boom, wingFlap; // initializing sound effects
let state = 'title';
let groundLevel;
let you;
let bossMan;
let gravity = 0.98;
let playerBullets = [];
let bossBullets = [];
let lastBulletShot = 0;
let playerBulletDelay = 100;
let weapon = 'normal';
let weaponMap = new Map();
weaponMap.set('normal', 1);
weaponMap.set('double', 2);
weaponMap.set('lazer', 10);

const DASH_I_FRAMES = 500;
const MAX_FLY_JUICE = 100; // Max Flying power, used for regenerating fly juice
const P_MAX_HEALTH = 5; // Player Max Health, used for regen and other calculations
const B_MAX_HEALTH = 1000; // Boss Max Health, used for calculations
const PHASE_1_BULLETS = 36;

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.dy = 0; // Used for calculating falling and jumping
    this.size = 30;
    this.speed = 10;
    this.jumpHeight = 10;
    this.health = 5;
    this.flyJuice = MAX_FLY_JUICE; // amount of ability to fly and dash
    this.dashStrength = 40;
    this.lastPlayerBullet = 0; // Time between bullets
    this.lastDash = 0;
    this.isHit = false; // check collision with bullets
    this.isJumpable = false; // determines whether or not on the ground
    this.isDamagable = true; // disabled when dashing and flying
    this.canShoot = true; // determines delay between shooting
    this.hasHealed = false;
  }

  displayChar() {
    imageMode(CENTER);
    image(mainchar, this.x, this.y, this.size * 2.5, this.size * 2.5);
  }

  update() {
    if (keyIsDown(65)) {
      if (this.x > 0 + this.size) { // move left
        this.x -= this.speed;
      }
      else {
        this.x = 0 + this.size; // confine within screen
      }
    }
    if (keyIsDown(68)) {
      if (this.x < width - this.size) { // move right
        this.x += this.speed;
      }
      else {
        this.x = width - this.size; // confine within screen
      }
    }
    this.applyGravity();
  }

  checkHealth() {
    if (state === 'game') {
      this.hitDetec();
      noFill();
      rect(50, 50, width / 4, 20);
      fill('orange');
      rect(50, 50, width / 4 * (this.health / P_MAX_HEALTH), 20);
    }
    if (this.health <= 0) {
      this.isDamagable = false;
      this.health = 0;
    }
    if (bossMan.health % (B_MAX_HEALTH / 20) === 0 && this.health < P_MAX_HEALTH && !this.hasHealed && bossMan.health !== B_MAX_HEALTH) {
      this.health += P_MAX_HEALTH / 5;
      this.hasHealed = true;
    }
  }

  applyGravity() {
    if (!this.isJumpable && keyIsDown(16) && this.flyJuice > 0) {
      this.flight();
    }
    else {
      gravity = 1;
      this.size = 25;
      this.speed = 10;
      this.canShoot = true;
      if (this.health > 0 && you.lastDash < millis() - DASH_I_FRAMES) {
        this.isDamagable = true;
      }
    }
    if (this.y + this.size < groundLevel) { // falling
      this.dy += gravity;
      if (keyIsDown(87) && dist(0, this.y, 0, groundLevel) > this.jumpHeight * 12.5) {
        this.dy = 1.5;
      }
      this.y += this.dy;
      this.isJumpable = false;
    }
    else if (this.y + this.size > groundLevel) { // snap to ground level
      this.dy = 0;
      this.isJumpable = true;
      this.y = groundLevel - this.size;
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
      this.size = 10;
      this.dy = 0;
      this.speed = 10;
      this.isDamagable = false;
      this.canShoot = false;
      if (keyIsDown(83)) {
        this.y += this.speed;
      }
      if (keyIsDown(87)) {
        if (this.y - this.size > 0) {
          this.y -= this.speed;
        }
        else {
          this.y = 0 + this.size;
        }
      }
      if (millis() % 2 === 0) {
        this.flyJuice -= 2;
      }
    }
  }

  hitDetec() {
    if (this.isDamagable) {
      for (let i = 0; i < bossBullets.length; i++) {
        this.isHit = collideCircleCircle(this.x, this.y, this.size * 2, bossBullets[i].x, bossBullets[i].y, bossBullets[i].size);
        if (this.isHit) {
          this.health -= 1 / 5 * P_MAX_HEALTH;
          bossBullets.splice(i, 1);
        }
      }
    }
  }

  dash() {
    if (this.flyJuice > this.dashStrength && this.y + this.size === groundLevel && millis()) {
      if (keyIsDown(65)) {
        this.isDamagable = false;
        this.x -= this.dashStrength * 5;
        this.lastDash = millis();
      }
      else if (keyIsDown(68)) {
        this.isDamagable = false;
        this.x += this.dashStrength * 5;
        this.lastDash = millis();
      }

      if (keyIsDown(65) || keyIsDown(68)) {
        dashSwoosh.play();
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

class Boss {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.tempColour = 'red';
    this.width = bossImage.width * 0.25;
    this.height = bossImage.height * 0.25;
    this.speed = 5;
    this.health = 1000;
    this.isHit = false;
    this.lastBossBullet = 0;
    this.attackNumb = 0;
    this.phase = 0;
    this.phaseHasRun = false;
    this.phaseRunTime;
    this.phaseStart;
  }
  display() {
    imageMode(CENTER);
    image(bossImage, this.x, this.y, this.width, this.height);
    this.checkHealth();
  }
  update() {
    this.bossPhases();
  }
  hitDetec() {
    rectMode(CENTER);
    for (let i = 0; i < playerBullets.length; i++) {
      this.isHit = collideRectCircle(this.x-this.width/2, this.y-this.height/2, this.width, this.height, playerBullets[i].x, playerBullets[i].y, playerBullets[i].size);
      if (this.isHit) {
        this.health -= weaponMap.get(playerBullets[i].damage);
        playerBullets.splice(i, 1);
        you.hasHealed = false;
      }
    }
    rectMode(CORNER);
  }
  checkHealth() {
    fill('red');
    rectMode(CENTER);
    rect(this.x, this.y - 150, this.health , 20);
    rectMode(CORNER);
    this.hitDetec();
    noFill();
  }
  bossPhases() {
    if (this.phase === 1) {
      if (this.phaseStart > millis() - this.phaseRunTime) {
        this.shoot();
      }
      else if (this.phaseHasRun === false) {
        this.phaseRunTime = 1000000;
        this.phaseStart = millis();
        this.phaseHasRun = true;
      }
      else {
        this.phase = 0;
        this.phaseHasRun = false;
      }
    }
  }

  shoot() {
    if (this.phase === 1 && this.attackNumb <= 3) {
      this.spiral();
    }
  }
  spiral() {
    if (this.phase === 1) {
      if (this.attackNumb === 1 && this.lastBossBullet < millis() - 50) {
        counter++;
        for (let i = 0; i < PHASE_1_BULLETS; i++) {
          push();
          translate(this.x, this.y);
          let newBP = new BossProjectile(this.x, this.y);
          newBP.calcStatus(i, 'CW');
          bossBullets.push(newBP);
          this.lastBossBullet = millis();
          pop();
        }
      }

      if (counter === 3) {
        this.attackNumb = 3;
        if (this.lastBossBullet < millis() - 2000) {
          this.attackNumb = 2;
        }
      }

      if (this.attackNumb === 2 && this.lastBossBullet < millis() - 50) {
        counter++;
        console.log('test');
        for (let i = 0; i < PHASE_1_BULLETS; i++) {
          push();
          translate(this.x, this.y);
          let newBP = new BossProjectile(this.x, this.y);
          newBP.calcStatus(i, 'CCW');
          bossBullets.push(newBP);
          this.lastBossBullet = millis();
          pop();
        }
        if (counter === 6) {
          counter = 0;
          this.attackNumb = 1;
          this.phase = 1;
        }
      }
    }
  }
}


class PlayerProjectile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 20;
    this.dx = 0;
    this.dy = 0;
    this.angle = 0;
    this.size = 5;
    this.damage = weapon;
  }
  calcStatus() {
    this.angle = atan2(mouseY - you.y, mouseX - you.x);
    this.dx = cos(this.angle) * this.speed;
    this.dy = sin(this.angle) * this.speed;
  }
  update() {
    this.x += this.dx;
    this.y += this.dy;

  }
  dispBullet() {
    if (this.damage === 'normal') {
      fill('yellow');
      circle(this.x, this.y, this.size);
    }
    else if (this.damage === 'double') {
      fill('yellow');
      circle(this.x - cos(this.angle - 90) * this.size, this.y - sin(this.angle - 90) * this.size, this.size);
      circle(this.x + cos(this.angle - 90) * this.size, this.y + sin(this.angle - 90) * this.size, this.size);
    }
  }
  deleteBullet() {
    if (this.x < 0 || this.x > width || this.y > groundLevel || this.y < 0) {
      return true;
    }
  }
}

class BossProjectile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 0.5;
    this.dx = 0;
    this.dy = 0;
    this.angle = 0;
    this.size = 10;
    this.rotationDir;
  }
  calcStatus(runNumber, posNeg) {
    if (bossMan.phase === 1) {
      this.angle = 10 * runNumber;
    }
    this.rotationDir = posNeg;
  }
  update() {
    this.updateAngle();
    this.x += this.dx;
    this.y += this.dy;
  }
  updateAngle() {
    if (this.rotationDir === 'CW') {
      this.angle += 1;
    }
    if (this.rotationDir === 'CCW') {
      this.angle -= 1;
    }
    this.speed += 0.05;
    this.dx = cos(this.angle + this.speed) * this.speed;
    this.dy = sin(this.angle + this.speed) * this.speed;
  }
  dispBullet() {
    fill('red');
    circle(this.x, this.y, this.size);
  }
  deleteBullet() {
    if (this.x < 0 || this.x > width || this.y > groundLevel || this.y < 0) {
      return true;
    }
  }
}

class Particulate {
  constructor(x, y, dx, dy) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.size = 5;
    this.r = 255;
    this.g = 0;
    this.b = 0;
    this.alpha = 255;
  }
  display() {
    fill(this.r, this.g, this.b, this.alpha);
    circle(this.x, this.y, this.size);
  }
  update() {
    this.x += this.dx;
    this.y += this.dy;
    this.alpha -= 1;
  }
  isDead() {
    return this.alpha <= 0;
  }
}

function preload() {
  sewerBack = loadImage('assets/sewer-background.jpg');
  sewerGround = loadImage('assets/sewer-ground.jpg');
  mainchar = loadImage('assets/main-char.png');
  bossImage = loadImage('assets/boss.png');
  dashSwoosh = loadSound('assets/swoosh.wav');
  dashSwoosh.amp(0.5);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  you = new Player(50, 50);
  bossMan = new Boss(width / 2, height / 2);
  groundLevel = height - height / 16;
}

function draw() {
  if (state === 'title') {
    dispTitle();
  }
  else if (state === 'game') {
    gameState();
  }
}

function bullets() {
  noStroke();
  push();
  translate(you.x, you.y);
  if (mouseIsPressed && you.lastPlayerBullet < millis() - playerBulletDelay && you.canShoot) {
    if (weapon === 'normal' || weapon === 'double') {
      if (weapon === 'double') {
        let newPP = new PlayerProjectile(you.x, you.y);
        newPP.calcStatus();
        playerBullets.push(newPP);
      }
      else {
        let newPP = new PlayerProjectile(you.x, you.y);
        newPP.calcStatus();
        playerBullets.push(newPP);
      }
      you.lastPlayerBullet = millis();
    }
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

  if (bossBullets.length > 0) {
    for (let i = 0; i < bossBullets.length; i++) {
      bossBullets[i].update();
      bossBullets[i].dispBullet();
      if (bossBullets[i].deleteBullet()) {
        bossBullets.splice(i, 1);
      }
    }
  }
}

function keyPressed() {
  if (keyCode === 16) {
    you.dash();
  }
  else {
    if (you.lastDash < millis() - DASH_I_FRAMES) {
      you.isDamagable = false;
    }
  }
  if (key === 'n') {
    weapon = 'normal';
  }
  if (key === 'b') {
    weapon = 'double';
  }
  if (key === 'p') {
    bossMan.phase = 1;
    bossMan.attackNumb = 1;
    counter = 0;
  }
}


function mousePressed() {
  if (state === 'title') {
    state = 'game';
    bossMan.phase = 1;
    bossMan.attackNumb = 1;
    textSize(11);
    you.lastPlayerBullet = millis();
  }
}

function gameState(){
  imageMode(CORNER);
  background(sewerBack);
  image(sewerGround, -10, groundLevel-height/100, width + 10, height);
  you.update();
  bossMan.update();
  bossMan.display();
  you.displayChar();
  bullets();
  you.checkHealth();
  you.dispFlyJuice();
}

function dispTitle() {
  textAlign(CENTER);
  textSize(50);
  text(`Lore:
    You are a sentient cheese, which escaped from a labrotory. 
    Your goal is to fight the rats in the sewers to escape... Good Luck!
    Click to Begin.`, width / 2.1, height / 2.5);
}

