'use strict';

var generic = require('./generic');
var Grid = require('mongoose').model('Grid');

exports.getAll = generic.getAll(Grid);
exports.getOne = generic.getOne(Grid);
exports.create = generic.create(Grid);
exports.update = generic.update(Grid);
exports.destroy = generic.destroy(Grid);