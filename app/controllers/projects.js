'use strict';

var generic = require('./generic');
var Project = require('../models/project');

exports.getAll = generic.getAll(Project);
exports.getOne = generic.getOne(Project);
exports.create = generic.create(Project);
exports.update = generic.update(Project);
exports.destroy = generic.destroy(Project);