define(function(require) {
	
	var Backbone = require('backbone');
	
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
      hit_shape: null,
      hit_h: 0,
      hit_w: 0,
      hit_x: 0,
      hit_y: 0,
      img_state: 'rect',
      img_h: 1,
      img_w: 1,
      img_x: 0,
      img_y: 0,
      interactive: true,
      label: null,
      labels: [],
      map_orientation: 2,
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
	  }
	});
	
	var SceneLayerCollection = Backbone.Collection.extend({
	  url: 'api/v1/layers/',
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
	
	var SceneModel = Backbone.Model.extend({
	  urlRoot: 'api/v1/scenes/',
	  idAttribute: '_id',
	  
	  defaults: {
	    slug: ''
	  },
	  
	  initialize: function(data, options) {
	    data = data || {};
		  this.layers = new SceneLayerCollection(data.layers || [], options);
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
	    
		  return data;
		}
	});
	
	return SceneModel;
});