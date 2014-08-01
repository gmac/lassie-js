'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GridSchema = new Schema({
  scene_id: {type: Schema.Types.ObjectId, ref: 'Scene', required: true},
  slug: {type: String, select: true, default: ''},
  data: {type: String, select: true, default: '{}'}
});

module.exports = mongoose.model('Grid', GridSchema, 'grids');