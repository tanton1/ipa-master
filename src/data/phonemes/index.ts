import type { Phoneme } from '../types';
import { VOWELS } from './vowels';
import { CONSONANTS_A } from './consonants-a';
import { CONSONANTS_B } from './consonants-b';

export const PHONEMES: Phoneme[] = [...VOWELS, ...CONSONANTS_A, ...CONSONANTS_B];

const BY_ID: Record<string, Phoneme> = {};
for (const p of PHONEMES) BY_ID[p.id] = p;

export function getPhoneme(id: string): Phoneme | undefined {
  return BY_ID[id];
}

export const MONOPHTHONGS = VOWELS.filter((p) => p.type === 'vowel');
export const DIPHTHONGS = VOWELS.filter((p) => p.type === 'diphthong');
export const CONSONANTS = [...CONSONANTS_A, ...CONSONANTS_B];
