define(function(require) {
  
  // Imports:
  var Backbone = require('backbone');
  var ContainerView = require('containerview');
  var Modal = require('editor/common/modal');
  var Utils = require('editor/common/utils');
  var SceneState = require('../models/state');
  
  // Implementation:
  
  // "ADD" Layer View
  // ----------------------------------------------------------------
  var LayerEditView = Modal.EditView.extend({
    template: Utils.parseTemplate(require('text!../tmpl/layers-add.html')),
    
    collection: function() {
      return SceneState.get('layers');
    },
    
    serialize: function() {
      var data = {
        slug: this.$('#edit-slug').val(),
        group: this.$('#layer-group').val(),
        sprite_image: this.$('#layer-sprite-image').val(),
        sprite_sheet: this.$('#layer-sprite-sheet').val(),
        sprite_data: this.$('#layer-sprite-data').val(),
        scene_id: SceneState.get('sceneId')
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
  var LayerView = Backbone.View.extend({
    className: 'layers-detail',
    template: Utils.parseTemplate(require('text!../tmpl/layers-detail.html')),
    
    initialize: function() {
      this.listenTo(this.model, 'change:slug change:group', this.render);
      this.listenTo(this.model, 'change:interactive', this.setHit);
    },
    
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
    },

    setHit: function() {
      var $hit = this.$('.hit-area');
      if (this.model.get('interactive')) {
        $hit.stop().slideDown();
      } else {
        $hit.stop().slideUp();
      }
    },
    
    events: {
      'click [data-ui]': 'onUI',
      'change input[type="checkbox"]': 'onChange',
      'change select': 'onChange',
      'blur input': 'onChange'
    },
    
    onChange: function(evt) {
      var $input = Backbone.$(evt.currentTarget);
      var name = $input.attr('name');
      var type = $input.attr('type');
      var value = $input.val();
      
      if (type === 'checkbox') {
        value = $input.prop('checked');
      }
      
      this.model.save(name, value);
    },
    
    onUI: function(evt) {
      evt.preventDefault();
      var action = Backbone.$(evt.currentTarget).attr('data-ui');
      
      switch (action) {
      case 'done':
        this.model.trigger('select', null);
        break;
      case 'update':
        Modal.open(new LayerEditView({model: this.model}));
        break;
      case 'remove':
        Modal.open(new LayerRemoveView({model: this.model}));
        break;
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
      this.model = SceneState.get('sceneModel');
      this.collection = SceneState.get('layers');
      
      // Render template, create components, and apply draggable behavior.
      this.$el.html(this.template());
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
      if (model) this.swapIn(new LayerView({model: model}), '.layers-detail');
      this.$el.css({left: model ? -200 : 0});
    }
  });
  
  return LayersView;
});