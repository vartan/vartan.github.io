let canvas;
let ctx;
const SPIKE_GROWTH_PER_MS = 1;
const PX_PER_UNIT = 50;
function onLoad() {
  canvas = document.getElementById("spike-field");
  canvas.width = document.body.offsetWidth;
  canvas.height = window.innerHeight;
  ctx = canvas.getContext("2d");

  for (let i = 0; i < 10; i++) {
    const angle = (Math.random()*0.5 + 1.25) * Math.PI;
    const depth = 3 + Math.round(Math.random() * 2);
    const relativePosition = Math.random();
    const maxSize = 0.8 + Math.random() * 3;
    const spike = new Spike(
      angle,
      depth,
      relativePosition,
      maxSize
    );
    spike.x = canvas.width * relativePosition / PX_PER_UNIT;
    spike.y = canvas.height / PX_PER_UNIT;
    rootSpikes.push(spike);
  }


  requestAnimationFrame(tick);
}

let lastTick = 0;
const rootSpikes = [];
function tick(time) {
  // ctx.clearRect(0, 0, canvas.width, canvas.height);
  const timeChange = time - lastTick;
  const sizeChange = timeChange / 1000 * SPIKE_GROWTH_PER_MS;

  for (const spike of rootSpikes) {
    spike.advance(sizeChange);
  }
  lastTick = time;
  requestAnimationFrame(tick);
}

class Spike {
  constructor(angle, depth, relativePosition, maxSize) {
    this.children = [];
    this.x = 0;
    this.y = 0;
    this.angle = angle;
    this.depth = depth;
    this.relativePosition = relativePosition;
    this.maxSize = maxSize;
    this.size = 0;
  }

  advance(sizeChange) {
    if (this.size !== this.maxSize) {
      this.size = Math.min(this.size + sizeChange, this.maxSize);
      // todo: reposition childrens' x,y coordinates?
      this.maybeBranch(sizeChange);
      this.draw();
    }
    for (const childSpike of this.children) {
      childSpike.advance(sizeChange);
    }
  }

  maybeBranch(sizeChange) {
    if (this.size / this.maxSize < 0.9 && this.depth > 0) {
      if (Math.random() < sizeChange) {
        const newAngle = this.angle + (Math.random() - 0.5) * Math.PI;
        const newMaxSize = this.maxSize * (0.33 + Math.random() * 0.33);
        const newDepth = this.depth - 1;
        const newRelativePosition = this.size;
        const newSpike = new Spike(newAngle, newDepth, newRelativePosition, newMaxSize);
        const origin = this.getCoordinatesAtSize(newRelativePosition);
        newSpike.x = origin.x;
        newSpike.y = origin.y;
        this.children.push(newSpike);
      }
    }
  }

  draw() {
    ctx.moveTo(this.x * PX_PER_UNIT, this.y * PX_PER_UNIT);
    const end = this.getCoordinatesAtSize(this.size);
    ctx.lineTo(end.x * PX_PER_UNIT, end.y * PX_PER_UNIT);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#333";
    ctx.stroke();
  }

  getCoordinatesAtSize(size) {
    const length = size * this.maxSize;
    const x = this.x + Math.cos(this.angle) * length;
    const y = this.y + Math.sin(this.angle) * length;
    return { x: x, y: y };
  }

  getTotalCount() {
    return 1 + this.children.map((child) => child.getTotalCount()).reduce(sum, 0);
  }
}


function sum(acc, value) {
  return acc + value;
}



addEventListener("load", onLoad);