var nbtIO = require("../lib/read-write-nbt.js");
var mcg = require("../lib/mc-grid.js");
var util = require("../lib/util.js");
var fs = require("fs");
var util = require("../lib/util.js")
var TAU = util.TAU;
var testNBT = require("./output2.json");

// nbtIO.writeNBTToFile(testNBT, "output", function () {
//     console.log("Success!")
// });

// nbtIO.readNBTFromFile("./test/test.nbt", function (data) {
//     fs.writeFileSync("output.json", JSON.stringify(data));

//     var testGrid = new mcg.MCGRID(3, 3, 3, new Array(27));
//     for (var i = 0; 27 > i; i++) {
//         testGrid.blocks[i] = (i % 2) ? new mcg.MCBLOCK("minecraft:stone") : new mcg.MCBLOCK("minecraft:air");
//     }
//     var formattedNBT = testGrid.toFormattedNBT();

//     fs.writeFileSync("output2.json", JSON.stringify(formattedNBT));
//     nbtIO.writeNBTToFile(formattedNBT, "output.nbt", function () {
//         console.log("Success!")
//     });
// });








// var testGrid = new mcg.MCGRID(40, 20, 40, new Array(32000));
// testGrid.perBlock(function (x, y, z, index, block) {
//     testGrid.blocks[index] = new mcg.MCBLOCK("minecraft:air");
// })
// for (var i = 0; 1600 > i; i++) {
//     var value = Math.sin(Math.hypot((i % 40) - 20, Math.floor(i / 40) - 20) * 0.3) * 6;
//     testGrid.setBlock(i % 40, Math.floor(value) + 10, Math.floor(i / 40), new mcg.MCBLOCK("minecraft:stone"));
// }

// var splitNBT = testGrid.toStructureBlockablePartitions(5, "testchain");
// fs.writeFileSync("output2.json", JSON.stringify(splitNBT[7]));
// nbtIO.structureBlockChain(splitNBT, "testchain");





//create grid
var testGrid = new mcg.MCGRID(140, 140, 140, new Array(140 * 140 * 140));
testGrid.perBlock(function (x, y, z, index, block) {
    testGrid.blocks[index] = new mcg.MCBLOCK("minecraft:air");
})

//do calculations
var points4D = [];
var projectedPoints = [];
for (var i = 0; 10 > i; i++) {
    var offset = i * 0.2 - 1;
    for (var j = 0; 1000 > j; j++) {
        var dir = j / 1000 * TAU;
        var circle1 = Math.sqrt(Math.pow(Math.cos(dir), 2) - offset * offset) * Math.sign(Math.cos(dir)); 
        var circle2 = Math.sqrt(Math.pow(Math.sin(dir), 2) - offset * offset) * Math.sign(Math.sin(dir)); 
        points4D.push({
            w: circle1,
            x: circle2,
            y: offset,
            z: 0
        });
        points4D.push({
            w: circle1,
            x: circle2,
            y: offset,
            z: 0
        });

        points4D.push({
            w: circle1,
            y: circle2,
            z: offset,
            x: 0
        });
        points4D.push({
            w: circle1,
            y: circle2,
            x: offset,
            z: 0
        });

        points4D.push({
            w: circle1,
            z: circle2,
            y: offset,
            x: 0
        });
        points4D.push({
            w: circle1,
            z: circle2,
            x: offset,
            y: 0
        });



        points4D.push({
            x: circle1,
            y: circle2,
            w: offset,
            z: 0
        });
        points4D.push({
            x: circle1,
            y: circle2,
            z: offset,
            w: 0
        });

        points4D.push({
            x: circle1,
            z: circle2,
            w: offset,
            y: 0
        });
        points4D.push({
            x: circle1,
            z: circle2,
            y: offset,
            w: 0
        });



        points4D.push({
            y: circle1,
            z: circle2,
            x: offset,
            w: 0
        });
        points4D.push({
            y: circle1,
            z: circle2,
            w: offset,
            x: 0
        });
    }
}

for (var i = 0; points4D.length > i; i++) {
    points4D[i] = {
        w: points4D[i].w + 1.2,
        x: points4D[i].x + 0,
        y: points4D[i].y + 0,
        z: points4D[i].z + 0
    };
    var size = 40;
    projectedPoints.push({
        x: size * points4D[i].x / points4D[i].w + 70,
        y: size * points4D[i].y / points4D[i].w + 70,
        z: size * points4D[i].z / points4D[i].w + 70
    });
}

for (var i = 0; projectedPoints.length > i; i++) {
    var pt = projectedPoints[i];
    testGrid.setBlock(Math.floor(pt.x), Math.floor(pt.y), Math.floor(pt.z), new mcg.MCBLOCK("minecraft:stone"));
}


//create structure blocks and save files
var splitNBT = testGrid.toStructureBlockablePartitions(20, "testchain");
fs.writeFileSync("output2.json", JSON.stringify(splitNBT[7]));
nbtIO.structureBlockChain(splitNBT, "testchain");









// var formattedNBT = testGrid.toFormattedNBT();

// fs.writeFileSync("output2.json", JSON.stringify(formattedNBT));
// nbtIO.writeNBTToFile(util.deepCopy(formattedNBT), "farting-dog2", function () {
//     console.log("Success!");
// });

//fs.readFile("output2.json", function (err, data) {
//     nbtIO.writeNBTToFile(JSON.parse(data), "willthiswork", function () {});
// });




// nbtIO.readNBTFromFile("fuck.nbt", function (data) {
//     fs.writeFileSync("output3.json", JSON.stringify(data));
// });