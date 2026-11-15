// s1115a A2. eslint-plugin-obsidianmd 0.6.0 regex-lookbehind (iOS before 16.4 has no lookbehind). Equivalence of the
// rewrite with the old lookbehind expression, on a table of edge cases and on seeded fuzz input (as lanes/R1-A1/eq/eq.mts).
import { describe, expect, it } from 'vitest';
import { IMAGINARY, INDEX_N, hasImaginary } from '../src/solve';
import { replaceAlts } from '../src/no-lookbehind';

let seed = 1115;
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
const gen = (alpha: string[], len: number) => Array.from({ length: Math.floor(rnd() * len) }, () => alpha[Math.floor(rnd() * alpha.length)]).join('');
const FUZZ = 20000;
const j = (x: unknown) => JSON.stringify(x);
/** Runs old and new on each input. Returns the inputs where they differ. */
function differ(inputs: string[], oldF: (s: string) => unknown, newF: (s: string) => unknown): string[] {
	return inputs.filter((s) => j(oldF(s)) !== j(newF(s)));
}
const fuzz = (alpha: string[], len: number) => Array.from({ length: FUZZ }, () => gen(alpha, len));

const oldIndex = (s: string) => s.replace(/(?<![\w$])_n(?![\w$])/g, 'n_0');
const newIndex = (s: string) => replaceAlts(s, INDEX_N, () => 'n_0');
const oldHas = (s: string) => /(?<![A-Za-z0-9_])i(?![A-Za-z0-9_(])/.test(s);
const oldStrip = (s: string) => s.replace(/(?<![A-Za-z0-9_])i(?![A-Za-z0-9_(])/g, '');
const newStrip = (s: string) => replaceAlts(s, IMAGINARY, () => '');
const TABLE = ['', '_n', 'x_n', '$_n', '_n_n', '2*_n', '_nx', '(_n)', 'i', '2*i', 'pi', 'sin(i)', 'i(', 'i_', '_i', '3i', 'i+i', 'ii', 'x*i^2'];

describe('_n index without lookbehind', () => {
	it('matches the old expression on the table', () => {
		expect(differ(TABLE, oldIndex, newIndex)).toEqual([]);
	});
	it('matches the old expression on fuzz input', () => {
		expect(differ(fuzz(['_n', '_', 'n', 'x', '$', ' ', '*', '(', '1'], 20), oldIndex, newIndex)).toEqual([]);
	});
});

describe('imaginary unit test without lookbehind', () => {
	it('matches the old expression on the table', () => {
		expect(differ(TABLE, oldHas, hasImaginary)).toEqual([]);
	});
	it('matches the old expression on fuzz input', () => {
		expect(differ(fuzz(['i', 'p', '_', '1', '(', ')', ' ', '*', 'I'], 16), oldHas, hasImaginary)).toEqual([]);
	});
});

describe('imaginary unit strip without lookbehind', () => {
	it('matches the old expression on the table', () => {
		expect(differ(TABLE, oldStrip, newStrip)).toEqual([]);
	});
	it('matches the old expression on fuzz input', () => {
		expect(differ(fuzz(['i', 'p', '_', '1', '(', ')', ' ', '*', 'I'], 16), oldStrip, newStrip)).toEqual([]);
	});
});
