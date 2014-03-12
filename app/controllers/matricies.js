'use strict';

var generic = require('./generic');
var Matrix = require('mongoose').model('Matrix');

exports.getAll = generic.getAll(Matrix);
exports.getOne = generic.getOne(Matrix);
exports.create = generic.create(Matrix);
exports.update = generic.update(Matrix);
exports.destroy = generic.destroy(Matrix);