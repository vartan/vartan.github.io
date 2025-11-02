import { Spike, SPIKE_COLOR, SHADOW_COLOR } from './spike';
import { CONFIG, PX_PER_UNIT } from './config';
import { NAME_TO_SCALE } from './music';

// TODO: separate the following into their own file:
// * Command line interface (possibly command handling as well)
// * Playing Audio

/** How many units spikes grow each second. */
const SPIKE_GROWTH_PER_SECOND = 3;


/** Number of spikes to grow per unit width. See PX_PER_UNIT.  */
const ROOT_SPIKES_PER_UNIT = 1.3;

/** The number of units high the floor is drawn. */
const FLOOR_HEIGHT = 1.5;


/** The minimum number of spikes to draw when the browser has a small width. */
const MIN_SPIKE_COUNT = 15;

/** The maximum amount of saturation in the background color, from Ox00-0x0F. */
const MAX_BACKGROUND_SATURATION = 0x1A;

/** 
 * How often the background color is changed. Note that the browser may draw
 * the background more frequently due to the transition style. 
 */
const BACKGROUND_FLICKER_RATE_MS = 0.25;

/** How often the cursor blinks on or off.*/
const CURSOR_BLINK_MS = 500;


/** HTML canvas element for the spike field. */
let canvas: HTMLCanvasElement;

/** {@link canvas} context. */
let ctx: CanvasRenderingContext2D;

/** Used to track the time since the last tick. */
let lastTick = 0;

/** Used to restart animation if resized after drawing is done. */
let isTicking = false;

/** Used to track progress in the content text.*/
let tickedCharacters = 0;

/** Root spikes which grow from the bottom of the screen. */
const rootSpikes: Spike[] = [];

/** Buffer for the secret command line. */
let lineBuffer = "";

let contentFull: HTMLElement;
let contentText: HTMLElement;
let cursor: HTMLElement;
let hasUserInteraction = false;
/** Runs when the document is finished loading. */
function onLoad() {
  canvas = document.getElementById("spike-field") as HTMLCanvasElement;
  ctx = canvas.getContext("2d");
  contentFull = document.getElementById("content-full");
  contentText = document.getElementById("content-text");
  cursor = document.getElementById("cursor");
  init();

  addEventListener("resize", onResize);

  // Set up all of the timers.
  requestAnimationFrame(tick); // Draw the spike field.
  setInterval(flickerBackground, BACKGROUND_FLICKER_RATE_MS);
  setInterval(toggleCursorVisibility, CURSOR_BLINK_MS);

  const hash = window.location.hash;
  if (hash) {
    contentFull.textContent = unescape(hash.substring(1));
  }
  typeNextCharacter();

  document.body.addEventListener("keypress", onKeyPress);
  document.body.addEventListener("keydown", onKeyDown);
  document.body.addEventListener("keyup", onKeyUp);
  document.body.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("blur", onWindowBlur);
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
  const currentLength = tickedCharacters;
  const maxLength = contentFull.textContent.length;
  if (currentLength < maxLength) {
    tickedCharacters++;
    const nextChar = contentFull.textContent.charAt(currentLength);
    const timeout = typeCharacter(nextChar);
    playCharacterAudio(nextChar.charCodeAt(0));
    setTimeout(typeNextCharacter, timeout);
  }
}

function onLineTyped(line: string) {
  const setOscillatorRe = line.match(/set oscillatorType (sawtooth|sine|triangle|square)/i);
  if (setOscillatorRe) {
    CONFIG.oscillatorType = setOscillatorRe[1].toLowerCase() as OscillatorType;
    return;
  }
  const setScaleRe = line.match(/set scale ([\w\d]+)/i);
  if (setScaleRe) {
    const scale = NAME_TO_SCALE[setScaleRe[1]];
    if (scale) {
      CONFIG.scale = scale;
    }
  }
}

function typeCharacter(nextChar: string) {
  contentText.appendChild(document.createTextNode(nextChar))
  // Allow letters to type faster than special characters
  let maxTimeout = nextChar.match(/[a-z]/i) ? 25 : 100;
  if (nextChar === "\n" || nextChar === "\r\n") {
    maxTimeout = 300;
    onLineTyped(lineBuffer);
    lineBuffer = "";
  } else {
    lineBuffer += nextChar;
  }
  // Randomize the typing time a little bit.
  const timeout = maxTimeout * (0.25 + Math.random() * 0.75);
  cursor.scrollIntoView();
  return timeout;
}

let oscMap: { [key in number]: () => void } = {};

let _audioContext: AudioContext;
function getAudioContext() {
  if (!_audioContext && hasUserInteraction) {
    _audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return _audioContext;
}

function playCharacterAudio(char: number, disableAutoStop: boolean = false, scale = CONFIG.scale) {
  let audioContext = getAudioContext();
  if (disableAutoStop && oscMap[char] || !audioContext) {
    return;
  }
  var osc = audioContext.createOscillator(); // instantiate an oscillator

  var gainNode = audioContext.createGain();
  gainNode.gain.value = 0.25;
  osc.type = CONFIG.oscillatorType;
  osc.frequency.value = 220 * Math.pow(2, scale[(char % scale.length)] / 12); // Hz
  osc.connect(gainNode).connect(audioContext.destination); // connect it to the destination
  osc.start(audioContext.currentTime); // start the oscillator
  if (!disableAutoStop) {
    osc.stop(audioContext.currentTime + .05);
  } else {
    oscMap[char] = () => osc.stop(audioContext.currentTime);
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
  if (!isTicking) {
    requestAnimationFrame(tick);
  }
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
  CONFIG.devicePixelsPerUnit = PX_PER_UNIT * pixelRatio;
  canvas.width = window.innerWidth * pixelRatio;
  canvas.height = window.innerHeight * pixelRatio;
  const scale = 1 / pixelRatio;
  canvas.style.transform = "scale(" + scale + "," + scale + ")";

  // Draw a floor so the spikes appear to grow out of a medium.
  // As an added bonus, the floor hides the bottom edge of the spikes.
  drawFloor();
  initializeSpikes();
}

function initializeSpikes() {
  const spikeCount = Math.max(MIN_SPIKE_COUNT, canvas.width / CONFIG.devicePixelsPerUnit * ROOT_SPIKES_PER_UNIT);
  let spikeYs = [];
  for (let i = 0; i < spikeCount; i++) {
    spikeYs.push(Math.random());
  }
  // Ensure root spikes are added with the closest spikes last in order to
  // preserve depth.
  spikeYs.sort();
  for (let i = spikeYs.length - 1; i >= 0; i--) {
    // These values were mostly chosen by trial and error for what I
    // personally feel looks good.
    const angle = (Math.random() * 0.25 + 1.375) * Math.PI;
    const depth = 3 + Math.round(Math.random() * 2);
    const maxSize = canvas.height / CONFIG.devicePixelsPerUnit * (1 - spikeYs[i]);
    const spike = new Spike(
      angle,
      depth,
      maxSize * (1 - Math.random() * Math.random() * 0.5),
      (1 - spikeYs[i])
    );
    spike.x = canvas.width * Math.random() / CONFIG.devicePixelsPerUnit;
    spike.y = canvas.height / CONFIG.devicePixelsPerUnit - spikeYs[i] * FLOOR_HEIGHT;
    rootSpikes.push(spike);
  }
}

/** Fills a 1 unit tall floor at the bottom of the canvas. */
function drawFloor() {
  ctx.fillStyle = SPIKE_COLOR;
  ctx.fillRect(0, canvas.height - CONFIG.devicePixelsPerUnit * FLOOR_HEIGHT, canvas.width, CONFIG.devicePixelsPerUnit * FLOOR_HEIGHT);
  ctx.strokeStyle = SHADOW_COLOR;
  ctx.lineWidth = 1;
  const SHADOW_POSITIONS = [4, 12, 16, 18, 19, 20];
  for (let i = 0; i < SHADOW_POSITIONS.length; i++) {
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - FLOOR_HEIGHT * CONFIG.devicePixelsPerUnit * SHADOW_POSITIONS[i] / 20);
    ctx.lineTo(canvas.width, canvas.height - FLOOR_HEIGHT * CONFIG.devicePixelsPerUnit * SHADOW_POSITIONS[i] / 20);
    ctx.stroke();
  }

}

/** 
 * Canvas animation tick.
 * 
 * Advances spike growth depending on the amount of time elapsed since the
 * previous frame was rendered.
 */
function tick(time: number) {
  isTicking = true;
  const timeChange = time - lastTick;
  const sizeChange = timeChange / 1000 * SPIKE_GROWTH_PER_SECOND;
  let isFinishedGrowing = true;
  for (const spike of rootSpikes) {
    isFinishedGrowing = spike.advance(ctx, sizeChange) && isFinishedGrowing;
  }
  lastTick = time;
  if (isFinishedGrowing) {
    isTicking = false;
  } else {
    requestAnimationFrame(tick);
  }
}

function flickerBackground() {
  let saturation = Math.floor(Math.random() * MAX_BACKGROUND_SATURATION).toString(16);
  if (saturation.length === 1) {
    saturation = "0" + saturation;
  }
  // Alternate between red and green every 500ms
  if (new Date().getMilliseconds() % 500 < 250) {
    document.body.style.backgroundColor = saturation + "0000";
  } else {
    document.body.style.backgroundColor = "00" + saturation + "00";
  }
}

function onKeyDown(event: KeyboardEvent) {
  hasUserInteraction = true;
  if (event.repeat) { return; }
  playCharacterAudio(event.which, true);
  if (event.which === 8) {
    contentText.lastChild && contentText.lastChild.remove();
  }
}

function onKeyPress(event: KeyboardEvent) {
  if (event.repeat) { return; }

  let key = String.fromCharCode(event.which);
  if (event.which === 13) {
    typeCharacter("\r\n");
  } else {
    typeCharacter(key);
  }
}

function onKeyUp(event: KeyboardEvent) {
  const charCode = event.which;
  const maybeStop = oscMap[charCode];
  if (maybeStop) {
    delete oscMap[charCode];
    maybeStop();
  }

}

function onPointerDown() {
  hasUserInteraction = true;
}

function onWindowBlur() {
  for (const key in oscMap) {
    if (!oscMap.hasOwnProperty(key)) {
      continue;
    }
    oscMap[key]();
  }
  oscMap = {};
}

addEventListener("load", onLoad);
