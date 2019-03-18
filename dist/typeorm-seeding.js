'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Faker = require('faker');
var glob = _interopDefault(require('glob'));
var typeorm = require('typeorm');
require('reflect-metadata');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

/**
 * Returns the name of a class
 */
const getNameOfClass = (c) => new c().constructor.name;
/**
 * Checks if the given argument is a promise
 */
const isPromiseLike = (o) => !!o && (typeof o === 'object' || typeof o === 'function') && typeof o.then === 'function' && !(o instanceof Date);
/**
 * Times repeats a function n times
 */
const times = (n, iteratee) => __awaiter(undefined, void 0, void 0, function* () {
    const rs = [];
    for (let i = 0; i < n; i++) {
        const r = yield iteratee(i);
        rs.push(r);
    }
    return rs;
});

class EntityFactory {
    constructor(name, entity, factory, settings) {
        this.name = name;
        this.entity = entity;
        this.factory = factory;
        this.settings = settings;
    }
    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------
    /**
     * This function is used to alter the generated values of entity, before it
     * is persist into the database
     */
    map(mapFunction) {
        this.mapFunction = mapFunction;
        return this;
    }
    /**
     * Make a new entity, but does not persist it
     */
    make() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.factory) {
                let entity = yield this.resolveEntity(this.factory(Faker, this.settings));
                if (this.mapFunction) {
                    entity = yield this.mapFunction(entity);
                }
                return entity;
            }
            throw new Error('Could not found entity');
        });
    }
    /**
     * Seed makes a new entity and does persist it
     */
    seed() {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = global.seeder.connection;
            if (connection) {
                const em = connection.createEntityManager();
                try {
                    const entity = yield this.make();
                    return yield em.save(entity);
                }
                catch (error) {
                    throw new Error('Could not save entity');
                }
            }
            else {
                throw new Error('No db connection is given');
            }
        });
    }
    makeMany(amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const list = [];
            for (let index = 0; index < amount; index++) {
                list[index] = yield this.make();
            }
            return list;
        });
    }
    seedMany(amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const list = [];
            for (let index = 0; index < amount; index++) {
                list[index] = yield this.seed();
            }
            return list;
        });
    }
    // -------------------------------------------------------------------------
    // Prrivat Helpers
    // -------------------------------------------------------------------------
    resolveEntity(entity) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const attribute in entity) {
                if (entity.hasOwnProperty(attribute)) {
                    if (isPromiseLike(entity[attribute])) {
                        entity[attribute] = yield entity[attribute];
                    }
                    if (typeof entity[attribute] === 'object' && !(entity[attribute] instanceof Date)) {
                        const subEntityFactory = entity[attribute];
                        try {
                            entity[attribute] = yield subEntityFactory.make();
                        }
                        catch (e) {
                            console.log('SubEntity without Factory (Point, json...)');
                            // throw new Error(`Could not make ${(subEntityFactory as any).name}`);
                        }
                    }
                }
            }
            return entity;
        });
    }
}

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// path.normalize(path)
// posix version
function normalize(path) {
  var isPathAbsolute = isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isPathAbsolute).join('/');

  if (!path && !isPathAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isPathAbsolute ? '/' : '') + path;
}
// posix version
function isAbsolute(path) {
  return path.charAt(0) === '/';
}

// posix version
function join() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
}
function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b' ?
    function (str, start, len) { return str.substr(start, len) } :
    function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

// -------------------------------------------------------------------------
// Util functions
// -------------------------------------------------------------------------
const importFactories = (files) => files.forEach(require);
const loadFiles = (filePattern) => (pathToFolder) => (successFn) => (failedFn) => {
    glob(join(process.cwd(), pathToFolder, filePattern), (error, files) => error
        ? failedFn(error)
        : successFn(files));
};
const loadFactoryFiles = loadFiles('**/*Factory{.js,.ts}');
// -------------------------------------------------------------------------
// Facade functions
// -------------------------------------------------------------------------
const loadEntityFactories = (pathToFolder) => {
    return new Promise((resolve$$1, reject) => {
        loadFactoryFiles(pathToFolder)(files => {
            importFactories(files);
            resolve$$1(files);
        })(reject);
    });
};
const loadSeeds = (pathToFolder) => {
    return new Promise((resolve$$1, reject) => {
        loadFiles('**/*{.js,.ts}')(pathToFolder)(resolve$$1)(reject);
    });
};

const args = process.argv;
// Get cli parameter for logging
const logging = args.indexOf('--logging') >= 0 || args.indexOf('-L') >= 0 || false;
// Get cli parameter for ormconfig.json or another json file
const configParam = '--config';
const hasConfigPath = args.indexOf(configParam) >= 0 || false;
const indexOfConfigPath = args.indexOf(configParam) + 1;
/**
 * Returns a TypeORM database connection for our entity-manager
 */
const loadConnection = () => __awaiter(undefined, void 0, void 0, function* () {
    let ormconfig = {
        logging,
    };
    if (hasConfigPath) {
        const configPath = join(process.cwd(), args[indexOfConfigPath]);
        ormconfig = require(configPath);
    }
    else {
        try {
            ormconfig = yield typeorm.getConnectionOptions();
        }
        catch (e) {
            ormconfig = require(join(process.cwd(), 'ormconfig.json'));
        }
    }
    // ormconfig.entities = [];
    return typeorm.createConnection(ormconfig);
});

// -------------------------------------------------------------------------
// Types & Variables
// -------------------------------------------------------------------------
global.seeder = {
    connection: undefined,
    entityFactories: new Map(),
};
// -------------------------------------------------------------------------
// Facade functions
// -------------------------------------------------------------------------
/**
 * Adds the typorm connection to the seed options
 */
const setConnection = (connection) => global.seeder.connection = connection;
/**
 * Returns the typorm connection from our seed options
 */
const getConnection = () => global.seeder.connection;
/**
 * Defines a new entity factory
 */
const define = (entity, factoryFn) => {
    global.seeder.entityFactories.set(getNameOfClass(entity), { entity, factory: factoryFn });
};
/**
 * Gets a defined entity factory and pass the settigns along to the entity factory function
 */
const factory = (entity) => (settings) => {
    const name = getNameOfClass(entity);
    const entityFactoryObject = global.seeder.entityFactories.get(name);
    return new EntityFactory(name, entity, entityFactoryObject.factory, settings);
};
/**
 * Runs a seed class
 */
const runSeed = (seederConstructor) => __awaiter(undefined, void 0, void 0, function* () {
    const seeder = new seederConstructor();
    return seeder.seed(factory, getConnection());
});

exports.setConnection = setConnection;
exports.getConnection = getConnection;
exports.define = define;
exports.factory = factory;
exports.runSeed = runSeed;
exports.times = times;
exports.loadEntityFactories = loadEntityFactories;
exports.loadSeeds = loadSeeds;
exports.loadConnection = loadConnection;
