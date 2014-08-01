define(function(require) {
  
  // Imports:
  var PIXI = require('pixi');
  var Backbone = require('backbone');
  var ContainerView = require('containerview');
  var Modal = require('editor/common/modal');
  var Utils = require('editor/common/utils');
  var LayoutState = require('../models/state');
  var WorkspaceView = require('./workspace');
  
  // Implementation:
  
  // "ADD" Layer View
  // ----------------------------------------------------------------
  var LayerEditView = Modal.EditView.extend({
    template: Utils.parseTemplate(require('text!../tmpl/layers-add.html')),
    
    collection: function() {
      return LayoutState.get('layers');
    },
    
    serialize: function() {
      var data = {
        slug: this.$('#edit-slug').val(),
        group: this.$('#layer-group').val(),
        sprite_image: this.$('#layer-sprite-image').val(),
        sprite_sheet: this.$('#layer-sprite-sheet').val(),
        sprite_data: this.$('#layer-sprite-data').val(),
        scene_id: LayoutState.get('sceneId')
      };
      
      // Add order onto models being created:
      if (!this.model) {
        data.order = this.collection().length;
      }
      
      return data;
    }
  });
  
  // "REMOVE" Layer View
  // ----------------------------------------------------------------
  var LayerRemoveView = Modal.RemoveView;
  
  // Layer Detail View
  // ----------------------------------------------------------------
  var LayerView = WorkspaceView.extend({
    className: 'layers-detail',
    template: Utils.parseTemplate(require('text!../tmpl/layer.html')),
    
    initialize: function() {
      this.initEditor();
      this.setView();
    },
    
    setView: function() {
      this.hit = new PIXI.Graphics();
      this.reg = new PIXI.Graphics();
      this.ref = new PIXI.Graphics();
      this.map = new PIXI.Graphics();
      this.dir = new PIXI.Graphics();
      
      function crosshairs(view, size, weight, color, alpha) {
        view.lineStyle(weight, color, alpha);
        view.moveTo(0, -size);
        view.lineTo(0, size);
        view.moveTo(-size, 0);
        view.lineTo(size, 0);
      }
      
      // Registration:
      crosshairs(this.reg, 5, 3, 0x000000, 0.5);
      crosshairs(this.reg, 5, 1, 0xffffff, 1);
      
      // Float Reference:
      this.ref.interactive = true;
      this.ref.mousedown = _.bind(this.onRef, this);
      this.ref.hitArea = new PIXI.Circle(0, 0, 6);
      this.ref.beginFill(0xffffff, 1);
      this.ref.drawCircle(0, 0, 6);
      this.ref.endFill();
      crosshairs(this.ref, 4, 3, 0x000000, 0.5);
      crosshairs(this.ref, 4, 1, 0xffffff, 1);
      
      // Map Point:
      var map = this.map;
      var shape = [{x:-8, y:8}, {x:0, y:-15}, {x:8, y:8}, {x:0, y:2}];
      // map pointer:
      map.interactive = true;
      map.mousedown = _.bind(this.onMap, this);
      map.hitArea = new PIXI.Polygon(shape);
      map.beginFill(0xffffff, 1);
      map.moveTo(shape[0].x, shape[0].y);
      map.lineTo(shape[1].x, shape[1].y);
      map.lineTo(shape[2].x, shape[2].y);
      map.lineTo(shape[3].x, shape[3].y);
      map.lineTo(shape[0].x, shape[0].y);
      map.endFill();
      crosshairs(map, 4, 3, 0x000000, 0.5);
      crosshairs(map, 3, 1, 0xffffff, 1);
      
      // Hit area:
      this.hit.interactive = true;
      this.hit.mousedown = _.bind(this.onHit, this);
      
      // Add layout elements:
      this.view.addChild(this.hit);
      this.view.addChild(this.reg);
      this.view.addChild(this.ref);
      this.view.addChild(this.map);
    },
    
    // Activates the layout with a new model:
    activate: function(model) {
      this.stopListening();
      this.model = model;
      
      if (this.model) {
        this.listenTo(this.model, 'change:slug change:group', this.render);
        this.listenTo(this.model, 'change:interactive', this.toggleHit);
        this.listenTo(this.model, 'change:float_enabled', this.toggleFloat);
        this.listenTo(this.model, 'change', this.renderLayout);
        this.addLayoutView();
        this.render();
      } else {
        this.removeLayoutView();
      }
    },
    
    // Toggles the interaction controls form:
    toggleHit: function() {
      if (!this.model) return;
      var $form = this.$('#interactive-controls');
      if (this.model.get('interactive')) {
        $form.stop().slideDown();
      } else {
        $form.stop().slideUp();
      }
    },
    
    // Toggles the float controls form:
    toggleFloat: function() {
      if (!this.model) return;
      var $form = this.$('#float-controls');
      if (this.model.get('float_enabled')) {
        $form.stop().slideDown();
      } else {
        $form.stop().slideUp();
      }
    },
    
    // Renders the form template and layout:
    render: function() {
      if (this.model) {
        this.$el.html(this.template(this.model.toJSON()));
        this.renderLayout();
      }
    },
    
    // Renders all layout elements:
    renderLayout: _.debounce(function() {
      if (this.model) {
        this.renderReg();
        this.renderRef();
        this.renderHit();
        this.renderMap();
      }
    }, 10),
    
    // Renders the hit area:
    renderHit: function(redraw) {
      if (!this.model) return;
      var shape = this.model.get('hit_shape');
      this.hit.visible = this.model.get('interactive') && (shape !== 'px');
      
      if (this.hit.visible) {
        var rect = this.model.hitRect();
        
        if (redraw || redraw === undefined) {
          var isEllipse = (shape === 'oval');
          var Shape = isEllipse ? PIXI.Ellipse : PIXI.Rectangle;
          this.hit.hitArea = new Shape(0, 0, rect.width, rect.height);
          this.hit.clear();
          this.hit.beginFill(0xFF0000, 0.35);
          this.hit[isEllipse ? 'drawEllipse' : 'drawRect'](0, 0, rect.width, rect.height);
          this.hit.endFill();
        }
        
        this.hit.position.x = rect.x;
        this.hit.position.y = rect.y;
      }
    },
    
    // Renders the map point:
    renderMap: function() {
      if (this.model) {
        this.map.rotation = ((Math.PI * 2) / 8) * this.model.get('map_orientation');
        this.map.position.x = this.model.get('map_x');
        this.map.position.y = this.model.get('map_y');
      }
    },
    
    // Renders the registration point:
    renderReg: function() {
      if (this.model) {
        this.reg.position.x = this.model.get('img_x');
        this.reg.position.y = this.model.get('img_y');
      }
    },
    
    // Renders the float reference point:
    renderRef: function() {
      if (this.model) {
        var floatPt = this.model.floatPt();
        this.ref.visible = this.model.get('float_enabled');
        this.ref.position.x = floatPt.x;
        this.ref.position.y = floatPt.y;
      }
    },
    
    // Renders coordinate displays into the form for a specific field:
    renderCoords: function(field) {
      this.$('input[name="'+field+'_x"]').val(this.model.get(field+'_x'));
      this.$('input[name="'+field+'_y"]').val(this.model.get(field+'_y'));
    },
    
    // Triggered upon clicking the float reference point:
    onRef: function() {
      var self = this;
      var imgX = this.model.get('img_x');
      var imgY = this.model.get('img_y');
      var imgSX = this.model.get('img_w');
      var imgSY = this.model.get('img_h');
      var data = {};
      
      this.drag(function(pt) {
        data.float_x = Math.round((pt.x-imgX)/imgSX);
        data.float_y = Math.round((pt.y-imgY)/imgSY);
				self.model.set(data, {silent: true});
				self.renderCoords('float');
				self.renderRef();
			}, function() {
			  self.model.trigger('change');
				self.model.save();
			});
    },
    
    // Triggered upon clicking the map point:
    onMap: function() {
      var self = this;
      var data = {};
      
      this.drag(function(pt) {
				data.map_x = pt.x;
				data.map_y = pt.y;
				self.model.set(data, {silent: true});
				self.renderCoords('map');
				self.renderMap();
			}, function() {
			  self.model.trigger('change');
				self.model.save();
			});
    },
    
    // Triggered upon clicking the hit area:
    onHit: function() {
      var self = this;
      var origin = this.cursor().clone();
      var start = this.model.pick('hit_x', 'hit_y');
      var data = {};
      
      this.drag(function(pt) {
				data.hit_x = start.hit_x + (pt.x - origin.x);
				data.hit_y = start.hit_y + (pt.y - origin.y);
				self.model.set(data, {silent: true});
				self.renderCoords('hit');
				self.renderHit(false);
			}, function() {
			  self.model.trigger('change');
				self.model.save();
			});
    },

    uiPrompt: function(action) {
      if (!this.model) return;
      
      switch (action) {
        case 'done': return this.model.trigger('select', null);
        case 'update': return Modal.open(new LayerEditView({model: this.model}));
        case 'remove': return Modal.open(new LayerRemoveView({model: this.model}));
      }
    }
  });
  
  // Layer Item View
  // ----------------------------------------------------------------
  var LayersItemView = Backbone.View.extend({
    tagName: 'li',
    className: 'list-group-item',
    template: Utils.parseTemplate(require('text!../tmpl/layers-item.html')),
    groupColors: [0x285e8e, 0x398439, 0x269abc, 0xd58512, 0xac2925],
    
    attributes: function() {
      return {'data-cid': this.model.cid};
    },
    
    initialize: function() {
      this.listenTo(this.model, 'change:slug change:group change:visible', this.render);
    },
    
    render: function() {
      var data = this.model.toJSON();
      this.$el.html(this.template(data));
    },
    
    events: {
      'click [data-ui="select"]': 'onSelect'
    },
    
    onSelect: function(evt) {
      evt.preventDefault();
      this.model.trigger('select', this.model);
    }
  });
  
  // Layers View
  // ----------------------------------------------------------------
  var LayersView = ContainerView.extend({
    // model >> lassie/models/scene:SceneModel
    // collection >> lassie/models/scene:SceneLayerCollection
    className: 'scene-layers',
    template: Utils.parseTemplate(require('text!../tmpl/layers.html')),
    
    initialize: function() {
      // Initialize view with references to active data sources:
      this.model = LayoutState.get('sceneModel');
      this.collection = LayoutState.get('layers');
      
      // Render template, create components, and apply draggable behavior.
      this.layer = this.addSubview(new LayerView());
      this.$el.html(this.template()).append(this.layer.$el);
      this.list = this.createSubcontainer('.layers-list ul');
      Utils.makeDragable(this, this.list.$el, '[data-ui="reorder"]');
      
      // Listen for layer collection updates:
      this.listenTo(this.collection, 'reset remove add', this.render);
      this.listenTo(this.collection, 'select', this.onSelect);
    },
    
    render: function() {
      this.list.open(LayersItemView, this.collection);
    },
		
    events: {
      'click [data-ui="add"]': 'onAdd'
    },
    
    onAdd: function() {
      Modal.open(new LayerEditView());
    },
    
    onSelect: function(model) {
      this.layer.activate(model);
      this.$el.css({left: model ? -200 : 0});
    }
  });
  
  return LayersView;
});