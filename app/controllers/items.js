'use strict';

var generic = require('./generic');
var InventoryItem = require('../models/inventory-item');

exports.getAll = generic.getAll(InventoryItem);
exports.getOne = generic.getOne(InventoryItem);
exports.create = generic.create(InventoryItem);
exports.update = generic.update(InventoryItem);
exports.destroy = generic.destroy(InventoryItem);