define(function(require) {
	
	var Backbone = require('backbone');
	var Data = require('./data');
	
	// Layer
  // ----------------------------------------------------------------
	var SceneLayerModel = Backbone.Model.extend({
	  idAttribute: '_id',
	  defaults: {
	    behaviors: [],
      cursor_hover: null,
      editor_visible: true,
      filter_color: null,
      filter_scale: null,
      filter_speed: null,
      float_enabled: false,
      float_x: 0,
      float_y: 0,
      group: null,
      hit_shape: 'rect',
      hit_h: 100,
      hit_w: 100,
      hit_x: 0,
      hit_y: 0,
      img_state: null,
      img_h: 1,
      img_w: 1,
      img_x: 0,
      img_y: 0,
      interactive: false,
      label: null,
      labels: [],
      map_orientation: 5,
      map_x: 0,
      map_y: 0,
      order: 0,
      parallax_axis: null,
      scene_id: null,
      slug: null,
      sprite_image: null,
      sprite_sheet: null,
      sprite_data: null,
      visible: true
	  },
	  
	  hitRect: function() {
	    var attr = this.attributes;
      return {
        x: attr.img_x + attr.hit_x * attr.img_w,
        y: attr.img_y + attr.hit_y * attr.img_h,
        width: attr.hit_w * attr.img_w,
        height: attr.hit_h * attr.img_h
      };
	  },
	  
	  floatPt: function() {
	    var attr = this.attributes;
	    return {
        x: attr.img_x + attr.float_x * attr.img_w,
        y: attr.img_y + attr.float_y * attr.img_h
      };
	  }
	});
	
	var SceneLayerCollection = Backbone.Collection.extend({
	  url: Data.apiPath('layers'),
	  model: SceneLayerModel,
	  
		comparator: function(model) {
		  return model.get('order');
		},
		
		reorder: function() {
		  var order = this.map(function(model) {
		    return model.pick('_id', 'order');
		  });
		  
		  this.sync('update', this, {
		    url: this.url,
		    data: JSON.stringify(order),
		    contentType: 'application/json'
		  });
		  
		  this.trigger('reorder');
		}
	});
	
	// Grid
  // ----------------------------------------------------------------
	var SceneGrid = Backbone.Model.extend({
	  idAttribute: '_id',
	  defaults: {
	    data: '{}',
	    scene_id: null,
	    slug: null
	  },
	  
	  read: function() {
	    return JSON.parse(this.get('data'));
	  },
	  
	  write: function(data) {
	    this.save('data', JSON.stringify(data));
	  }
  });
  
	var SceneGridCollection = Backbone.Collection.extend({
	  url: Data.apiPath('grids'),
	  model: SceneGrid
  });
  
  // Matrix
  // ----------------------------------------------------------------
  var SceneMatrix = Backbone.Model.extend({
	  idAttribute: '_id',
	  defaults: {
	    axis: 'y',
	    color1: 0x000000,
	    color2: 0x000000,
	    scale1: 1,
	    scale2: 1,
	    scene_id: null,
	    slug: null,
	    x1: 100,
	    x2: 200,
	    y1: 100,
	    y2: 200
	  }
  });
  
	var SceneMatrixCollection = Backbone.Collection.extend({
	  url: Data.apiPath('matricies'),
	  model: SceneMatrix
  });
  
  // Scene
  // ----------------------------------------------------------------
	var SceneModel = Backbone.Model.extend({
	  urlRoot: Data.apiPath('scenes'),
	  idAttribute: '_id',
	  
	  defaults: {
	    slug: '',
	    grid: ''
	  },
	  
	  initialize: function(data, options) {
	    data = data || {};
		  this.layers = new SceneLayerCollection(data.layers || [], options);
		  this.grids = new SceneGridCollection(data.grids || [], options);
		  this.matricies = new SceneMatrixCollection(data.matricies || [], options);
		},
		
	  load: function() {
		  if (!this.loaded) this.loaded = this.fetch({parse: true});
		  return this.loaded;
		},
		
	  parse: function(data) {
	    if (data.layers) {
	      this.layers.reset(data.layers);
	      delete data.layers;
	    }
	    if (data.grids) {
	      this.grids.reset(data.grids);
	      delete data.grids;
	    }
	    if (data.matricies) {
	      this.matricies.reset(data.matricies);
	      delete data.matricies;
	    }
		  return data;
		}
	});
	
	return SceneModel;
});