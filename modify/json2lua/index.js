#!/usr/bin/env node

var lodash = require('lodash'),
    fs = require("fs");

var writeLog = false;

function log(content) {
    'use strict';
    if (writeLog) {
        console.log(content);
    }
}

function toLua(obj, deep) {
    'use strict';
    if (obj === null || obj === undefined) {
        return "nil";
    }
    if (!lodash.isObject(obj)) {
        if (typeof obj === 'string') {
            return '"' + obj + '"';
        }
        return obj.toString();
    }
    var result = "{",
        isArray = obj instanceof Array,
        len = lodash.size(obj),
        i = 0;
    lodash.forEach(obj, function (v, k) {
        var ndeep = deep + 1
        if (isArray) {
            if (lodash.isObject(v) && i == 0) {
                result += '\n' + '\t'.repeat(ndeep) + toLua(v, ndeep);
            } else {
                result += toLua(v, ndeep);
            }
        } else {
            var num = Number(k)
            if (isNaN(num)) {
                result += '\n' + '\t'.repeat(ndeep) + k + ' = ' + toLua(v, ndeep);
            } else {
                result += '\n' + '\t'.repeat(ndeep) + '[' + k + '] = ' + toLua(v, ndeep);
            }
        }
        if (i < len - 1) {
            result += ",";
        }
        i += 1;
    });
    result += '\n' + '\t'.repeat(deep) + "}";
    return result;
}

function loadJsonString(strJson) {
    'use strict';
    var obj = JSON.parse(strJson);
    return obj;
}

function loadJson(filePath) {
    'use strict';
    var content = fs.readFileSync(filePath),
        obj = loadJsonString(content);
    log(obj);
    return obj;
}

function writeText(filePath, text) {
    'use strict';
    log(text);
    fs.writeFileSync(filePath, text);
}

function fromObject(obj, dstFilePath) {
    'use strict';
    var luaString = toLua(obj, 0);
    if (dstFilePath) {
        writeText(dstFilePath, luaString);
    }
    return luaString;
}

function fromString(str, dstFilePath) {
    'use strict';
    var obj = loadJsonString(str),
        luaString = fromObject(obj, dstFilePath);
    return luaString;
}

function fromFile(srcFilePath, dstFilePath) {
    'use strict';
    var obj = loadJson(srcFilePath),
        luaString = fromObject(obj, dstFilePath);
    return luaString;
}

module.exports = {
    fromFile: fromFile,
    fromString: fromString,
    fromObject: fromObject,
    log: log
};