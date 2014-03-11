'use strict';
var mongoose = require('mongoose');

module.exports = new mongoose.Schema({
  en: {type: String, select: true, default: ''}
});