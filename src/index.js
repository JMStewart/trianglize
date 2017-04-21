const poly2tri = require('poly2tri/dist/poly2tri.min.js');

window.trianglesChanged = trianglesChanged;
window.handleFiles = handleFiles;
window.cancelDownload = cancelDownload;
window.download = download;

const imageCanvas = document.getElementById('image');
const imageCtx = imageCanvas.getContext('2d');
const canvasSize = imageCanvas.offsetWidth;
let height = canvasSize;
let width = canvasSize;
let triangleCount = 500;
const resultCanvas = document.getElementById('resultCanvas');
const resultCtx = resultCanvas.getContext('2d');
const imageLoaded = setupCanvas();

imageLoaded.then(function (){
  drawTriangles(triangleCount);
});

function drawTriangles(count) {
  const result = generate(height, width, count);
  const data = processResult(result);
  drawResultTriangles(data);
}

function generate(height, width, count) {
  let points = [];
  for (let i = 0; i < count; i++) {
    points.push({
      x: ~~(Math.random() * (width-2))+1,
      y: ~~(Math.random() * (height-2))+1
    });
  }
  return points;
}

function processResult(data) {
  const border = [{x:0,y:0},{x:width,y:0},{x:width,y:height},{x:0,y:height}];
  const deduped = unique(d => d.x + ',' + d.y, data);
  const swctx = new poly2tri.SweepContext(border);
  swctx.addPoints(deduped);
  swctx.triangulate();
  const triangles = swctx.getTriangles().map(t => t.points_);

  return triangles;
}

function drawResultTriangles(result) {
  resultCtx.clearRect(0, 0, canvasSize, canvasSize);
  result.forEach(polygon => {
    resultCtx.beginPath();
    resultCtx.moveTo(polygon[polygon.length-1].x, polygon[polygon.length-1].y);
    polygon.forEach(point => {
      resultCtx.lineTo(point.x, point.y);
    });
    resultCtx.closePath();
    const centroid = getCentroid(...polygon);
    let color = getColorAtPoint(centroid.x, centroid.y);
    resultCtx.fillStyle = `rgb(${color.r},${color.g},${color.b})`;
    resultCtx.strokeStyle = `rgb(${color.r},${color.g},${color.b})`;
    resultCtx.fill();
    resultCtx.stroke();
  });
}
  
function unique(accessor, array) {
  var map = {};
  var result = [];
  array.forEach(val => {
    let key = accessor(val);
    if (!map[key]) {
      map[key] = val;
      result.push(val);
    }
  });
  return result;
}

function setupCanvas() {
  return renderSourceImage('./giraffe.jpg');
}

function getColorAtPoint(x, y) {
  var data = imageCtx.getImageData(x, y, 1, 1).data;
  return {
    r: data[0],
    g: data[1],
    b: data[2]
  };
}

function getAllColors(ctx) {
  return ctx.getImageData(0, 0, 300, 300).data;
}

function getCentroid(x, y, z) {
  const midXY = {
    x: (x.x + y.x) / 2,
    y: (x.y + y.y) / 2
  };
  const centroid = {
    x: ~~(z.x + (2/3)*(midXY.x - z.x)),
    y: ~~(z.y + (2/3)*(midXY.y - z.y))
  }
  return centroid;
}

function trianglesChanged(count) {
  triangleCount = count;
  drawTriangles(triangleCount);
}

function handleFiles(files) {
  var url = URL.createObjectURL(files[0]);
  renderSourceImage(url)
    .then(() => drawTriangles(triangleCount));
}

function renderSourceImage(url) {
  return new Promise(resolve => {
    var img = new Image();
    img.onload = function() {
      const scale = canvasSize / img.width;
      height = img.height * scale;
      imageCanvas.height = height;
      imageCanvas.width = width;
      resultCanvas.height = height;
      resultCanvas.width = width;
      imageCtx.clearRect(0, 0, canvasSize, canvasSize);
      imageCtx.drawImage(img, 0, 0, width, height);
      resolve();
    }
    img.src = url;
  })
}

resultCanvas.addEventListener('click', function() {
  document.getElementById('downloadModal').style.display = 'block';
}, false)

function cancelDownload() {
  document.getElementById('downloadModal').style.display = '';
}

function download() {
  document.getElementById('downloadModal').style.display = '';
  const link = document.getElementById('dl');
  link.href = resultCanvas.toDataURL('image/png');
  link.click();
}