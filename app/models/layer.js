'use strict';
var _ = require('underscore');
var mongoose = require('mongoose');
var BehaviorSchema = require('./behavior');
var LabelSchema = require('./label');
var Schema = mongoose.Schema;

module.exports = function() {
  
  var LayerSchema = new Schema({
    scene_id: {type: Schema.Types.ObjectId, ref: 'Scene', required: true}, 
    slug: {type: String, select: true, default: ''},
    group: {type: String, select: true, default: ''},
    behaviors: [BehaviorSchema],
    labels: [LabelSchema],
    label: {type: Number, select: true, default: ''},
    order: {type: Number, select: true, default: 0},
    editor_visible: {type: Boolean, select: true, default: true},
    
    // Cursor settings:
    interactive: {type: Boolean, select: true, default: false},
    cursor_hover: {type: String, select: true, default: ''},
    
    // Float settings:
    float_enabled: {type: Boolean, select: true, default: false},
    float_x: {type: Number, select: true, default: 0},
    float_y: {type: Number, select: true, default: 0},
    
    // Parallax settings:
    parallax_axis: {type: String, select: true, default: ''},
    
    // Matrix filters:
    filter_scale: {type: String, select: true, default: ''},
    filter_color: {type: String, select: true, default: ''},
    filter_speed: {type: String, select: true, default: ''},
    
    // Hit area settings:
    hit_shape: {type: String, select: true, default: ''},
    hit_h: {type: Number, select: true, default: 0},
    hit_w: {type: Number, select: true, default: 0},
    hit_x: {type: Number, select: true, default: 0},
    hit_y: {type: Number, select: true, default: 0},
    
    img_state: {type: String, select: true, default: ''},
    img_h: {type: Number, select: true, default: 0},
    img_w: {type: Number, select: true, default: 0},
    img_x: {type: Number, select: true, default: 0},
    img_y: {type: Number, select: true, default: 0},
    
    // Positional mapping:
    map_orientation: {type: Number, select: true, default: 2},
    map_x: {type: Number, select: true, default: 0},
    map_y: {type: Number, select: true, default: 0},
    
    sprite_image: {type: String, select: true, default: ''},
    sprite_sheet: {type: String, select: true, default: ''},
    sprite_data: {type: String, select: true, default: ''},
    
    visible: {type: Boolean, select: true, default: true}
  });
  
  // Schema Methods
  // ----------------------------------------------------------
  
  return mongoose.model('Layer', LayerSchema, 'layers');
}();