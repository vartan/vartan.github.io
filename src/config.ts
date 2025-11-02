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
  scale: PENTATONIC_A_MINOR_2_OCTAVES,
  autoplayDelayScale: 1,
  sustainTime: .05,
}