var util = require("./util.js");
/*
generateMaze object guide

x, y, and z: Coordinate size of maze.
maxPathLength: Maximum length of individual paths generated.
directionalWeights: Weights for directions of paths (low "up" weight for example means fewer paths will go upwards).

*/
var connections = [
    { x: 1, y: 0, z: 0},
    { x: -1, y: 0, z: 0},
    { x: 0, y: 1, z: 0},
    { x: 0, y: -1, z: 0},
    { x: 0, y: 0, z: 1},
    { x: 0, y: 0, z: -1}
];

exports.generateMaze = function (params) {
    var xSize = params.x;
    var ySize = params.y;
    var zSize = params.z;
    var cubesLeft = xSize * ySize * zSize;
    var mazeData = [];
    for (var i = 0; cubesLeft > i; i++) {
        mazeData.push({
            filled: false,
            paths: [{ x: 0, y: 0, z: 0 }]
        });
    }
    mazeData[Math.floor(xSize / 2) + xSize * Math.floor(ySize / 2) + xSize * ySize * Math.floor(zSize / 2)].filled = true;
    cubesLeft -= 1;
    var maze = new util.grid3D(xSize, ySize, zSize, mazeData);
    while (cubesLeft > 0) {
        var validBranchIndexes = [[], [], [], [], [], []];
        maze.forAll((x, y, z, index, cube) => {
            if (cube.filled) {
                var adjacents = maze.getAdjacents(x, y, z);
                var unfilledAdjacents = [];
                for (var i = 0; 6 > i; i++) {
                    if (adjacents[i] && !adjacents[i].filled) {
                        unfilledAdjacents.push(i);
                    }
                }
                for (var i = 0; unfilledAdjacents.length > i; i++) {
                    validBranchIndexes[unfilledAdjacents[i]].push({
                        index: index,
                        coords: { x: x, y: y, z: z },
                        connectionType: unfilledAdjacents[i]
                    });
                }
            }
        });
        var directionChoice = [];
        while (directionChoice.length == 0) {
            directionChoice = util.weightedChoice(validBranchIndexes, params.directionalWeights);
        }
        var chosenStart = util.randMember(directionChoice);
        var position = chosenStart.coords;
        var next = connections[chosenStart.connectionType];
        for (var i = 0; params.maxPathLength > i; i++) {
            maze.contents[maze.getIndex(position.x, position.y, position.z)].paths.push({ x: next.x, y: next.y, z: next.z });
            position.x += next.x;
            position.y += next.y;
            position.z += next.z;
            maze.contents[maze.getIndex(position.x, position.y, position.z)].paths.push({ x: -next.x, y: -next.y, z: -next.z });
            maze.contents[maze.getIndex(position.x, position.y, position.z)].filled = true;
            cubesLeft -= 1;
            var adjacents = maze.getAdjacents(position.x, position.y, position.z);
            var unfilledAdjacents = false;
            for (var j = 0; 6 > j; j++) {
                if (adjacents[j] && !adjacents[j].filled) {
                    unfilledAdjacents = true;
                }
            }
            if (unfilledAdjacents) {
                var nextChoice = -1;
                while (!(adjacents[nextChoice] && !adjacents[nextChoice].filled)) {
                    nextChoice = util.weightedChoice([0, 1, 2, 3, 4, 5], params.directionalWeights);
                }
                next = connections[nextChoice];
            } else {
                i = Infinity;
            }
        }
    }
    return maze;
}