const SPIKE_GROWTH_PER_MS = 1;
const PX_PER_UNIT = 50;
const SPIKE_COLOR = "#333";
const NUMBER_OF_ROOT_SPIKES = 10;

let canvas;
let ctx;
let lastTick = 0;
const rootSpikes = [];

function onLoad() {
  canvas = document.getElementById("spike-field");
  ctx = canvas.getContext("2d");
  init();

  addEventListener("resize", onResize);
  requestAnimationFrame(tick);
}

/** 
 * Disposes any existing spikes, clears the canvas, and resets the spike field.
 */
function onResize() {
  reset();
  init();
}

/** 
 * Disposes any existing spikes, resets the spike field, and clears the canvas.
 */
function reset() {
  for (const spike of rootSpikes) {
    spike.dispose();
  }
  rootSpikes.length = 0;
  ctx.reset();
}

/** 
 * Initializes the canvas to cover the client background, draws a floor, and
 * initializes the root spikes 
 */
function init() {
  // Resize the canvas to match the screen.
  canvas.width = document.body.clientWidth;
  canvas.height = document.body.clientHeight;

  // Draw a floor so the spikes appear to grow out of a medium.
  // As an added bonus, the floor hides the bottom edge of the spikes.
  drawFloor();
  const spikeCount = Math.max(4, canvas.width / PX_PER_UNIT / 4);
  const averageSpikeDistance = 1 / spikeCount;
  for (let i = 0; i < spikeCount; i++) {
    // These values were mostly chosen by trial and error for what I
    // personally feel looks good.
    const angle = (Math.random() * 0.5 + 1.25) * Math.PI;
    const depth = 3 + Math.round(Math.random() * 2);
    const relativePosition = averageSpikeDistance * (i + Math.random());
    const maxSize = document.body.clientHeight / PX_PER_UNIT / 4.5
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
}

/** Fills a 1 unit tall floor at the bottom of the canvas. */
function drawFloor() {
  ctx.fillStyle = SPIKE_COLOR;
  ctx.fillRect(0, canvas.height - PX_PER_UNIT, canvas.width, PX_PER_UNIT);
}

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
        const newMaxSize = (this.maxSize - this.size / 2) * (0.33 + Math.random() * 0.33);
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
    ctx.fillStyle = SPIKE_COLOR;
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
    return { x: x, y: y }
  }

  /** For debugging purposes, generates a recursive count of spikes. */
  getTotalCount() {
    return 1 + this.children.map((child) => child.getTotalCount()).reduce(sum, 0);
  }

  dispose() {
    for (const child of this.children) {
      child.dispose();
    }
    this.children = [];
  }
}

function sum(acc, value) {
  return acc + value;
}

addEventListener("load", onLoad);