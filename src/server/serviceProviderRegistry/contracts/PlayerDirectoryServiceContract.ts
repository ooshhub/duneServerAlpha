export type PlayerDirectoryServiceConfig = {
	name: string,
}

export interface PlayerDirectoryServiceContract {
	getPlayerIdFromHouseId: (houseId: string) => string|null;
	getHouseIdFromPlayerId: (playerId: string) => string|null;
	convertToPlayerIds: (mixedIds: string[]) => string[];
}