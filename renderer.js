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
    if (!colorsMatch(targetColor, pg.get(mouseX, mouseY))) {
      targetColor = pg.get(mouseX, mouseY);
    }
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
        arc(startX + w/2, startY + h/2, abs(w), abs(h), 0, TWO_PI);
        break;
      case "rectangle":
        rect(startX, startY, w, h);
        break;
      case "triangle":
        beginShape();
        vertex(startX + w/2, startY);
        vertex(startX, startY + h);
        vertex(startX + w, startY + h);
        endShape(CLOSE);
        break;
      case "line":
        beginShape();
        vertex(startX, startY);
        vertex(x, y);
        endShape();
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
        pg.arc(startX + w/2, startY + h/2, abs(w), abs(h), 0, TWO_PI);
        break;
      case "rectangle":
        pg.rect(startX, startY, w, h);
        break;
      case "triangle":
        pg.beginShape();
        pg.vertex(startX + w/2, startY);
        pg.vertex(startX, startY + h);
        pg.vertex(startX + w, startY + h);
        pg.endShape(pg.CLOSE);
        break;
      case "line":
        pg.beginShape();
        pg.vertex(startX, startY);
        pg.vertex(x, y);
        pg.endShape();
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
    currentColor = color(this.value);
    selectedColor.style.backgroundColor = this.value;
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
  let fillColor = currentColor;
  let visited = new Set();

  while (stack.length > 0) {
    let [currentX, currentY] = stack.pop();
    let key = `${currentX},${currentY}`;
    if (visited.has(key)) continue;
    visited.add(key);

    if (!isValidPixel(currentX, currentY, targetColor)) continue;

    pg.set(currentX, currentY, fillColor);

    for (let [dx, dy] of directions) {
      let newX = currentX + dx;
      let newY = currentY + dy;
      if (isValidPixel(newX, newY, targetColor)) {
        stack.push([newX, newY]);
      }
    }
  }
  pg.updatePixels();
}

function isValidPixel(x, y, targetColor) {
  if (x < 0 || x >= pg.width || y < 0 || y >= pg.height) return false;
  let currentColor = pg.get(x, y);
  return (
    currentColor[0] === targetColor[0] &&
    currentColor[1] === targetColor[1] &&
    currentColor[2] === targetColor[2]
  );
}

function colorsMatch(c1, c2) {
  return (
    Math.abs(c1[0] - c2[0]) < 5 &&
    Math.abs(c1[1] - c2[1]) < 5 &&
    Math.abs(c1[2] - c2[2]) < 5
  );
}

window.onload = function() {
  initializeElements();
  initializeEventListeners();
}
