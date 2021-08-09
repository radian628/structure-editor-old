var fs = require("fs");
var nbt = require("nbt");
var zlib = require("zlib");
var mkdirp = require("mkdirp");
var util = require("./util.js");

exports.readNBTFromFile = function (path, callback) {
    fs.readFile(path, (err, nbtFile) => {
        if (err) throw err;
        nbt.parse(nbtFile, (err2, nbtData) => {
            if (err2) throw err2;
            callback(nbtData);
        });
    });
}

exports.writeNBTToFile = function (nbtData, fileName, callback) {
    var buf = nbt.writeUncompressed(nbtData);
    fs.writeFileSync(fileName + "_temp.nbt", Buffer.from(buf));

    var inp = fs.createReadStream(fileName + '_temp.nbt');
    var out = fs.createWriteStream(fileName + '.nbt');
    var gzip = zlib.createGzip();

    inp.pipe(gzip).pipe(out).on('finish', () => {
        fs.unlink(fileName + '_temp.nbt', () => {
            callback();
        });
    });
}

exports.structureBlockChain = function (nbtData, fileNameBase, callback) {
    for (var i = 0; nbtData.length > i; i++) {
        exports.writeNBTToFile(util.deepCopy(nbtData[i]), fileNameBase + "_" + i, function () {});
    }
}