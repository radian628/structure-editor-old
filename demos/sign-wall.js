var nbtIO = require("./lib/read-write-nbt.js");
var mcg = require("./lib/mc-grid.js");
var util = require("./lib/util.js");
var fs = require("fs");
var util = require("./lib/util.js")
var TAU = util.TAU;



//create grid
var testGrid = new mcg.MCGRID(32, 192, 8);

var str = fs.readFileSync("forestclanadventures.txt").toString();
console.log(str);
str = str.replace(/"/g, "'");

str = str.replace(/\n/g, " ");
str = str.replace(/_/g, "");
var splitStr = str.split(" ");

var lengthAdjustedStrings = [""];

for (var i = 0; splitStr.length > i; i++) {
    var last = lengthAdjustedStrings.length - 1;
    if (lengthAdjustedStrings[last].length + splitStr[i].length > 12) {
        lengthAdjustedStrings.push(splitStr[i]);
    } else {
        lengthAdjustedStrings[last] += " " + splitStr[i];
    }
}

//do stuff here
for (var i = 0; 192 > i; i++) {
    for (var j = 0; 32 > j; j++) {
        testGrid.setBlock(j, i, 0, new mcg.MCBLOCK("minecraft:stone"));
    }
}
for (var i = 0; 192 > i; i++) {
    for (var j = 0; 32 > j; j++) {
        var myIndex = 4 * (j + (191 - i) * 32);
        var myNBT = {
            "type": "compound",
            "value": {
                "Text1": {
                    "type": "string",
                    "value": `{"text":"${lengthAdjustedStrings[myIndex] || " "}}`
                },
                "Text2": {
                    "type": "string",
                    "value": `{"text":"${lengthAdjustedStrings[myIndex + 1] || " "}"}`
                },
                "Text3": {
                    "type": "string",
                    "value": `{"text":"${lengthAdjustedStrings[myIndex + 2] || " "}"}`
                },
                "Text4": {
                    "type": "string",
                    "value": `{"text":"${lengthAdjustedStrings[myIndex + 3] || " "}"}`
                }
            }
        };
        testGrid.setBlock(j, i, 1, new mcg.MCBLOCK("minecraft:oak_wall_sign", { facing: "south", waterlogged: "false" }, myNBT));
    }
}






//create structure blocks and save files
var splitNBT = testGrid.toStructureBlockablePartitions(8, "testchain");
nbtIO.structureBlockChain(splitNBT, "testchain");






