import { DuneError } from "../errors/DuneError";
import { ERROR } from "../errors/errors";

export class Helpers {
	constructor() { throw new DuneError(ERROR.NO_INSTANTIATION, [ this.constructor.name ]) }

	/**
	 * @param inp 
	 * @returns 
	 */
	static toArray(inp: any): any[] { return Array.isArray(inp) ? inp : [inp] }

	/**
	 * Convert any type to a string. Truncate if required.
	 * @param input 
	 * @param truncateTo 
	 * @returns 
	 */
	static stringifyMixed(input: any, truncateTo = 128) {
		const msg:string = (Array.isArray(input))
		? input.join(', ')
		: typeof(input) === 'object'
			? input.message
				? input.message
				: JSON.stringify(input)
		: typeof(input) === 'string'
			? input
		: `${input}`;
		return (truncateTo > 32 && msg.length > truncateTo)
			? `${msg.slice(0, truncateTo - 10)} ... ${msg.slice(-10)}`
			: msg;
	}

	/**
	 * Array filter with mutate
	 * @param inputArray 
	 * @param predicateFunction 
	 */
	static filterInPlace(inputArray: any[], predicateFunction: (value: any, index?: number) => boolean): void {
		for (let i = inputArray.length; i > 0; i--) {
			if (!predicateFunction(inputArray[i - 1], i - 1)) inputArray.splice(i - 1, 1);
		}
	}

	/**
	 * Async timeout in milliseconds
	 * @param milliseconds 
	 * @returns 
	 */
	static async timeout(milliseconds: number): Promise<boolean> {
		return new Promise<boolean>(res => setTimeout(() => res(false), milliseconds));
	}

	/**
	 * Generate a random number within a range, accounting for modulo bias
	 * @param range 
	 * @param depth 
	 * @returns 
	 */
	static randomInt(range=100, depth=32): number {
    const max = range * 2**depth;
    let random;
    do { random = Math.floor(Math.random() * 2**depth) }
    while (random >= max);
    return random % range;
  }

	/**
	 * Generate a 20-char firebase style UID
	 * Overload 1 (no args) - a single ID
	 * Overload 2 (int) - array of simultaneous IDs, guaranteed to not collide
	 * 
	 * @param {number|null} numIds 
	 */
	static generateUID(numIds?: null): string;
	static generateUID(numIds: number): string[];
	
  static generateUID(numIds?: number|null): string|string[] {
    let output: string[] = [], key = '';
    const chars = '-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_';
    let ts = Date.now();
    for (let i = 8; i > 0; i--) { output[i] = chars.charAt(ts % 64), ts = Math.floor(ts / 64) }
    for (let j = 0; j < 12; j++) { output.push(chars.charAt(this.randomInt(64))) }
    key = output.join('');
    if (numIds && numIds >= 1) {
      numIds = Math.min(32, numIds);
      output = Array(numIds).fill(null).map((_v,i) => {
        const lastChar = chars[(chars.indexOf(key[19])+i)%64];
        return `${key.slice(0,18)}${lastChar}`;
      });
      return output;
    }
		else return key;
  }

}