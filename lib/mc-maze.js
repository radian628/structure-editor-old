var mcg = require("./mc-grid.js");
var util = require("./util.js");

exports.mcMaze = function (maze, mazeSize, material) {
    var xBlocks = maze.xSize * mazeSize;
    var yBlocks = maze.ySize * mazeSize;
    var zBlocks = maze.zSize * mazeSize;
    var blocks = [];
    for (var i = 0; xBlocks * yBlocks * zBlocks > i; i++) {
        blocks.push(material)
    }
    
    var mazeGrid = new mcg.MCGRID(xBlocks, yBlocks, zBlocks, blocks);
    var replaceGrid = new mcg.MCGRID(mazeSize - 2, mazeSize - 2, mazeSize - 2, false);
    maze.forAll((x, y, z, index, cube) => {
        for (var i = 0; cube.paths.length > i; i++) {
            mazeGrid.putSubCuboid(replaceGrid, cube.paths[i].x + x * mazeSize + 1, cube.paths[i].y + y * mazeSize + 1, cube.paths[i].z + z * mazeSize + 1);
            var goesUp = util.indexOfProp(cube.paths, "y", 1) != -1;
            var goesDown = util.indexOfProp(cube.paths, "y", -1) != -1;
        }
        var ladderStart = goesDown ? 0 : 1;
        var ladderHeight = mazeSize - 2 + (goesUp ? 1 : 0) + (goesDown ? 1 : 0);
        if (goesUp || goesDown) {
            for (var j = ladderStart; ladderHeight + ladderStart > j; j++) {
                mazeGrid.blocks[mazeGrid.getIndex(x * mazeSize + 1, y * mazeSize + j, z * mazeSize + 1)] = material;
                mazeGrid.blocks[mazeGrid.getIndex(x * mazeSize + 1, y * mazeSize + j, z * mazeSize + 2)] = new mcg.MCBLOCK("minecraft:ladder", { facing: "south" });
                mazeGrid.blocks[mazeGrid.getIndex(x * mazeSize + 2, y * mazeSize + j, z * mazeSize + 1)] = new mcg.MCBLOCK("minecraft:ladder", { facing: "east" });
                mazeGrid.blocks[mazeGrid.getIndex((x + 1) * mazeSize - 2, y * mazeSize + j, (z + 1) * mazeSize - 2)] = material;
                mazeGrid.blocks[mazeGrid.getIndex((x + 1) * mazeSize - 2, y * mazeSize + j, (z + 1) * mazeSize - 3)] = new mcg.MCBLOCK("minecraft:ladder", { facing: "north" });
                mazeGrid.blocks[mazeGrid.getIndex((x + 1) * mazeSize - 3, y * mazeSize + j, (z + 1) * mazeSize - 2)] = new mcg.MCBLOCK("minecraft:ladder", { facing: "west" });
            }
        }
    });
    return mazeGrid;
}