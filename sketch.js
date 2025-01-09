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
let bossBullets = [];
let lastBulletShot = 0;
let playerBulletDelay = 100;
let weapon = 'normal';
let weaponMap = new Map();
weaponMap.set('normal', 1);
weaponMap.set('double', 2);
weaponMap.set('lazer', 10);
const MAX_FLY_JUICE = 100; // Max Flying power, used for regenerating fly juice
const P_MAX_HEALTH = 5; // Player Max Health, used for regen and other calculations
const B_MAX_HEALTH = 1000; // Boss Max Health, used for calculations

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.dy = 0; // Used for calculating falling and jumping
    this.radius = 25;
    this.speed = 10;
    this.jumpHeight = 10;
    this.health = 5;
    this.flyJuice = MAX_FLY_JUICE; // amount of ability to fly and dash
    this.dashStrength = 40;
    this.lastPlayerBullet = 0; // Time between bullets
    this.isHit = false; // check collision with bullets
    this.isJumpable = false; // determines whether or not on the ground
    this.isDamagable = true; // disabled when dashing and flying
    this.canShoot = true; // determines delay between shooting
    this.hasHealed = false;
  }

  displayChar() {
    fill('white');
    // image( "IMAGEPLACEHOLDER" ,0,0,this.size,this.size);
    circle(this.x, this.y, this.radius * 2);
    noFill();
  }

  update() {
    if (keyIsDown(65)) {
      if (this.x > 0 + this.radius) { // move left
        this.x -= this.speed;
      }
      else {
        this.x = 0 + this.radius; // confine within screen
      }
    }
    if (keyIsDown(68)) {
      if (this.x < width - this.radius) { // move right
        this.x += this.speed;
      }
      else {
        this.x = width - this.radius; // confine within screen
      }
    }
    this.applyGravity();
  }

  checkHealth() {
    if (state === 'game') {
      this.hitDetec();
      rect(50, 50, width / 4, 20);
      fill('orange');
      rect(50, 50, width / 4 * (this.health / P_MAX_HEALTH), 20);
      fill('black');
      text(this.health, width / 8, 65);
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
      this.radius = 25;
      this.speed = 10;
      this.canShoot = true;
      if(this.health > 0){
        this.isDamagable = true;
      }
    }
    if (this.y + this.radius < groundLevel) { // falling
      this.dy += gravity;
      if (keyIsDown(87) && dist(0, this.y, 0, groundLevel) > this.jumpHeight * 12.5) {
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

  hitDetec() {
    if (this.isDamagable) {
      for (let i = 0; i < bossBullets.length; i++) {
        this.isHit = collideCircleCircle(this.x, this.y, this.radius * 2, bossBullets[i].x, bossBullets[i].y, bossBullets[i].size);
        if (this.isHit) {
          this.health -= 1 / 5 * P_MAX_HEALTH;
          bossBullets.splice(i, 1);
        }
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
    this.angle = 0;
    this.size = 5;
    this.damage = weapon;
  }
  calcStatus() {
    // if(weapon === 'normal'){
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
      circle(this.x, this.y, this.size);
    }
    else if (this.damage === 'double') {
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
    this.speed = 1;
    this.dx = 0;
    this.dy = 0;
    this.angle = 0;
    this.size = 5;
  }
  calcStatus(runNumber) {
    if(bossMan.phase === 1){
      this.angle = 360/runNumber;
      this.dx = cos(this.angle) * this.speed;
      this.dy = sin(this.angle) * this.speed;
    }
  }
  update() {
    this.x += this.dx;
    this.y += this.dy;
  }
  dispBullet() {
    circle(this.x, this.y, this.size);
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
    this.tempColour = 'red';
    this.size = 50;
    this.speed = 5;
    this.health = 1000;
    this.isHit = false;
    this.lastBossBullet = 0;
    this.phase = 0;
    this.phaseHasRun = false;
    this.phaseRunTime;
    this.phaseStart;
  }
  display() {
    square(this.x, this.y, this.size);
    this.checkHealth();
  }
  update() {
    this.bossPhases();
  }
  shoot() {
    //TEST:
    if (phase === 1) {

    }
  }
  hitDetec() {
    for (let i = 0; i < playerBullets.length; i++) {
      this.isHit = collideRectCircle(this.x, this.y, this.size, this.size, playerBullets[i].x, playerBullets[i].y, playerBullets[i].size);
      if (this.isHit) {
        this.health -= weaponMap.get(playerBullets[i].damage);
        playerBullets.splice(i, 1);
        you.hasHealed = false;
      }
    }
  }
  checkHealth() {
    this.hitDetec();
    fill('black');
    text(this.health, width / 2, height / 2);
    noFill();
  }
  bossPhases() {
    if (this.phase === 1) {
      if (this.phaseStart > millis() - this.phaseRunTime) {
        fill(this.tempColour);
      }
      else if (this.phaseHasRun === false) {
        this.phaseRunTime = 5000;
        this.phaseStart = millis();
        this.phaseHasRun = true;
      }
      else {
        this.phase = 0;
        this.phaseHasRun = false;
      }
    }
  }
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
    background(220);
    you.update();
    bossMan.update();
    bossMan.display();
    you.displayChar();
    bullets();
    you.checkHealth();
    you.dispFlyJuice();


    fill('black');
    // text(you.flyJuice, 100, 90);
    fill('white');
    rect(-10, groundLevel, width + 10, groundLevel);
    noFill();
  }
}

function test(){
  for (let i = 0; i < 36; i++){
    push();
    translate(bossMan.x, bossMan.y);
    // if (bossMan.lastBossBullet < millis() - 1000) {
      let newBP = new BossProjectile(bossMan.x, bossMan.y);
      newBP.calcStatus(i);
      bossBullets.push(newBP);
      bossMan.lastBossBullet = millis();
    // }
    pop();
  }
}

function bullets() {
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
  if (key === 'n') {
    weapon = 'normal';
  }
  if (key === 'b') {
    weapon = 'double';
  }
  if (key === 'p') {
    bossMan.phase = 1;
    test();
  }
}


function mousePressed() {
  if (state === 'title') {
    state = 'game';
    textSize(11);
    you.lastPlayerBullet = millis();
  }
}

function dispTitle() {
  textAlign(CENTER);
  textSize(100);
  text('hi', width / 2, height / 2);
}