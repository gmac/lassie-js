'use strict';
var mongoose = require('mongoose');
var LabelSchema = require('./label');

module.exports = new mongoose.Schema({
  slug: {type: String, select: true, default: ''},
  labels: [LabelSchema],
  label: {type: String, select: true, default: ''},
  script: {type: String, select: true, default: ''},
  dialog: []
});