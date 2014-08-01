'use strict';

var generic = require('./generic');
var Matrix = require('../models/matrix');

exports.getAll = generic.getAll(Matrix);
exports.getOne = generic.getOne(Matrix);
exports.create = generic.create(Matrix);
exports.update = generic.update(Matrix);
exports.destroy = generic.destroy(Matrix);