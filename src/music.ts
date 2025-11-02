export enum Pitch {
  A = 0,
  AS = 1,
  B = 2,
  C = 3,
  CS = 4,
  D = 5,
  DS = 6,
  E = 7,
  F = 8,
  FS = 9,
  G = 10,
  GS = 11
}

export type IncreaseSemitone<T extends Pitch> =
  T extends Pitch.A ? Pitch.AS :
  T extends Pitch.AS ? Pitch.B :
  T extends Pitch.B ? Pitch.C :
  T extends Pitch.C ? Pitch.CS :
  T extends Pitch.CS ? Pitch.D :
  T extends Pitch.D ? Pitch.DS :
  T extends Pitch.DS ? Pitch.E :
  T extends Pitch.E ? Pitch.F :
  T extends Pitch.F ? Pitch.FS :
  T extends Pitch.FS ? Pitch.G :
  T extends Pitch.G ? Pitch.GS :
  T extends Pitch.GS ? Pitch.A : Pitch.A;

export type DecreaseSemitone<T extends Pitch> =
  T extends Pitch.A ? Pitch.GS :
  T extends Pitch.AS ? Pitch.A :
  T extends Pitch.B ? Pitch.AS :
  T extends Pitch.C ? Pitch.B :
  T extends Pitch.CS ? Pitch.C :
  T extends Pitch.D ? Pitch.CS :
  T extends Pitch.DS ? Pitch.D :
  T extends Pitch.E ? Pitch.DS :
  T extends Pitch.F ? Pitch.E :
  T extends Pitch.FS ? Pitch.F :
  T extends Pitch.G ? Pitch.FS :
  T extends Pitch.GS ? Pitch.G : never;

/** Hacky type used to decrement a generic number. */
type Decr = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/** Recursively decreases a pitch N semitones. */
type DecreaseSemitones<T extends Pitch, N extends number> = N extends 0 ? N : DecreaseSemitone<DecreaseSemitones<T, Decr[N]>>;
/** Recursively increases a pitch N semitones. */
type IncreaseSemitones<T extends Pitch, N extends number> = N extends 0 ? N : IncreaseSemitone<IncreaseSemitones<T, Decr[N]>>;

type MajorChord<T extends Pitch> = [T, IncreaseSemitones<T, 4>, IncreaseSemitones<T, 7>];
type Major7Chord<T extends Pitch> = [T, IncreaseSemitones<T, 4>, IncreaseSemitones<T, 7>, DecreaseSemitones<T, 1>]

type AMajor = MajorChord<Pitch.A>;
type AMajor7 = Major7Chord<Pitch.A>;
const CHROMATIC_SCALE = [
  Pitch.A,
  Pitch.AS,
  Pitch.B,
  Pitch.C,
  Pitch.CS,
  Pitch.D,
  Pitch.DS,
  Pitch.E,
  Pitch.F,
  Pitch.FS,
  Pitch.G,
  Pitch.GS
];


class Note<P extends Pitch> {
  constructor(
    private pitch: P,
    private octave: number) {
  }
}

type NotesFor<T extends Pitch[]> = T extends Array<infer U> ? U extends Pitch ? Note<U> : never : never;

const aMaj7Notes: Array<NotesFor<AMajor7>> = [
  new Note(Pitch.A, /* octave= */ 0),
  new Note(Pitch.CS, /* octave= */ 0),
  new Note(Pitch.E, /* octave= */ 0),
  new Note(Pitch.GS, /* octave= */ 0),

  // can add duplicate pitches in other octaves
  new Note(Pitch.GS, /* octave= */ 1)
];
// // Can't use amaj7 notes where only amaj are expected, breaks types.
// const aMajNotes: Array<NotesFor<AMajor>> = aMaj7Notes;


function twoOctaves<T extends Pitch[]>(scale: [...T]): T extends Array<infer U> ? Array<U> : never {
  return scale.concat(scale.map(pitch => pitch + 12)) as any;
}

export const BLUES_MINOR = [Pitch.C, Pitch.DS, Pitch.F, Pitch.FS, Pitch.G, Pitch.AS];
export const PENTATONIC_A_MINOR = [Pitch.E, Pitch.G, Pitch.A, Pitch.B, Pitch.D];
export const PENTATONIC_A_MINOR_2_OCTAVES = twoOctaves(PENTATONIC_A_MINOR);
export const BLUES_MINOR_2_OCTAVES = twoOctaves(BLUES_MINOR);
export const CHROMATIC_SCALE_TWO_OCTAVES = twoOctaves(CHROMATIC_SCALE);


export const NAME_TO_SCALE: { [key: string]: Pitch[] } = {
  "blues": BLUES_MINOR,
  "blues2": BLUES_MINOR_2_OCTAVES,
  "pent": PENTATONIC_A_MINOR,
  "pent2": PENTATONIC_A_MINOR_2_OCTAVES,
  "chrom": CHROMATIC_SCALE
}

interface Sound<P extends Pitch> {
  getDuration(): number;
  note: Note<P>
}