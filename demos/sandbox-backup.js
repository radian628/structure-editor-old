var nbtIO = require("./lib/read-write-nbt.js");
var mcg = require("./lib/mc-grid.js");
var util = require("./lib/util.js");
var fs = require("fs");
var util = require("./lib/util.js")
var TAU = util.TAU;
var testNBT = require("./output2.json");



//create grid
var testGrid = new mcg.MCGRID(32, 32, 32);


//do stuff here







//create structure blocks and save files
var splitNBT = testGrid.toStructureBlockablePartitions(8, "testchain");
nbtIO.structureBlockChain(splitNBT, "testchain");






