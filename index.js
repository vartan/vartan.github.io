/** Defines the size of a unit in pixels. */
const PX_PER_UNIT = 50;

/** How many units spikes grow each second. */
const SPIKE_GROWTH_PER_SECOND = 2;

/** The color of a spike. */
const SPIKE_COLOR = "#333";
/** The color of spikes' shadow lines. */
const SHADOW_COLOR = "#000";
/** The color of spikes' highlights. */
const HIGHLIGHT_COLOR = "#555";

/** The minimum number of spikes to draw when the browser has a small width. */
const MIN_SPIKE_COUNT = 3;

/** The maximum amount of saturation in the background color, from Ox00-0x0F. */
const MAX_BACKGROUND_SATURATION = 0x15;

/** 
 * How often the background color is changed. Note that the browser may draw
 * the background more frequently due to the transition style. 
 */
const BACKGROUND_FLICKER_RATE_MS = 0.25;

/** The ratio between the base of a spike and the length. */
const LENGTH_TO_BASE_RATIO = 1 / 20;

/** The maximum distance along the spike to branch (from 0-1) */
const MAX_BRANCH_SIZE_RATIO = 0.9;

/** The minimum distance along the spike to branch (from 0-1) */
const MIN_BRANCH_SIZE_RATIO = 0.1;

/** Scales how often branches occur. Higher values produces less branching. */
const BRANCH_CHANCE_MODIFIER = 4.5;

/** How often the cursor blinks on or off.*/
const CURSOR_BLINK_MS = 500;

/** HTML canvas element for the spike field. */
let canvas;

/** {@link canvas} context. */
let ctx;

/** Used to track the time since the last tick. */
let lastTick = 0;

/** Root spikes which grow from the bottom of the screen. */
const rootSpikes = [];

let contentFull;
let contentText;
let cursor;
let devicePixelsPerUnit = PX_PER_UNIT;

/** Runs when the document is finished loading. */
function onLoad() {
  canvas = document.getElementById("spike-field");
  ctx = canvas.getContext("2d");
  contentFull = document.getElementById("content-full");
  contentText = document.getElementById("content-text");
  cursor = document.getElementById("cursor");
  init();

  addEventListener("resize", onResize);
  requestAnimationFrame(tick);

  setInterval(flickerBackground, BACKGROUND_FLICKER_RATE_MS);
  setInterval(toggleCursorVisibility, CURSOR_BLINK_MS);
  typeNextCharacter();
}

/** 
 * Shows and hides the cursor at a regular interval.
 * 
 * Every {@link CURSOR_BLINK_MS} this will either hide or show the cursor.
 */
function toggleCursorVisibility() {
  cursor.className = cursor.className ? "" : "hidden";
}

/** 
 * Appends the next character to visible content, and schedules the next one. 
 */
function typeNextCharacter() {
  const currentLength = contentText.textContent.length;
  const maxLength = contentFull.textContent.length;
  if(currentLength < maxLength) {
    const nextChar = contentFull.textContent.charAt(currentLength);
    contentText.appendChild(document.createTextNode(contentFull.textContent.charAt(currentLength)))
    let maxTimeout = nextChar.match(/[a-z]/i) ? 25 : 100;
    if(nextChar === "\n") {
      maxTimeout = 300;
    }
    const timeout = maxTimeout * (0.25 + Math.random() * 0.75)
    setTimeout(typeNextCharacter, timeout);
  }
}

/** 
 * Handler ran when the browser is resized.
 * 
 * Resets the canvas and reinitializes the spike field for the new size.
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
  const pixelRatio = window.devicePixelRatio;
  devicePixelsPerUnit = PX_PER_UNIT * pixelRatio;
  canvas.width = window.innerWidth * pixelRatio;
  canvas.height = window.innerHeight * pixelRatio;
  const scale = 1 / pixelRatio;
  canvas.style.transform = "scale(" + scale +","+ scale + ")";

  // Draw a floor so the spikes appear to grow out of a medium.
  // As an added bonus, the floor hides the bottom edge of the spikes.
  drawFloor();
  const spikeCount = Math.max(MIN_SPIKE_COUNT, canvas.width / devicePixelsPerUnit / 4);
  const averageSpikeDistance = 1 / spikeCount;
  for (let i = 0; i < spikeCount; i++) {
    // These values were mostly chosen by trial and error for what I
    // personally feel looks good.
    const angle = (Math.random() * 0.25 + 1.375) * Math.PI;
    const depth = 3 + Math.round(Math.random() * 2);
    const relativePosition = averageSpikeDistance * (i + Math.random());
    const maxSize = canvas.height / devicePixelsPerUnit;
    const spike = new Spike(
      angle,
      depth,
      maxSize * (1 - Math.random() * Math.random() * 0.5),
      /* shouldFillRoot= */ true
    );
    spike.x = canvas.width * relativePosition / devicePixelsPerUnit;
    spike.y = canvas.height / devicePixelsPerUnit + Math.random()*-.5;
    rootSpikes.push(spike);
  }
}

/** Fills a 1 unit tall floor at the bottom of the canvas. */
function drawFloor() {
  const FLOOR_HEIGHT = 1.5;
  ctx.fillStyle = SPIKE_COLOR;
  ctx.fillRect(0, canvas.height - devicePixelsPerUnit* FLOOR_HEIGHT, canvas.width, devicePixelsPerUnit * FLOOR_HEIGHT);
  ctx.strokeStyle = SHADOW_COLOR;
  ctx.lineWidth = 1;
  const SHADOW_POSITIONS = [12, 16, 18, 19, 20];
  for(let i = 0; i < SHADOW_POSITIONS.length; i++) {
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - FLOOR_HEIGHT*devicePixelsPerUnit*SHADOW_POSITIONS[i]/20);
    ctx.lineTo(canvas.width, canvas.height - FLOOR_HEIGHT*devicePixelsPerUnit*SHADOW_POSITIONS[i]/20);
    ctx.stroke();
  }

}

/** 
 * Canvas animation tick.
 * 
 * Advances spike growth depending on the amount of time elapsed since the
 * previous frame was rendered.
 */
function tick(time) {
  const timeChange = time - lastTick;
  const sizeChange = timeChange / 1000 * SPIKE_GROWTH_PER_SECOND;
  let isFinishedGrowing = true;
  for (const spike of rootSpikes) {
    isFinishedGrowing = spike.advance(sizeChange) && isFinishedGrowing;
  }
  lastTick = time;
  if(!isFinishedGrowing) {
    requestAnimationFrame(tick);
  }
}

class Spike {
  constructor(angle, depth, maxSize, shouldFillRoot) {
    /** List of all branches off of the spike. */
    this.branches = [];
    /** X coordinate of the spike base. */
    this.x = 0;
    /** Y coordinate of the spike base. */
    this.y = 0;
    /** The absolute angle of the spike. */
    this.angle = angle;
    /** The remaining number of generations of branches a spike can have. */
    this.depth = depth;
    /** The maximum length of the spike. */
    this.maxSize = maxSize;
    /** The current length of the spike. */
    this.size = 0;
    /** Allows spikes to grow at different rates. */
    this.growthRateModifier = 0.5 + Math.random() * 0.5;
    /** 
     * When true, it fills in the root of the spike where some drawing 
     * artifacts otherwise provide some extra depth. 
     */
    this.shouldFillRoot = shouldFillRoot;
  }

  /* 
   * Grows the spike and redraws it, including its branches. 
   * 
   * @return whether 
   */
  advance(sizeChange) {
    let isFinishedGrowing = this.size === this.maxSize;
    if(!isFinishedGrowing) {
      const modifiedSizeChange = sizeChange * this.growthRateModifier;
      this.size = Math.min(this.size + modifiedSizeChange, this.maxSize);
      this.maybeBranch(modifiedSizeChange);
    }
    this.draw();
    for (const branch of this.branches) {
      isFinishedGrowing = branch.advance(sizeChange / 3) && isFinishedGrowing;
    }
    return isFinishedGrowing;
  }

  /** Randomly generates branches off the spike during growth. */
  maybeBranch(sizeChange) {
    const percentGrown = this.size / this.maxSize;
    const isBranchElligible = percentGrown < MAX_BRANCH_SIZE_RATIO && percentGrown > MIN_BRANCH_SIZE_RATIO;
    if (isBranchElligible && this.depth > 0) {
      if (Math.random() * BRANCH_CHANCE_MODIFIER < sizeChange) {
        const angleDirection = Math.random() > 0.5 ? 1 : -1;
        // Branches grow out 45-90 degrees in either direction from their parent.
        const angleOffset = angleDirection * (Math.random() * 0.25 + 0.25) * Math.PI;
        const newAngle = this.angle + angleOffset
        // Branches get smaller the closer they are to the end.
        const maxSizeLimit = this.maxSize - this.size;
        const newMaxSize = maxSizeLimit * (0.33 + Math.random() * 0.33);
        const newDepth = this.depth - 1;
        const relativePosition = this.size;
        const newSpike = new Spike(newAngle, newDepth, newMaxSize, false);
        const origin = this.getCoordinatesAtSize(relativePosition);
        newSpike.x = origin.x;
        newSpike.y = origin.y;
        this.branches.push(newSpike);
      }
    }
  }

  /** Draws the spike. */
  draw(forced) {
    const end = this.getCoordinatesAtSize(this.size);
    ctx.fillStyle = SPIKE_COLOR;
    const baseOffset = this.getBaseOffset();

    ctx.beginPath();
    ctx.moveTo(end.x * devicePixelsPerUnit, end.y * devicePixelsPerUnit);
    ctx.lineTo((this.x + baseOffset.x1) * devicePixelsPerUnit, (this.y + baseOffset.y1) * devicePixelsPerUnit)
    if(this.shouldFillRoot) {
      ctx.lineTo((this.x) * devicePixelsPerUnit, (this.y) * devicePixelsPerUnit);
    }
    ctx.lineTo((this.x + baseOffset.x2) * devicePixelsPerUnit, (this.y + baseOffset.y2) * devicePixelsPerUnit)
    ctx.fill();

    let shadowX, highlightX, shadowY, highlightY;
    if(baseOffset.y1 > baseOffset.y2) {
      shadowX = baseOffset.x1;
      shadowY = baseOffset.y1;
      highlightX = baseOffset.x2;
      highlightY = baseOffset.y2;
    } else {
      shadowX = baseOffset.x2;
      shadowY = baseOffset.y2;
      highlightX = baseOffset.x1;
      highlightY = baseOffset.y1;
    }

    ctx.strokeStyle = SHADOW_COLOR;
    ctx.lineWidth = 1;
    for(let i = 7; i <= 10; i++) {
      ctx.beginPath();
      ctx.moveTo(end.x * devicePixelsPerUnit, end.y * devicePixelsPerUnit);
      ctx.lineTo((this.x + shadowX*i/10) * devicePixelsPerUnit, (this.y + shadowY*i/10) * devicePixelsPerUnit)
      ctx.stroke();
    }

    ctx.strokeStyle = HIGHLIGHT_COLOR;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(end.x * devicePixelsPerUnit, end.y * devicePixelsPerUnit);
    ctx.lineTo((this.x + highlightX*.9) * devicePixelsPerUnit, (this.y + highlightY*.9) * devicePixelsPerUnit)
    ctx.stroke();
    
  }

  /**
   * Generates the coordinates for the end of the spike, given its current
   * position and provided size. 
   */
  getCoordinatesAtSize(size) {
    const length = size;
    const x = this.x + Math.cos(this.angle) * length;
    const y = this.y + Math.sin(this.angle) * length;
    return { x: x, y: y };
  }

  /** Generates the offset from the origin of the spike to the edge of its base. */
  getBaseOffset() {
    const length = this.size * LENGTH_TO_BASE_RATIO;
    const angle1 = this.angle + Math.PI / 4;
    const x1 = Math.cos(angle1) * length;
    const y1 = Math.sin(angle1) * length;
    const angle2 = this.angle - Math.PI / 4;
    const x2 = Math.cos(angle2) * length;
    const y2 = Math.sin(angle2) * length;
    return { x1: x1, y1: y1, x2: x2, y2: y2 }
  }

  /** For debugging purposes, generates a recursive count of spikes. */
  getTotalCount() {
    return 1 + this.branches.map((child) => child.getTotalCount()).reduce(sum, 0);
  }

  /** Recursively disposes references to branches. */
  dispose() {
    for (const branch of this.branches) {
      branch.dispose();
    }
    this.branches = [];
  }
}

function sum(acc, value) {
  return acc + value;
}

function flickerBackground() {
  let saturation = Math.floor(Math.random() * MAX_BACKGROUND_SATURATION).toString(16);
  if (saturation.length === 1) {
    saturation = "0" + saturation;
  }
  // Alternate between red and green every 500ms
  if(new Date().getMilliseconds() % 500 < 250) {
    document.body.style.backgroundColor = saturation + "0000";
  } else {
    document.body.style.backgroundColor = "00" + saturation + "00";
  }
}

addEventListener("load", onLoad);
