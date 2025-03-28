let startX,startY;
let prevX,prevY;
let drawing = false;
let pg;
let currentShape;
let mode ="line";
let backgroundColor = 255;
let currentColor = 0;

// DOM elements
let save, clearCanvas, ellipse, rectangle, triangle, line, pen, eraser;
let changeColor, colorPicker, selectedColor, bucket, lineWeight, fillShape;

function initializeElements() {
  save = document.getElementById("save");
  clearCanvas = document.getElementById("clearCanvas");
  ellipse = document.getElementById("ellipse");
  rectangle = document.getElementById("rectangle");
  triangle = document.getElementById("triangle");
  line = document.getElementById("line");
  pen = document.getElementById("pen");
  eraser = document.getElementById("eraser");
  changeColor = document.getElementById("changeColor");
  colorPicker = document.getElementById("colorPicker");
  selectedColor = document.getElementById("selectedColor");
  bucket = document.getElementById("bucket");
  lineWeight = document.getElementById("lineWeight");
  fillShape = document.getElementById("fillShape");
}

// p5.js functions must be in global scope
window.setup = function() {
  let canvasContainer = document.getElementById("canvasContainer");
  let canvasWidth = canvasContainer.offsetWidth;
  let canvasHeight = canvasContainer.offsetHeight;
  let myCanvas = createCanvas(canvasWidth, canvasHeight);
  myCanvas.parent("canvasContainer");
  pg = createGraphics(canvasWidth, canvasHeight);
  pg.background(backgroundColor);
  currentShape = new Shape(mode);
}

window.draw = function() {
  background(backgroundColor);
  image(pg, 0, 0);
  if(drawing) {
    currentShape.draw(mouseX, mouseY);
  }
}

window.mousePressed = function() {
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return;
  startX = mouseX;
  startY = mouseY;
  prevX = mouseX;
  prevY = mouseY;
  drawing = true;
  if(mode === "fill") {
    pg.loadPixels();
    let targetColor = pg.get(mouseX, mouseY);
    floodFill(mouseX, mouseY, targetColor);
    pg.updatePixels();
    drawing = false;
  }
}

window.mouseReleased = function() {
  if (!drawing) return;
  drawing = false;
  currentShape.finalize(mouseX, mouseY);
}

function Shape(type) {
  this.type = type;
  this.draw = function(x, y) {
    push();
    if(fillShape && fillShape.checked) {
      fill(currentColor);
    } else {
      noFill();
    }
    stroke(currentColor);
    strokeWeight(lineWeight ? parseInt(lineWeight.value) : 1);
    
    let w = x - startX;
    let h = y - startY;
    
    switch(this.type) {
      case "ellipse":
        ellipse(startX + w/2, startY + h/2, abs(w), abs(h));
        break;
      case "rectangle":
        rect(startX, startY, w, h);
        break;
      case "triangle":
        triangle(startX + w/2, startY, startX, startY + h, startX + w, startY + h);
        break;
      case "line":
        line(startX, startY, x, y);
        break;
      case "free":
        pg.stroke(currentColor);
        pg.strokeWeight(lineWeight ? parseInt(lineWeight.value) : 1);
        pg.line(x, y, prevX, prevY);
        prevX = x;
        prevY = y;
        break;
      case "eraser":
        pg.stroke(backgroundColor);
        pg.strokeWeight(lineWeight ? parseInt(lineWeight.value) : 1);
        pg.line(x, y, prevX, prevY);
        prevX = x;
        prevY = y;
        break;
    }
    pop();
  }

  this.finalize = function(x, y) {
    if (this.type === "free" || this.type === "eraser") return;
    
    pg.push();
    pg.stroke(currentColor);
    pg.strokeWeight(lineWeight ? parseInt(lineWeight.value) : 1);
    
    if(fillShape && fillShape.checked) {
      pg.fill(currentColor);
    } else {
      pg.noFill();
    }
    
    let w = x - startX;
    let h = y - startY;
    
    switch(this.type) {
      case "ellipse":
        pg.ellipse(startX + w/2, startY + h/2, abs(w), abs(h));
        break;
      case "rectangle":
        pg.rect(startX, startY, w, h);
        break;
      case "triangle":
        pg.triangle(startX + w/2, startY, startX, startY + h, startX + w, startY + h);
        break;
      case "line":
        pg.line(startX, startY, x, y);
        break;
    }
    pg.pop();
  }
}

function initializeEventListeners() {
  save.addEventListener("click", function() {
    saveCanvas("myCanvas", "png");
  });

  clearCanvas.addEventListener("click", function() {
    pg.clear();
    pg.background(backgroundColor);
  });

  ellipse.addEventListener("click", function() {
    mode = "ellipse";
    currentShape = new Shape("ellipse");
    setActiveButton(this);
  });

  rectangle.addEventListener("click", function() {
    mode = "rectangle";
    currentShape = new Shape("rectangle");
    setActiveButton(this);
  });

  triangle.addEventListener("click", function() {
    mode = "triangle";
    currentShape = new Shape("triangle");
    setActiveButton(this);
  });

  line.addEventListener("click", function() {
    mode = "line";
    currentShape = new Shape("line");
    setActiveButton(this);
  });

  pen.addEventListener("click", function() {
    mode = "free";
    currentShape = new Shape("free");
    setActiveButton(this);
  });

  eraser.addEventListener("click", function() {
    mode = "eraser";
    currentShape = new Shape("eraser");
    setActiveButton(this);
  });

  changeColor.addEventListener("click", function() {
    colorPicker.click();
  });

  colorPicker.addEventListener("input", function() {
    currentColor = this.value;
    selectedColor.style.backgroundColor = currentColor;
  });

  bucket.addEventListener("click", function() {
    mode = "fill";
    currentShape = new Shape("fill");
    setActiveButton(this);
  });
}

function setActiveButton(activeButton) {
  document.querySelectorAll('.interactiveToolIcon').forEach(button => {
    button.classList.remove('active');
  });
  activeButton.classList.add('active');
}

let directions = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1]
];

function floodFill(x, y, targetColor) {
  let stack = [[x, y]];
  let replacementColor = color(currentColor);
  
  while(stack.length > 0) {
    let [currentX, currentY] = stack.pop();
    if(!isValidPixel(currentX, currentY, targetColor)) continue;
    
    pg.set(currentX, currentY, replacementColor);
    
    for(let [dx, dy] of directions) {
      stack.push([currentX + dx, currentY + dy]);
    }
  }
}

function isValidPixel(x, y, targetColor) {
  if (x < 0 || x >= pg.width || y < 0 || y >= pg.height) return false;
  let currentColor = pg.get(x, y);
  return colorsMatch(currentColor, targetColor);
}

function colorsMatch(c1, c2) {
  return c1[0] === c2[0] && 
         c1[1] === c2[1] && 
         c1[2] === c2[2] && 
         c1[3] === c2[3];
}

window.onload = function() {
  initializeElements();
  initializeEventListeners();
}
