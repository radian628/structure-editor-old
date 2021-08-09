var util = require("./util.js");
var mcg = require("./mc-grid.js");

exports.getFloors = function (grid, airEquiv) {
    var floors = [];
    grid.perBlock((x, y, z, index, block) => {
        var adjacents = grid.getAdjacents(x, y, z);
        if (block && block.id == airEquiv.id && adjacents[3].id != airEquiv.id) {
            floors.push({ x: x, y: y, z: z, index: index });
        }
    });
    return floors;
}

exports.getWalls = function (grid, airEquiv) {
    var walls = [];
    grid.perBlock((x, y, z, index, block) => {
        var adjacents = grid.getAdjacents(x, y, z);
        if (block && block.id == airEquiv.id && ((adjacents[0] && adjacents[0].id != airEquiv.id) || (adjacents[1] && adjacents[1].id != airEquiv.id) || (adjacents[4] && adjacents[4].id != airEquiv.id) || (adjacents[5] && adjacents[5].id != airEquiv.id))) {
            walls.push({ x: x, y: y, z: z, index: index, east: (adjacents[0] && adjacents[0].id != airEquiv.id), west: (adjacents[1] && adjacents[1].id != airEquiv.id), south: (adjacents[4] && adjacents[4].id != airEquiv.id), north: (adjacents[5] && adjacents[5].id != airEquiv.id) });
        }
    });
    return walls;
}

exports.getCeilings = function (grid, airEquiv) {
    var ceilings = [];
    grid.perBlock((x, y, z, index, block) => {
        var adjacents = grid.getAdjacents(x, y, z);
        if (block && block.id == airEquiv.id && adjacents[2].id != airEquiv.id) {
            ceilings.push({ x: x, y: y, z: z, index: index });
        }
    });
    return ceilings;
}

exports.getWallsAtFloors = function (grid, airEquiv) {
    var tiles = exports.getFloors(grid, airEquiv).concat(exports.getWalls(grid, airEquiv)).map(e => { return e.index; });
    var doubleTiles = [];
    for (var i = 0; tiles.length > i; i++) {
        if (tiles.lastIndexOf(tiles[i]) != i) {
            doubleTiles.push(tiles[i]);
        }
    }
    return doubleTiles.map(e => {
        var coords = grid.getCoords(e);
        var x = coords.x;
        var y = coords.y;
        var z = coords.z;
        var adjacents = grid.getAdjacents(x, y, z);
        return { x: x, y: y, z: z, index: e, east: (adjacents[0] && adjacents[0].id != airEquiv.id), west: (adjacents[1] && adjacents[1].id != airEquiv.id), south: (adjacents[4] && adjacents[4].id != airEquiv.id), north: (adjacents[5] && adjacents[5].id != airEquiv.id) };
    })
}

var directions = {
    east: { x: 1, y: 0, z: 0, reverse: "west" },
    west: { x: -1, y: 0, z: 0, reverse: "east" },
    south: { x: 0, y: 0, z: 1, reverse: "north" },
    north: { x: 0, y: 0, z: -1, reverse: "south" }
};

var getDirection = ["east", "west", "up", "down", "south", "north"];

exports.randomTripwireTraps = function (grid, wallEquiv, wallsAtFloors, count) {
    if (!wallsAtFloors) {
        wallsAtFloors = exports.getWallsAtFloors(grid, { id: "minecraft:air" });
    }
    var eligibleSpawns = wallsAtFloors/*.filter(e => { 
        var availableDirections = ((e.east) ? 1 : 0) + ((e.west) ? 1 : 0) + ((e.north) ? 1 : 0) + ((e.south) ? 1 : 0);
        return grid.blocks[e.index].id == wallEquiv.id;
    });*/
    for (var i = 0; count > i; i++) {
        var trapSpawn = util.randMember(eligibleSpawns);
        var adjacents = grid.getAdjacents(trapSpawn.x, trapSpawn.y, trapSpawn.z);
        console.log("\n\n\n");
        for (var j = 0; adjacents.length > j; j++) {
            adjacents[j].index = j;
            console.log(j);
            console.log(adjacents[j]);
        }
        //TODO: fix this stupid weird mismatching bug thing
        console.log(adjacents);
        var eligibleAdjacents = [adjacents[0], adjacents[1], adjacents[4], adjacents[5]];/*.filter(e => { return e.id == wallEquiv.id; });*/
        if (eligibleAdjacents.length != 0) {
            var startDirection = util.randMember(eligibleAdjacents);
            var directionName = getDirection[startDirection.index];
            var directionVector = directions[directionName];
            grid.blocks[trapSpawn.index] = new mcg.MCBLOCK("minecraft:tripwire_hook", { facing: directionVector.reverse });
        }
    }
}