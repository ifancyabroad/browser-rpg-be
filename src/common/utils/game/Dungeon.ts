import { IRoom, ILocation, IMapLocation } from "@common/types/map";
import { JunctionType, RoomState, RoomType } from "@common/utils/enums";

const LEFT: number[] = [-1, 0];
const RIGHT: number[] = [1, 0];
const UP: number[] = [0, -1];
const DOWN: number[] = [0, 1];

const UP_LEFT: number[] = [-1, -1];
const UP_RIGHT: number[] = [1, -1];
const DOWN_LEFT: number[] = [-1, 1];
const DOWN_RIGHT: number[] = [1, 1];

const DEFAULT_LEVEL: number = 0;
const DEFAULT_DIMENSIONS: number = 20;
const DEFAULT_MAX_TUNNELS: number = 50;
const DEFAULT_MAX_LENGTH: number = 8;
const DEFAULT_PADDING: number = 1;
const DEFAULT_ROOM_COUNTS: IRoomCounts = {
	battle: Math.floor(DEFAULT_DIMENSIONS / 2),
	treasure: Math.floor(DEFAULT_DIMENSIONS / 4),
	rest: Math.floor(DEFAULT_DIMENSIONS / 10),
};

interface IRoomCounts {
	battle: number;
	treasure: number;
	rest: number;
}

interface IDungeonConfig {
	level?: number;
	dimensions?: number;
	maxTunnels?: number;
	maxLength?: number;
	padding?: number;
	roomCounts?: Partial<IRoomCounts>;
}

interface IDungeon {
	createMap(): IRoom[][];
}

/**
 * The Dungeon class represents the dungeon generator.
 */
export class Dungeon implements IDungeon {
	private static ALL_DIRECTIONS: number[][] = [LEFT, RIGHT, UP, DOWN, UP_LEFT, UP_RIGHT, DOWN_LEFT, DOWN_RIGHT];
	private static VALID_DIRECTIONS: number[][] = [LEFT, RIGHT, UP, DOWN];
	private level: number = DEFAULT_LEVEL;
	private dimensions: number = DEFAULT_DIMENSIONS;
	private maxTunnels: number = DEFAULT_MAX_TUNNELS;
	private maxLength: number = DEFAULT_MAX_LENGTH;
	private padding: number = DEFAULT_PADDING;
	private map: RoomType[][] = [];
	private roomCounts: IRoomCounts = DEFAULT_ROOM_COUNTS;

	/**
	 * Constructor for the Dungeon class.
	 *
	 * @param {IDungeonConfig} config - Optional configuration object for dungeon settings.
	 */
	constructor(config?: IDungeonConfig) {
		if (config) {
			const { level, dimensions, maxTunnels, maxLength, padding, roomCounts } = config;
			this.level = level ?? DEFAULT_LEVEL;
			this.dimensions = dimensions ?? DEFAULT_DIMENSIONS;
			this.maxTunnels = maxTunnels ?? DEFAULT_MAX_TUNNELS;
			this.maxLength = maxLength ?? DEFAULT_MAX_LENGTH;
			this.padding = padding ?? DEFAULT_PADDING;

			if (roomCounts) {
				const { battle, treasure, rest } = roomCounts;
				this.roomCounts.battle = battle ?? DEFAULT_ROOM_COUNTS.battle;
				this.roomCounts.treasure = treasure ?? DEFAULT_ROOM_COUNTS.treasure;
				this.roomCounts.rest = rest ?? DEFAULT_ROOM_COUNTS.rest;
			}
		}
	}

	/**
	 * Creates a 2D array filled with the specified number.
	 *
	 * @param {number} num - The number to fill the array with.
	 * @return {number[][]} The created 2D array.
	 */
	private createArray(num: number): number[][] {
		const array: number[][] = [];
		for (let i = 0; i < this.dimensions; i++) {
			array.push([]);
			for (let j = 0; j < this.dimensions; j++) {
				array[i].push(num);
			}
		}
		return array;
	}

	/**
	 * Checks if the current position is at the edge of the map based on the specified direction and coordinates.
	 *
	 * @param {number[]} direction - The direction to check.
	 * @param {number} currentRow - The current row position.
	 * @param {number} currentColumn - The current column position.
	 * @return {boolean} True if the position is at the edge, false otherwise.
	 */
	private isAtEdge(direction: number[], currentRow: number, currentColumn: number): boolean {
		return (
			(currentRow === this.padding && direction[0] === -1) ||
			(currentColumn === this.padding && direction[1] === -1) ||
			(currentRow === this.dimensions - (this.padding + 1) && direction[0] === 1) ||
			(currentColumn === this.dimensions - (this.padding + 1) && direction[1] === 1)
		);
	}

	/**
	 * Checks if the current position is converging based on the surrounding corners in the map.
	 *
	 * @param {number[][]} map - The map of the dungeon.
	 * @param {number} currentRow - The current row position.
	 * @param {number} currentColumn - The current column position.
	 * @return {boolean} True if any corner is converging, false otherwise.
	 */
	private isConverging(currentRow: number, currentColumn: number): boolean {
		const corners = [
			[UP, RIGHT, UP_RIGHT],
			[UP, LEFT, UP_LEFT],
			[DOWN, RIGHT, DOWN_RIGHT],
			[DOWN, LEFT, DOWN_LEFT],
		];

		// if any corner is converging, return true
		return corners.some((corner) => {
			return corner
				.map((direction) => this.map[currentRow + direction[0]]?.[currentColumn + direction[1]])
				.every((value) => value);
		});
	}

	/**
	 * Checks if the current position is touching any tunnel in the map.
	 *
	 * @param {number[][]} map - The map of the dungeon.
	 * @param {number} currentRow - The current row position.
	 * @param {number} currentColumn - The current column position.
	 * @return {boolean} True if the position is touching a tunnel, false otherwise.
	 */
	private isTouchingTunnel(map: number[][], currentRow: number, currentColumn: number): boolean {
		return Dungeon.ALL_DIRECTIONS.some((direction) => {
			return map[currentRow + direction[0]]?.[currentColumn + direction[1]];
		});
	}

	/**
	 * Checks if the given direction is perpendicular to the last direction.
	 *
	 * @param {number[]} direction - The direction to check.
	 * @param {number[]} lastDirection - The last direction.
	 * @returns {boolean} True if the direction is perpendicular to the last direction, false otherwise.
	 */
	private isPerpendicularDirection(direction: number[], lastDirection: number[]): boolean {
		return (
			!lastDirection ||
			(direction[0] !== -lastDirection[0] && direction[0] !== lastDirection[0]) ||
			(direction[1] !== -lastDirection[1] && direction[1] !== lastDirection[1])
		);
	}

	/**
	 * Checks if the given direction is valid based on the current position and the map.
	 *
	 * @param {number[][]} map - The map of the dungeon.
	 * @param {number[]} direction - The direction to check.
	 * @param {number} currentRow - The current row position.
	 * @param {number} currentColumn - The current column position.
	 * @returns {boolean} True if the direction is valid, false otherwise.
	 */
	private isValidDirection(direction: number[], currentRow: number, currentColumn: number): boolean {
		return !this.isAtEdge(direction, currentRow, currentColumn) && !this.isConverging(currentRow, currentColumn);
	}

	/**
	 * Retrieves the type of junction at the given position in the map.
	 *
	 * @param {number} currentRow - The current row position.
	 * @param {number} currentColumn - The current column position.
	 * @returns {JuntionType} The type of junction.
	 */
	private getJunctionType(currentRow: number, currentColumn: number): JunctionType {
		const room = this.map[currentRow]?.[currentColumn];
		if (room !== RoomType.Empty) {
			return JunctionType.None;
		}

		const neighbors = Dungeon.VALID_DIRECTIONS.filter((direction) => {
			const room = this.map[currentRow + direction[0]]?.[currentColumn + direction[1]];
			const walls = [RoomType.None, RoomType.Wall];
			return room && !walls.includes(room);
		});

		if (neighbors.length === 1) {
			return JunctionType.End;
		}

		if (neighbors.length === 2) {
			const [first, second] = neighbors;
			const isCorner = first[0] !== second[0] && first[1] !== second[1];
			return isCorner ? JunctionType.Corner : JunctionType.Straight;
		}

		if (neighbors.length === 3) {
			return JunctionType.TJunction;
		}

		if (neighbors.length === 4) {
			return JunctionType.Cross;
		}

		return JunctionType.None;
	}

	/**
	 * Retrieves the locations of a specific junction type in the dungeon map.
	 *
	 * @param {JuntionType} type - The type of junction to search for.
	 * @return {ILocation[]} An array of locations of the specified junction type.
	 */
	getJunctionLocations(type: JunctionType): ILocation[] {
		const junctions: ILocation[] = [];
		this.map.forEach((row, rowIndex) => {
			row.forEach((_, columnIndex) => {
				if (this.getJunctionType(rowIndex, columnIndex) === type) {
					junctions.push({ x: columnIndex, y: rowIndex });
				}
			});
		});

		return junctions;
	}

	/**
	 * Retrieves the available locations for rooms with no junction type.
	 *
	 * @return {ILocation[]} The available locations for rooms with no junction type.
	 */
	get availableLocations(): ILocation[] {
		const junctions: ILocation[] = [];
		this.map.forEach((row, rowIndex) => {
			row.forEach((_, columnIndex) => {
				const room = this.map[rowIndex]?.[columnIndex];
				if (room === RoomType.Empty) {
					junctions.push({ x: columnIndex, y: rowIndex });
				}
			});
		});

		return junctions;
	}

	/**
	 * Retrieves a random location based on the given types of junctions.
	 *
	 * @param {JuntionType[]} types - The types of junctions to consider.
	 * @return {ILocation} A random location based on the specified junction types.
	 */
	private getRoomLocation(types: JunctionType[]): ILocation {
		for (const type of types) {
			const locations = this.getJunctionLocations(type);
			if (locations.length > 0) {
				return locations[Math.floor(Math.random() * locations.length)];
			}
		}

		return this.availableLocations[Math.floor(Math.random() * this.availableLocations.length)];
	}

	/**
	 * Retrieves the adjacent location based on the current position (x, y).
	 *
	 * @param {ILocation} location - x and y coordinates of the current position.
	 * @return {ILocation} The adjacent location based on the current position.
	 */
	private getAdjacentLocation({ x, y }: ILocation): ILocation | null {
		const directions = Dungeon.VALID_DIRECTIONS.filter((direction) => {
			const room = this.map[y + direction[0]]?.[x + direction[1]];
			return room === RoomType.Empty;
		});

		if (directions.length === 0) {
			return null;
		}

		const direction = directions[Math.floor(Math.random() * directions.length)];
		return { x: x + direction[1], y: y + direction[0] };
	}

	/**
	 * Maps a room based on the type and location to create a room object.
	 *
	 * @param {RoomType} type - The type of the room to be mapped.
	 * @param {IMapLocation} location - The location of the room on the map.
	 * @return {IRoom} The mapped room object containing location, type, state, and tile.
	 */
	private mapRoom(type: RoomType, location: IMapLocation): IRoom {
		const blockingRooms = [RoomType.Battle, RoomType.Boss, RoomType.None, RoomType.Wall];
		const state = blockingRooms.includes(type) ? RoomState.Blocking : RoomState.Idle;
		return { location, type, state };
	}

	/**
	 * Maps the entire level by iterating through each row and room to create a mapped level.
	 *
	 * @return {Array<Array<IRoom>>} The mapped level containing rooms with location, type, state, and tile.
	 */
	private mapLevel(): Array<Array<IRoom>> {
		return this.map.map((row, y) => row.map((room, x) => this.mapRoom(room, { level: this.level, y, x })));
	}

	/**
	 * Generates tunnels in the map.
	 * Travels through the map in a random direction until the maximum number of tunnels is reached or the map is fully traversed.
	 */
	private createTunnels() {
		// Choose a random starting position
		let currentRow = Math.floor(Math.random() * (this.dimensions - this.padding * 2)) + this.padding;
		let currentColumn = Math.floor(Math.random() * (this.dimensions - this.padding * 2)) + this.padding;

		// Keep track of the last traversed direction
		let lastDirection: number[] = [];

		// Keep track of the remaining tunnels and the maximum length of tunnels
		let currentTunnels = this.maxTunnels;

		// Generate the map
		while (currentTunnels && this.dimensions && this.maxLength) {
			// Find possible directions to travel
			const perpendicularDirections = Dungeon.VALID_DIRECTIONS.filter((direction) =>
				this.isPerpendicularDirection(direction, lastDirection),
			);

			// Filter out invalid directions
			let possibleDirections = perpendicularDirections.filter((direction) =>
				this.isValidDirection(direction, currentRow, currentColumn),
			);

			// If there are no possible directions, backtrack
			while (!possibleDirections.length) {
				currentRow -= lastDirection[0];
				currentColumn -= lastDirection[1];
				possibleDirections = perpendicularDirections.filter((direction) =>
					this.isValidDirection(direction, currentRow, currentColumn),
				);
			}

			// Choose a random direction to travel
			const randomDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];

			// Choose a random length for the tunnel
			const randomLength = Math.ceil(Math.random() * this.maxLength);

			// Traverse the tunnel
			let tunnelLength = 0;
			while (tunnelLength < randomLength) {
				// If the tunnel is at an edge or is converging, end the tunnel
				if (!this.isValidDirection(randomDirection, currentRow, currentColumn)) {
					break;
				} else {
					// Mark the current position as a tunnel
					this.map[currentRow][currentColumn] = RoomType.Empty;
					currentRow += randomDirection[0];
					currentColumn += randomDirection[1];
					tunnelLength++;
				}
			}

			// If the tunnel was successfully traversed, update the last direction and decrement the remaining tunnels
			if (tunnelLength) {
				lastDirection = randomDirection;
				currentTunnels--;
			}
		}
	}

	/**
	 * Creates walls in the map by checking if the current position is touching a tunnel
	 * and the position is empty.
	 *
	 * @remarks
	 * This method creates a deep copy of the map to avoid mutating the original map.
	 */
	private createWalls() {
		// Create a deep copy of the map
		const clonedMap = structuredClone(this.map);

		// Add walls to the map
		clonedMap.forEach((row, rowIndex) => {
			row.forEach((_, columnIndex) => {
				// Check if the current position is empty
				const isEmpty = this.map[rowIndex][columnIndex] === RoomType.None;

				// Check if the current position is touching a tunnel
				const isTouchingTunnel = this.isTouchingTunnel(clonedMap, rowIndex, columnIndex);

				// If the current position is touching a tunnel and empty, mark it as a wall
				if (isTouchingTunnel && isEmpty) {
					this.map[rowIndex][columnIndex] = RoomType.Wall;
				}
			});
		});
	}

	/**
	 * Place rooms in the dungeon map.
	 * @return {void} None
	 */
	private createRooms(): void {
		// Place exit
		const exitLocation = this.getRoomLocation([JunctionType.End]);
		this.map[exitLocation.y][exitLocation.x] = RoomType.Exit;

		// Place entrance
		const entranceLocation = this.getRoomLocation([JunctionType.End]);
		this.map[entranceLocation.y][entranceLocation.x] = RoomType.Entrance;

		// Place rest rooms
		for (let i = 0; i < this.roomCounts.rest; i++) {
			const roomLocation = this.getRoomLocation([JunctionType.End, JunctionType.Corner]);
			this.map[roomLocation.y][roomLocation.x] = RoomType.Rest;
		}

		// Place treasure rooms
		for (let i = 0; i < this.roomCounts.treasure; i++) {
			const roomLocation = this.getRoomLocation([JunctionType.End, JunctionType.Corner]);
			this.map[roomLocation.y][roomLocation.x] = RoomType.Treasure;
		}

		// Place shop room
		const shopLocation = this.getRoomLocation([JunctionType.End, JunctionType.Corner]);
		this.map[shopLocation.y][shopLocation.x] = RoomType.Shop;

		// Place boss room
		const bossLocation =
			this.getAdjacentLocation(exitLocation) ?? this.getRoomLocation([JunctionType.End, JunctionType.Corner]);
		this.map[bossLocation.y][bossLocation.x] = RoomType.Boss;

		// Place battle rooms
		for (let i = 0; i < this.roomCounts.battle; i++) {
			const roomLocation = this.getRoomLocation([JunctionType.Cross, JunctionType.TJunction]);
			this.map[roomLocation.y][roomLocation.x] = RoomType.Battle;
		}
	}

	/**
	 * Creates the map by initializing, creating tunnels, walls, and rooms.
	 *
	 * @return {IRoom[][]} The generated map.
	 */
	public createMap(): IRoom[][] {
		// Initialize the map with zeros
		this.map = this.createArray(RoomType.None);

		// Create the tunnels
		this.createTunnels();

		// Create the walls
		this.createWalls();

		// Create the rooms
		this.createRooms();

		return this.mapLevel();
	}
}
