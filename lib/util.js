exports.clamp = function (value, min, max) {
    return Math.min(Math.max(value, min), max);
}

exports.between = function (value, min, max) {
    return exports.clamp(value, min, max) == value;
}

exports.forCuboid = function (x, y, z, callback) {
    for (var i = 0; z > i; i++) {
        for (var j = 0; y > j; j++) {
            for (var k = 0; x > k; k++) {
                callback(k, j, i, k + x * (j + y * i));
            }
        }
    }
}

exports.getIndex = function (x, y, z, w, h) {
    return x + w * (y + h * z);
}

exports.zigzag = function (scale) {
    return function (x) {
        return scale - Math.abs((x + 0.5) % (2 * scale + 2) - scale - 1) + 0.5;
    }
}

exports.generateSpaceFillingZigZag = function (x, y, z) {
    var zzx = exports.zigzag(x - 1);
    var zzy = exports.zigzag(y - 1);
    var parts = [];
    for (var i = 0; x * y * z > i; i++) {
        
        var nextPosition;

        if (i == x * y * z - 1) {
            nextPosition = undefined;
        } else {
            nextPosition = {
                x: zzx(i + 1) - zzx(i),
                y: zzy(Math.floor((i + 1) / x)) - zzy(Math.floor(i / x)),
                z: Math.floor((i + 1) / (x * y)) - Math.floor(i / (x * y))
            }
        }

        var prevPosition;

        if (i == 0) {
            prevPosition = undefined;
        } else {
            prevPosition = {
                x: zzx(i - 1) - zzx(i),
                y: zzy(Math.floor((i - 1) / x)) - zzy(Math.floor(i / x)),
                z: Math.floor((i - 1) / (x * y)) - Math.floor(i / (x * y))
            }
        }
        
        parts.push({
            index: exports.getIndex(zzx(i), zzy(Math.floor(i / x)), Math.floor(i / (x * y)), x, y),
            next: nextPosition,
            prev: prevPosition
        });
    }
    return parts;
}

exports.deepCopy = function (json) {
    return JSON.parse(JSON.stringify(json));
}

exports.valueEquality = function (obj1, obj2) {
    var keys = Object.keys(obj1);
    for (var i = 0; keys.length > i; i++) {
        if (obj1[keys[i]] != obj2[keys[i]]) {
            return false;
        }
    }
    keys = Object.keys(obj2);
    for (var i = 0; keys.length > i; i++) {
        if (obj1[keys[i]] != obj2[keys[i]]) {
            return false;
        }
    }
    return true;
}

exports.indexOfProp = function (arr, prop, value) {
    for (var i = 0; arr.length > i; i++) {
        if (arr[i][prop] == value) {
            return i;
        }
    }
    return -1;
}

exports.TAU = Math.PI * 2;

exports.weightedChoice = function (options, weights) {
    var totalWeight = weights.reduce((prev, current) => { return prev + current; }, 0);
    var rand = Math.random() * totalWeight;
    var accumulatedWeight = 0;
    for (var i = 0; weights.length > i; i++) {
        if (exports.between(rand, accumulatedWeight, accumulatedWeight + weights[i])) {
            return options[i];
        } else {
            accumulatedWeight += weights[i];
        }
    }
}

exports.grid3D = function (xSize, ySize, zSize, contents) {
    this.volume = xSize * ySize * zSize;
    this.contents = contents || new Array(this.volume);
    this.xSize = xSize;
    this.ySize = ySize;
    this.zSize = zSize;
    this.forAll = function (callback) {
        exports.forCuboid(this.xSize, this.ySize, this.zSize, (x, y, z, index) => {
            callback(x, y, z, index, this.contents[index]);
        });
    }
    this.getIndex = function (x, y, z) {
        if (!(exports.between(x, 0, this.xSize - 1) && exports.between(y, 0, this.ySize - 1) && exports.between(z, 0, this.zSize - 1))) {
            return -1;
        }
        return exports.getIndex(x, y, z, this.xSize, this.ySize);
    }
    this.getCoords = function (index) {
        return {
            x: index % this.xSize,
            y: Math.floor(index / this.xSize) % this.ySize,
            z: Math.floor(index / this.xSize / this.ySize)
        };
    }
    this.itemFromIndex = function (x, y, z) {
        return this.contents[this.getIndex(x, y, z)];
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

exports.randMember = function (arr) {
    var rand = Math.floor(Math.random() * arr.length);
    return arr[rand];
}

exports.removeDoubles = function (arr) {
    var uniqueArr = [];
    for (var i = 0; arr.length > i; i++) {
        if (uniqueArr.indexOf(arr[i]) == -1) {
            uniqueArr.push(arr[i]);
        }
    }
    return uniqueArr;
}

exports.inBothArrays = function (arr1, arr2) {
    var inBoth = [];
    for (var i = 0; arr1.length > i; i++) {
        if (arr2.indexOf(arr1[i]) != -1) {
            inBoth.push(arr1[i])
        }
    }
    for (var i = 0; arr2.length > i; i++) {
        if (arr1.indexOf(arr2[i]) != -1) {
            inBoth.push(arr2[i]);
        }
    }
    return exports.removeDoubles(inBoth);
}