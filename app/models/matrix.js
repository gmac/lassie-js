'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = function() {

  var MatrixSchema = new Schema({
    scene_id: {type: Schema.Types.ObjectId, ref: 'Scene', required: true},
    slug: {type: String, select: true, default: ''}
  });
  
  // Schema Methods
  // ----------------------------------------------------------

  return mongoose.model('Matrix', MatrixSchema, 'matricies');
}();