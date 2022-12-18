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

}

const arr = [1,2,3,4,5,6];

Helpers.filterInPlace(arr, v => v !== 5);

console.log(arr);