'use strict';
var Q = require('q');
var _ = require('underscore');
var mongoose = require('mongoose');

module.exports = function() {

  var DialogSchema = new mongoose.Schema({
    action_id: {type: Schema.Types.ObjectId, required: true},
    en: {type: String, select: true, default: ''}
  });
  
  return mongoose.model('Dialog', DialogSchema, 'dialogs');
}();