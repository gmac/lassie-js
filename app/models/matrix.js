'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = function() {

  var MatrixSchema = new Schema({
    axis: {type: String, select: true, default: 'y'},
    color1: {type: Number, select: true, default: 0x000000},
    color2: {type: Number, select: true, default: 0x000000},
    scale1: {type: Number, select: true, default: 1},
    scale2: {type: Number, select: true, default: 1},
    scene_id: {type: Schema.Types.ObjectId, ref: 'Scene', required: true},
    slug: {type: String, select: true, default: ''},
    x1: {type: Number, select: true, default: 100},
    x2: {type: Number, select: true, default: 200},
    y1: {type: Number, select: true, default: 100},
    y2: {type: Number, select: true, default: 200}
  });
  
  // Schema Methods
  // ----------------------------------------------------------

  return mongoose.model('Matrix', MatrixSchema, 'matricies');
}();