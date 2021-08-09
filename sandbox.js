var nbtIO = require("./lib/read-write-nbt.js");
var mcg = require("./lib/mc-grid.js");
var util = require("./lib/util.js");
var fs = require("fs");
var util = require("./lib/util.js");
var maze = require("./lib/maze.js");
var mcmaze = require("./lib/mc-maze.js");
var mcd = require("./lib/mc-details.js");
var TAU = util.TAU;





//create grid
var maze = maze.generateMaze({
    x: 12,
    y: 12,
    z: 12,
    maxPathLength: 16,
    directionalWeights: [4, 4, 1, 1, 4, 4]
});
var testGrid = mcmaze.mcMaze(maze, 7, new mcg.MCBLOCK("minecraft:stone_bricks"));

var floors = mcd.getFloors(testGrid, new mcg.MCBLOCK("minecraft:air"));

var walls = mcd.getWalls(testGrid, new mcg.MCBLOCK("minecraft:air"));

var ceilings = mcd.getCeilings(testGrid, new mcg.MCBLOCK("minecraft:air"));

var wallsAtFloors = mcd.getWallsAtFloors(testGrid, new mcg.MCBLOCK("minecraft:air"));

for (var i = 0; floors.length > i; i++) {
    testGrid.blocks[floors[i].index] = util.weightedChoice([
        new mcg.MCBLOCK("minecraft:air"),
        new mcg.MCBLOCK("minecraft:scaffolding"),
        new mcg.MCBLOCK("minecraft:redstone_wire"),
        new mcg.MCBLOCK("minecraft:skeleton_skull")
    ],
    [
        100,
        0.5,
        3,
        0.2
    ]);
}

for (var i = 0; walls.length > i; i++) {
    testGrid.blocks[walls[i].index] = util.weightedChoice([
        new mcg.MCBLOCK("minecraft:air"),
        new mcg.MCBLOCK("minecraft:cobweb")
    ],
    [
        100,
        3
    ]);
}

for (var i = 0; ceilings.length > i; i++) {
    testGrid.blocks[ceilings[i].index] = util.weightedChoice([
        new mcg.MCBLOCK("minecraft:air"),
        new mcg.MCBLOCK("minecraft:lantern", { hanging: "true" }),
        new mcg.MCBLOCK("minecraft:cobweb"),
        new mcg.MCBLOCK("minecraft:stone_brick_slab", { type: "top" })
    ],
    [
        100,
        2,
        4,
        5
    ]);
}

for (var i = 0; wallsAtFloors.length > i; i++) {
    testGrid.blocks[wallsAtFloors[i].index] = util.weightedChoice([
        new mcg.MCBLOCK("minecraft:air"),
        new mcg.MCBLOCK("minecraft:scaffolding")
    ],
    [
        100,
        10
    ]);
}

mcd.randomTripwireTraps(testGrid, new mcg.MCBLOCK("minecraft:stone_bricks"), wallsAtFloors, 1000);

testGrid.perBlock(function (x, y, z, index, block) {
    if (block && block.id == "minecraft:stone_bricks") {
        testGrid.blocks[index] = util.weightedChoice([
            new mcg.MCBLOCK("minecraft:stone_bricks"),
            new mcg.MCBLOCK("minecraft:cracked_stone_bricks"),
            new mcg.MCBLOCK("minecraft:mossy_stone_bricks"),
            new mcg.MCBLOCK("minecraft:chiseled_stone_bricks"),
        ],
        [
            3,
            3,
            2,
            1
        ]);
    }
});

//create structure blocks and save files
var splitNBT = testGrid.toStructureBlockablePartitions(14, "testchain");
nbtIO.structureBlockChain(splitNBT, "testchain");








