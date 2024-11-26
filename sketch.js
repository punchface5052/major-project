// Major Project
// Liam Thorpe
// Nov. 22, 2024
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let you;

class Player {
  constructor(x,y) {
    this.x = x;
    this.y = y;
    this.size = 50;
    this.speed = 5;
    this.health = 5;
  }
  display(){
    // image( "IMAGEPLACEHOLDER" ,this.x,this.y,this.size,this.size);
    circle(this.x,this.y,this.size);
  }
  update(){
    if (keyIsDown(87)){
      this.y-= this.speed;
    }
    if (keyIsDown(65)){
      this.x-= this.speed;
    }
    if (keyIsDown(83)){
      this.y += this.speed;
    }
    if (keyIsDown(68)){
      this.x += this.speed;
    }
  }
  shoot(){
    console.log("shoot");
  }
  checkHealth(){
    console.log("checkHealth");
  }
}

class Boss {
  constructor(x,y) {
    this.x = x;
    this.y = y;
    this.size = 50;
    this.speed = 5;
    this.health = 5;
  }
  display(){
    image( "IMAGEPLACEHOLDER" ,this.x,this.y,this.size,this.size);
  }
  update(){

  }
  move(){

  }
  shoot(){

  }
  checkHealth(){

  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  you = new Player(50,50);
}

function draw() {
  background(220);
  you.update();
  you.display();
}

function keyPressed(){
}