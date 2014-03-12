'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = function() {

  var GridSchema = new Schema({
    scene_id: {type: Schema.Types.ObjectId, ref: 'Scene', required: true},
    slug: {type: String, select: true, default: ''},
    data: {type: String, select: true, default: '{}'}
  });
  
  // Schema Methods
  // ----------------------------------------------------------

  return mongoose.model('Grid', GridSchema, 'grids');
}();