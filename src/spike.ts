import { CONFIG } from './config';
import { sum } from './util';

/** Ratio of how much a branch grows in comparison to its parent. */
const SPIKE_BRANCH_GROWTH_RATIO = 1 / 2;
/** The color of a spike. */
export const SPIKE_COLOR = "#333";
/** The color of spikes' shadow lines. */
export const SHADOW_COLOR = "#010";
/** The color of spikes' highlights. */
const HIGHLIGHT_COLOR = "#544";

/** The ratio between the base of a spike and the length. */
const LENGTH_TO_BASE_RATIO = 1 / 20;

/** The maximum distance along the spike to branch (from 0-1) */
const MAX_BRANCH_SIZE_RATIO = 0.9;

/** The minimum distance along the spike to branch (from 0-1) */
const MIN_BRANCH_SIZE_RATIO = 0.1;

/** Scales how often branches occur. Higher values produces less branching. */
const BRANCH_CHANCE_MODIFIER = 4.5;


export class Spike {
  /** List of all branches off of the spike. */
  branches: Spike[] = [];
  /** X coordinate of the spike base. */
  x = 0;
  /** Y coordinate of the spike base. */
  y = 0;
  /** The absolute angle of the spike. */
  angle: number;
  /** The remaining number of generations of branches a spike can have. */
  depth: number;
  /** The maximum length of the spike. */
  maxSize: number;
  /** The current length of the spike. */
  size: number;
  /** Allows spikes to grow at different rates. */
  growthRateModifier: number;

  constructor(angle: number, depth: number, maxSize: number, baseGrowthRateModifier: number) {
    this.angle = angle;
    this.depth = depth;
    this.maxSize = maxSize;
    this.size = 0;
    this.growthRateModifier = baseGrowthRateModifier * (0.5 + Math.random() * 0.5);
  }

  /* 
   * Grows the spike and redraws it, including its branches. 
   * 
   * @return whether 
   */
  advance(ctx: CanvasRenderingContext2D, sizeChange: number) {
    let isFinishedGrowing = this.size === this.maxSize;
    if (!isFinishedGrowing) {
      const modifiedSizeChange = sizeChange * this.growthRateModifier;
      const oldSize = this.size;
      this.size = Math.min(this.size + modifiedSizeChange, this.maxSize);
      if (oldSize === this.size) {
        isFinishedGrowing = true; // Consider it finished growing if we reach floating point rounding issues.
      }
      this.maybeBranch(modifiedSizeChange);
    }
    this.draw(ctx);
    for (const branch of this.branches) {
      isFinishedGrowing = branch.advance(ctx, sizeChange) && isFinishedGrowing;
    }
    return isFinishedGrowing;
  }

  /** Randomly generates branches off the spike during growth. */
  maybeBranch(sizeChange: number) {
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
        const newSpike = new Spike(newAngle, newDepth, newMaxSize, this.growthRateModifier * SPIKE_BRANCH_GROWTH_RATIO);
        const origin = this.getCoordinatesAtSize(relativePosition);
        newSpike.x = origin.x;
        newSpike.y = origin.y;
        this.branches.push(newSpike);
      }
    }
  }

  /** Draws the spike. */
  draw(ctx: CanvasRenderingContext2D) {
    const end = this.getCoordinatesAtSize(this.size);
    ctx.fillStyle = SPIKE_COLOR;
    const baseOffset = this.getBaseOffset();

    ctx.beginPath();
    ctx.moveTo(end.x * CONFIG.devicePixelsPerUnit, end.y * CONFIG.devicePixelsPerUnit);
    ctx.lineTo((this.x + baseOffset.x1) * CONFIG.devicePixelsPerUnit, (this.y + baseOffset.y1) * CONFIG.devicePixelsPerUnit)
    ctx.lineTo(this.x * CONFIG.devicePixelsPerUnit, this.y * CONFIG.devicePixelsPerUnit);
    ctx.lineTo((this.x + baseOffset.x2) * CONFIG.devicePixelsPerUnit, (this.y + baseOffset.y2) * CONFIG.devicePixelsPerUnit)
    ctx.fill();

    let shadowX, highlightX, shadowY, highlightY;
    if (baseOffset.y1 > baseOffset.y2) {
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
    for (let i = 7; i <= 10; i++) {
      ctx.beginPath();
      ctx.moveTo(end.x * CONFIG.devicePixelsPerUnit, end.y * CONFIG.devicePixelsPerUnit);
      ctx.lineTo((this.x + shadowX * i / 10) * CONFIG.devicePixelsPerUnit, (this.y + shadowY * i / 10) * CONFIG.devicePixelsPerUnit)
      ctx.stroke();
    }

    ctx.strokeStyle = HIGHLIGHT_COLOR;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(end.x * CONFIG.devicePixelsPerUnit, end.y * CONFIG.devicePixelsPerUnit);
    ctx.lineTo((this.x + highlightX * .9) * CONFIG.devicePixelsPerUnit, (this.y + highlightY * .9) * CONFIG.devicePixelsPerUnit)
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(end.x * CONFIG.devicePixelsPerUnit, end.y * CONFIG.devicePixelsPerUnit);
    ctx.lineTo((this.x + highlightX) * CONFIG.devicePixelsPerUnit, (this.y + highlightY) * CONFIG.devicePixelsPerUnit)
    ctx.stroke();
  }

  /**
   * Generates the coordinates for the end of the spike, given its current
   * position and provided size. 
   */
  getCoordinatesAtSize(size: number) {
    const length = size;
    const x = this.x + Math.cos(this.angle) * length;
    const y = this.y + Math.sin(this.angle) * length;
    return { x: x, y: y };
  }

  /**
   * Generates the offset from the origin of the spike to the edge of its base. 
   * Each is at a 45 degree angle from the actual root. 
   */
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
  getTotalCount(): number {
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