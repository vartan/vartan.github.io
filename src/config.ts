import { Pitch, PENTATONIC_A_MINOR_2_OCTAVES } from './music';

/** Defines the size of a unit in pixels. */
export const PX_PER_UNIT = 50;


interface AppConfig {
  devicePixelsPerUnit: number;
  oscillatorType: OscillatorType;
  scale: Pitch[];
  autoplayDelayScale: number;
  sustainTime: number;
}
export const CONFIG: AppConfig = {
  devicePixelsPerUnit: PX_PER_UNIT,
  oscillatorType: 'sawtooth',
  // TODO: Either configure this with a pitch list or make a separate
  // piece of configuration for the range of the instrument. Make sure
  // that the notes generated from the pitches are always increasing.
  scale: PENTATONIC_A_MINOR_2_OCTAVES,
  autoplayDelayScale: 1,
  sustainTime: .05,
}