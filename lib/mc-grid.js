var util = require("./util.js");
var sbJSON = require("../data/structure-block.json");
var cbJSON = require("../data/command-block.json");
var sfJSON = require("../data/structure-file.json");

exports.MCBLOCK = function (id, states, nbt) {
    this.id = id;
    this.states = states;
    this.nbt = nbt;
}

exports.MCGRID = function (xSize, ySize, zSize, blocks) {
    this.xSize = xSize;
    this.ySize = ySize;
    this.zSize = zSize;
    this.volume = xSize * ySize * zSize;
    if (blocks) {
        this.blocks = blocks;
    } else {
        this.blocks = [];
        for (var i = 0; this.volume > i; i++) {
            this.blocks.push(new exports.MCBLOCK("minecraft:air"));
        }
    }
    this.blockAtIndex = function (index) {
        if (index == -1 || index > this.blocks.length) {
            return {
                structureVoid: true
            };
        } else {
            return this.block[index];
        }
    }
    this.itemFromIndex = function (x, y, z) {
        return this.blocks[this.getIndex(x, y, z)];
    } 
    this.setBlock = function (x, y, z, block) {
        this.blocks[this.getIndex(x, y, z)] = block;
    }
    this.getIndex = function (x, y, z) {
        if (!(util.between(x, 0, this.xSize - 1) && util.between(y, 0, this.ySize - 1) && util.between(z, 0, this.zSize - 1))) {
            return -1;
        }
        return x + this.xSize * (y + this.ySize * z);
    }    
    this.getCoords = function (index) {
        return {
            x: index % this.xSize,
            y: Math.floor(index / this.xSize) % this.ySize,
            z: Math.floor(index / this.xSize / this.ySize)
        };
    }
    this.perBlock = function (callback) {
        for (var i = 0; this.zSize > i; i++) {
            for (var j = 0; this.ySize > j; j++) {
                for (var k = 0; this.xSize > k; k++) {
                    var index = this.getIndex(k, j, i);
                    callback(k, j, i, index, this.blocks[index]);
                }
            }
        }
    }
    this.getSubCuboid = function (x, y, z, w, h, l) {
        var subCuboid = new exports.MCGRID(w, h, l, new Array(w * h * l));
        subCuboid.perBlock((x2, y2, z2, index) => {
            var currentIndex = this.getIndex(x2 + x, y2 + y, z2 + z);
            subCuboid.blocks[index] = this.blocks[currentIndex];
        });
        return subCuboid;
    }
    this.putSubCuboid = function (subCuboid, x, y, z) {
        subCuboid.perBlock((x2, y2, z2, index, block) => {
            var currentIndex = this.getIndex(x2 + x, y2 + y, z2 + z);
            this.blocks[currentIndex] = block;
        });
    } 
    this.splitAlongAxes = function (xSplit, ySplit, zSplit) {
        var xCount = Math.ceil(this.xSize / xSplit);
        var yCount = Math.ceil(this.ySize / ySplit);
        var zCount = Math.ceil(this.zSize / zSplit);
        var subCuboids = [];
        util.forCuboid(xCount, yCount, zCount, (x, y, z, index) => {
            subCuboids.push(this.getSubCuboid(x * xSplit, y * ySplit, z * zSplit, xSplit, ySplit, zSplit));
        });
        return subCuboids;
    }
    this.toStructureBlockablePartitions = function (partitionSize, fileNameBase) {
        var xCount = Math.ceil(this.xSize / partitionSize);
        var yCount = Math.ceil(this.ySize / partitionSize);
        var zCount = Math.ceil(this.zSize / partitionSize);
        var volume = xCount * yCount * zCount;
        var subCuboids = this.splitAlongAxes(partitionSize, partitionSize, partitionSize);
        var zz = util.generateSpaceFillingZigZag(xCount, yCount, zCount);
        var individualPieces = [];
        for (var i = 0; volume > i; i++) {
            var currentPiece = new exports.MCGRID(partitionSize, partitionSize, partitionSize + 1, new Array(Math.pow(partitionSize, 2) * (partitionSize + 1)));
            var currentZigZag = zz[i];
            //TODO: Fix start and end edge cases.
            var nextPos = currentZigZag.next || { x: 0, y: 0, z: 0 };
            var prevPos = currentZigZag.prev || { x: 0, y: 0, z: 0 };

            currentPiece.putSubCuboid(subCuboids[currentZigZag.index], 0, 0, 0);

            var nextStructBlock = util.deepCopy(sbJSON);
            nextStructBlock.value.name.value = `minecraft:${fileNameBase}_${i + 1}`;
            nextStructBlock.value.posX.value = (nextPos.x) * partitionSize;
            nextStructBlock.value.posY.value = (nextPos.y) * partitionSize - 2;
            nextStructBlock.value.posZ.value = (nextPos.z - 1) * partitionSize;
            
            currentPiece.blocks[currentPiece.getIndex(0, 1, partitionSize)] = new exports.MCBLOCK("minecraft:observer", { facing: "down" }, undefined)
            currentPiece.blocks[currentPiece.getIndex(0, 2, partitionSize)] = new exports.MCBLOCK("minecraft:structure_block", undefined, nextStructBlock);

            if (i > xCount * yCount * (zCount - 1)) {
                var commandBlockNBT1 = util.deepCopy(cbJSON);
                commandBlockNBT1.value.Command.value = `setblock ~ ~ ~ minecraft:redstone_block`;
                currentPiece.blocks[currentPiece.getIndex(1, 1, partitionSize)] = new exports.MCBLOCK("minecraft:command_block", { facing: "up", conditional: "false"}, commandBlockNBT1);
                var commandBlockNBT2 = util.deepCopy(cbJSON);
                commandBlockNBT2.value.Command.value = `fill ~ ~ ~ ~-1 ~-1 ~ minecraft:air`;
                commandBlockNBT2.value.auto.value = 0;
                currentPiece.blocks[currentPiece.getIndex(1, 2, partitionSize)] = new exports.MCBLOCK("minecraft:command_block", { facing: "up", conditional: "false"}, commandBlockNBT2);
            }

            individualPieces[i] = currentPiece;
        }
        return individualPieces.map(piece => { return piece.toFormattedNBT() });
    }
    this.toFormattedNBT = function () {
        var nbtBase = util.deepCopy(sfJSON);
        nbtBase.value.size.value.value = [this.xSize, this.ySize, this.zSize];
        var paletteList = [];
        var paletteIndexList = [];
        var existingBlockIndex;
        for (var i = 0; this.blocks.length > i; i++) {
            if (this.blocks[i] && !this.blocks[i].structureVoid) {
                var paletteIndex = util.indexOfProp(paletteList, "id", this.blocks[i].id);
                if (paletteIndex == -1) {
                    paletteList.push({
                        id: this.blocks[i].id,
                        states: this.blocks[i].states
                    });
                    paletteIndexList.push(paletteList.length - 1);
                } else {
                    existingBlockIndex = paletteIndex;
                    var shouldAddToPalette = true;
                    if (this.blocks[i].states) {
                        for (var j = 0; paletteList.length > j; j++) {
                            if (paletteList[j].id == this.blocks[i].id && util.valueEquality(paletteList[j].states, this.blocks[i].states)) {
                                shouldAddToPalette = false;
                                existingBlockIndex = j;
                            }
                        }
                    } else {
                        shouldAddToPalette = false;
                    }
                    if (shouldAddToPalette) {     
                        paletteList.push({ 
                            id: this.blocks[i].id,
                            states: this.blocks[i].states
                        });
                        paletteIndexList.push(paletteList.length - 1);
                    } else {
                        paletteIndexList.push(existingBlockIndex);
                    }
                }
            } else {
                paletteIndexList.push(-1);
            }
        }
        for (var i = 0; paletteList.length > i; i++) {
            var paletteEntry = {
                Name: {
                    type: "string",
                    value: paletteList[i].id
                }
            };
            var states = paletteList[i].states;
            if (states) {
                paletteEntry.Properties = {
                    type: "compound",
                    value: {

                    }
                }
                var propKeys = Object.keys(states);
                for (var j = 0; propKeys.length > j; j++) {
                    paletteEntry.Properties.value[propKeys[j]] = {
                        type: typeof states[propKeys[j]],
                        value: states[propKeys[j]]
                    };
                }
            }
            nbtBase.value.palette.value.value.push(paletteEntry);
        }
        this.perBlock((x, y, z, index, block) => {
            if (paletteIndexList[index] != -1 && block && !block.structureVoid) {
                var blockData = {
                    pos: {
                        type: "list",
                        value: {
                            type: "int",
                            value: [
                                x,
                                y,
                                z
                            ]
                        }
                    },
                    state: {
                        type: "int",
                        value: paletteIndexList[index]
                    },
                    nbt: block.nbt
                }
                nbtBase.value.blocks.value.value.push(blockData);
            }
        });
        return nbtBase;
    }
    this.getAdjacents = function (x, y, z) {
        return [
            this.itemFromIndex(x + 1, y, z),
            this.itemFromIndex(x - 1, y, z),
            this.itemFromIndex(x, y + 1, z),
            this.itemFromIndex(x, y - 1, z),
            this.itemFromIndex(x, y, z + 1),
            this.itemFromIndex(x, y, z - 1)
        ];
    }
}