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
    this.radius = 25;
    this.speed = 5;
    this.jumpHeight = 100;
    this.health = 5;
    this.velocity = 0;
  }
  display(){
    // image( "IMAGEPLACEHOLDER" ,this.x,this.y,this.size,this.size);
    circle(this.x,this.y,this.radius*2);
  }
  update(){
    if (keyIsDown(65)){
      this.x-= this.speed;
    }
    // if (keyIsDown(83)){
    //   this.y += this.speed;
    // }
    if (keyIsDown(68)){
      this.x += this.speed;
    }
    this.gravity();
  }
  shoot(){
    console.log("shoot");
  }
  checkHealth(){
    console.log("checkHealth");
  }
  gravity(){
    if (this.y+this.radius<height-height/4){
      this.velocity+=0.1;
      this.y+=this.velocity;
    }
    else if (this.y+this.radius>height-height/4){
      this.velocity = 0;
      this.y = height-height/4-this.radius;
    }
    if (keyIsDown(87) && this.y+this.radius>=height-height/4){
      if(dist(this.x,this.y,this.x,height-height/4)){
        this.y-=this.velocity;
        this.velocity+=0.1;
      }
    }
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
  line(0,height-height/4,width,height-height/4);
}

function keyPressed(){
}