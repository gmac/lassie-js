/**
* Lassie-js
* Asset Model
*/
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AssetSchema = new Schema({
  cache: {type: Boolean, select: true, default: false},
  category: {type: String, select: true, default: ''},
  project_id: {type: Schema.Types.ObjectId, ref: 'Project', required: true},
  slug: {type: String, select: true, required: true},
  sprite_image: {type: String, select: true, default: ''},
  sprite_sheet: {type: String, select: true, default: ''},
  sprite_data: {type: String, select: true, default: ''}
});

module.exports = mongoose.model('Asset', AssetSchema, 'assets');
