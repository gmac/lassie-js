'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var InventoryItemSchema = new Schema({
  project_id: {type: Schema.Types.ObjectId, ref: 'Project', required: true},
  slug: {type: String, select: true, default: ''}
});

module.exports = mongoose.model('Item', InventoryItemSchema, 'items');
