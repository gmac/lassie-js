'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var InventoryManifestSchema = new Schema({
  axis: {type: String, select: true, default: 'y'},
  color1: {type: Number, select: true, default: 0x000000},
  color2: {type: Number, select: true, default: 0x000000},
  scale1: {type: Number, select: true, default: 1},
  scale2: {type: Number, select: true, default: 1},
  scene_id: {type: Schema.Types.ObjectId, ref: 'Scene', required: true},
  slug: {type: String, select: true, default: ''},
});

module.exports = mongoose.model('Manifest', InventoryManifestSchema, 'manifests');
