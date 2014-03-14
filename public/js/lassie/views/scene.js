define(function(require) {
  
  // Imports:
  var PIXI = require('pixi');
  var _ = require('underscore');
  var Backbone = require('backbone');
  var SceneModel = require('../models/scene');
  
  // Implementation:
  
  // Scene Layer View
  // ----------------------------------------------------------------
  function SceneLayerView(model, scene) {
    this.model = model;
    this.parent = scene;
    this.setImage();
    
    this.listenTo(this.model, 'change:sprite_image change:sprite_sheet change:sprite_data', this.setImage);
    this.listenTo(this.model, 'change:img_state', this.setState);
    this.listenTo(this.model, 'change', this.update);
  }
  
  SceneLayerView.prototype = _.extend({
    clearImage: function() {
      if (this.view && this.view.parent) {
        this.view.parent.removeChild(this.view);
      }
    },
    
    setImage: function() {
      var self = this;
      var spriteImage = self.model.get('sprite_image');
      var spriteSheet = self.model.get('sprite_sheet');
      var spriteData = self.model.get('sprite_data');
      var assets = [spriteImage, spriteSheet, spriteData];

      this.parent.loadAssets(assets).then(function() {
        var view;
        if (spriteData) {
          self.view = new PIXI.Spine(spriteData);
        }
        else if (spriteSheet) {
          self.view = PIXI.MovieClip.fromSpriteSheet(spriteSheet);
        }
        else if (spriteImage) {
          self.view = PIXI.Sprite.fromImage(spriteImage);
        }
        else {
          self.view = new PIXI.DisplayObjectContainer();
        }
        
        self.clearImage();
        self.parent.view.addChild(self.view);
        //self.parent.reorder();
        self.setState();
        self.update();
      });
    },
    
    setState: function() {
      var anim = this.model.get('img_state');
      var state = this.view && this.view.state;
      if (state) {
        try {
          state.setAnimationByName(anim, true);
        } catch (e) {
          state.clearAnimation();
        }
      }
    },
    
    update: function() {
      var model = this.model;
      var view = this.view;
      
      if (view) {
        var attrs = model.attributes;
        view.position.x = attrs.img_x;
        view.position.y = attrs.img_y;
        view.scale.x = attrs.img_w;
        view.scale.y = attrs.img_h;
        view.visible = attrs.visible;
        view.interactive = attrs.interactive;
        view.buttonMode = true;
        
        if (attrs.interactive && attrs.hit_shape !== 'px') {
          var Shape = (attrs.hit_shape === 'oval') ? PIXI.Ellipse : PIXI.Rectangle;
          view.hitArea = new Shape(attrs.hit_x, attrs.hit_y, attrs.hit_w, attrs.hit_h);
        } else {
          // Remove hit area:
          view.hitArea = null;
        }
      }
    },
    
    dispose: function() {
      this.stopListening();
      this.clearImage();
      this.parent.viewLayers = _.without(this.parent.viewLayers, this);
      this.parent = null;
    }
    
  }, Backbone.Events);
  
  
  // Scene View
  // ----------------------------------------------------------------
	function SceneView(id, options) {
	  this.id = id;
	  this.model = new SceneModel({_id: id});
	  this.layers = this.model.layers;
	  this.grids = this.model.grids;
	  this.matricies = this.model.matricies;
	  
	  this.view = new PIXI.DisplayObjectContainer();
	  this.viewLayers = [];
	  
	  this.listenTo(this.layers, 'reset', this.render);
	  this.listenTo(this.layers, 'add', this.addLayer);
	  this.listenTo(this.layers, 'remove', this.removeLayer);
	  this.listenTo(this.layers, 'reorder', this.reorder);
	  this.model.load();
	}
	
	SceneView.prototype = _.extend({
	  // Renders all scene layers:
	  render: function() {
	    // Configure preload queue, then build layers...
	    // This will load all assets together during initial render.
	    this._preload = [];
      this.layers.map(this.addLayer, this);
      
      // Collect and then load all assets in the preload queue:
      var preload = this._preload;
      this._preload = null;
      this.loadAssets(preload);
	  },
	  
	  // Loads assets for the scene:
	  // Individual layers will call upon this parent to manage loading...
	  // this allows assets to be loaded in batches when needed.
	  loadAssets: function(assets) {
	    assets = _.isArray(assets) ? assets : Array.prototype.slice.call(arguments);
      var deferred;

	    if (this._preload) {
	      // Add assets to preload queue:
	      this._preload = this._preload.concat(assets);
	      deferred = this._preloading = this._preloading || Backbone.$.Deferred();
	    }
	    else {
	      // Fulfill loading:
	      var loader = new PIXI.AssetLoader(_.unique(_.compact(assets)));
	      deferred = this._preloading || Backbone.$.Deferred();
	      this._preloading = null;
	      
	      loader.onComplete = function() {
	        deferred.resolve();
	      };
	      
	      loader.load();
	    }
	    
	    return deferred.promise();
	  },
	  
	  // Adds a new layer to the scene:
	  addLayer: function(model) {
	    this.viewLayers.push(new SceneLayerView(model, this));
	  },
	  
	  // Removes a layer from the scene:
	  removeLayer: function(model) {
	    var layer = _.findWhere(this.viewLayers, {model: model});
	    if (layer) layer.dispose();
	  },
	  
	  update: function() {
	    
	  },
	  
	  reorder: function() {
	    // Apply order attribute to all views:
	    _.each(this.viewLayers, function(v) {
	      v.view.__order = v.model.get('order');
	    });
	    
	    // Sort all children:
      this.view.children.sort(function(a, b) {
        return a.__order - b.__order;
      });
    },
    
    // Disposes of the scene:
	  dispose: function() {
	    this.stopListening();
	    _.invoke(this.viewLayers, 'dispose');
	  }
	  
	}, Backbone.Events);
	
	return SceneView;
});