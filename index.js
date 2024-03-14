let canvas;
let ctx;
const SPIKE_GROWTH_PER_MS = 1;
const PX_PER_UNIT = 50;
const SPIKE_COLOR =  "#333";
function onLoad() {
  canvas = document.getElementById("spike-field");
  canvas.width = document.body.offsetWidth;
  canvas.height = window.innerHeight;
  ctx = canvas.getContext("2d");
  drawFloor();

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

function drawFloor() {
  ctx.fillStyle = SPIKE_COLOR;
  ctx.fillRect(0, canvas.height - PX_PER_UNIT, canvas.width, PX_PER_UNIT);
}

let lastTick = 0;
const rootSpikes = [];
function tick(time) {
  // Don't bother clearing the canvas since we never need to erase previously
  // drawn spikes.
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

  /* Grows the spike and redraws it, including its children. */
  advance(sizeChange) {
    if (this.size !== this.maxSize) {
      // If the spike is already fully grown, don't bother growing/drawing it.
      this.size = Math.min(this.size + sizeChange, this.maxSize);
      this.maybeBranch(sizeChange);
      this.draw();
    }
    for (const childSpike of this.children) {
      childSpike.advance(sizeChange);
    }
  }

  /** Randomly generates branches off the spike during growth. */
  maybeBranch(sizeChange) {
    if (this.size / this.maxSize < 0.9 && this.depth > 0) {
      if (Math.random() < sizeChange) {
        const newAngle = this.angle + (Math.random() - 0.5) * Math.PI;
        const newMaxSize = (this.maxSize - this.size) * (0.33 + Math.random() * 0.33);
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

  /** Draws the spike. */
  draw() {
    const end = this.getCoordinatesAtSize(this.size);
    ctx.beginPath();
    ctx.moveTo(end.x * PX_PER_UNIT, end.y * PX_PER_UNIT);
    const baseOffset = this.getBaseOffset();
    ctx.lineTo((this.x + baseOffset.x) * PX_PER_UNIT, (this.y + baseOffset.y) * PX_PER_UNIT)
    ctx.lineTo((this.x - baseOffset.x) * PX_PER_UNIT, (this.y - baseOffset.y) * PX_PER_UNIT)
    ctx.fillStyle = "#333";
    ctx.fill();
  }

  /**
   * Generates the coordinates for the end of the spike, given its current
   * position and provided size. 
   */
  getCoordinatesAtSize(size) {
    const length = size * this.maxSize;
    const x = this.x + Math.cos(this.angle) * length;
    const y = this.y + Math.sin(this.angle) * length;
    return { x: x, y: y };
  }

  /** Generates the offset from the origin of the spike to the edge of its base. */
  getBaseOffset() {
    const length = this.size * this.maxSize / 20;
    const angle = this.angle + Math.PI / 4;
    const x = Math.cos(angle) * length;
    const y = Math.sin(angle) * length;
    return {x: x, y: y}
  }

  /** For debugging purposes, generates a recursive count of spikes. */
  getTotalCount() {
    return 1 + this.children.map((child) => child.getTotalCount()).reduce(sum, 0);
  }
}

function sum(acc, value) {
  return acc + value;
}

addEventListener("load", onLoad);