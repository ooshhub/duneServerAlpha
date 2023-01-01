import { PlayerDirectoryServiceConfig, PlayerDirectoryServiceContract } from "../serviceProviderRegistry/contracts/PlayerDirectoryServiceContract.js";

interface PlayerRecord {

	playerName: string;
	playerId: string;
	houseId: string|null;
	isHost: boolean;
	isHuman: boolean;
	[key: string]: any;

}



interface HouseRecord {

	houseName: string;
	houseId: string;
	rulesetName: string;
	playerId: string;
	[key: string]: any;

}

export class PlayerListTransformer {
	
	static transformForDirectory(serverPlayerList: GenericJson): { [key: string]: PlayerRecord } {
		const output: { [key: string]: PlayerRecord } = this.transformForPlayers(serverPlayerList);
		for (const player in serverPlayerList) {
			Object.assign(output[player], {
				socketId: serverPlayerList[player].socketId,
			});
		}
		return output;
	}

	static transformForPlayers(serverPlayerList: GenericJson): GenericJson {
		const output: { [key: string]: PlayerRecord } = {};
		for (const player in serverPlayerList) {
			output[player] = {
				playerName: serverPlayerList[player].playerName,
				playerId: serverPlayerList[player].playerId,
				houseId: serverPlayerList[player].houseId,
				isHost: serverPlayerList[player].isHost,
				isHuman: serverPlayerList[player].isHuman ?? true,
			};
		}
		return output;
	}
}

export class PlayerDirectoryService implements PlayerDirectoryServiceContract {

	#playerList: { [key: string]: PlayerRecord } = {};
	#houseList: { [key: string]: HouseRecord } = {};
	#name;

	constructor(playerDirectoryConfig: PlayerDirectoryServiceConfig) {
		this.#name = playerDirectoryConfig.name ?? 'PlayerDirectoryService';
	}

	/**
	 * Update the player list - call from SocketServer whenever required
	 * @param serverPlayerList 
	 */
	#updatePlayerList(serverPlayerList: { [key: string]: PlayerRecord }) {
		const playerTransform = PlayerListTransformer.transformForDirectory(serverPlayerList);
		for (const player in playerTransform) {
			if (this.#playerList[player]) this.#updatePlayer(playerTransform[player]);
			else this.#playerList[player] = playerTransform[player];
		}
		for (const existingPlayer in this.#playerList) {
			if (!Reflect.has(playerTransform, existingPlayer)) delete this.#playerList[existingPlayer];
		}
	}
	#updatePlayer(playerUpdate: PlayerRecord) {
		const currentPlayer = this.#playerList[playerUpdate.playerId];
		for (const [ prop, value ] of Object.entries(currentPlayer)) {
			if (playerUpdate[prop] && playerUpdate[prop] !== value) currentPlayer[prop] = playerUpdate[prop];
		}
	}

	/**
	 * Update the House list from GameCore
	 * @param transformedHouseList 
	 */
	#updateHouseList(transformedHouseList: { [key: string]: HouseRecord }) {
		for (const house in transformedHouseList) {
			if (this.#houseList[house]) this.#updateHouse(transformedHouseList[house]);
			else this.#houseList[house] = transformedHouseList[house];
		}
	}
	#updateHouse(houseUpdate: HouseRecord) {
		const currentHouse = this.#houseList[houseUpdate.houseId];
		for (const [ prop, value ] of Object.entries(currentHouse)) {
			if (houseUpdate[prop] && houseUpdate[prop] !== value) currentHouse[prop] = houseUpdate[prop];
		}
		if (this.#playerList[houseUpdate.playerId]) {
			this.#playerList[houseUpdate.playerId].houseId = houseUpdate.houseId;
		} 
	}

	/**
	 * Grab a playerId from a houseId (gamecore => server => player)
	 * @param houseId 
	 * @returns 
	 */
	getPlayerIdFromHouseId(houseId: string): string|null {
		return (houseId in this.#houseList)
			? this.#houseList[houseId].playerId
			: null
	}

	/**
	 * Grab a houseId from a playerId (player => server => gamecore)
	 * @param playerId 
	 * @returns 
	 */
	getHouseIdFromPlayerId(playerId: string): string|null {
		return (playerId in this.#playerList)
		? this.#playerList[playerId].houseId
		: null
	}

	/**
	 * Check an array of ids, convert to playerIds if they aren't already
	 * @param mixedIds 
	 * @returns 
	 */
	convertToPlayerIds(mixedIds: string[]): string[] {
		return mixedIds.reduce((output: string[], id: string) => {
			const newId = this.#playerList[id]
				? id
				: this.getPlayerIdFromHouseId(id);
			return newId ? [ newId, ...output ] : output;
		}, []);
	}

}