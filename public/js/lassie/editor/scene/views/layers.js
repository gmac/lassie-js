define(function(require) {
  
  // Imports:
  var Backbone = require('backbone');
  var ContainerView = require('containerview');
  var Utils = require('helpers/utils');
  var Dialog = require('editor/dialog/main');
  var Dragable = require('editor/common/views/dragable');
  var SceneState = require('../models/state');
  
  // Implementation:
  
  // "ADD" Layer View
  // ----------------------------------------------------------------
  var LayerAddView = Backbone.View.extend({
    className: 'form-horizontal dialog',
    template: Utils.parseTemplate(require('text!../tmpl/layers-add.html')),
    
    initialize: function() {
      // Collect model data and state:
      var data = this.model ? this.model.toJSON() : {};
      var state = SceneState.instance().attributes;
      
      // Initialize with scene id and layers collection references:
      this.scene_id = state.sceneData.id;
      this.collection = state.layersData;

      // Render data into HTML template:
      this.$el.html(this.template(data));
    },
    
    events: {
      'click .confirm': 'onConfirm',
      'click .cancel': 'onCancel'
    },
    
    onConfirm: function() {
      var $slug = this.$('#layer-slug');
      var slug = $slug.val();
      var currentSlug = this.model ? this.model.get('slug') : null;
      
      function error(message) {
        var $group = $slug.closest('.form-group').addClass('has-error');
        if (message) $group.find('.error').text(message).show();
        $.colorbox.resize();
      }
      
      if (!slug) {
        error();
        
      } else if (slug !== currentSlug && this.collection.findWhere({slug: slug})) {
        error('Slug must be unique');
         
      } else {
        var data = {
          slug: slug,
          group: this.$('#layer-group').val(),
          sprite_image: this.$('#layer-sprite-image').val(),
          sprite_sheet: this.$('#layer-sprite-sheet').val(),
          sprite_data: this.$('#layer-sprite-data').val(),
          scene_id: this.scene_id
        };
        
        if (this.model) {
          this.model.save(data);
        } else {
          data.order = this.collection.length;
          this.collection.create(data);
        }

        Dialog.close();
      }
    },
    
    onCancel: function() {
      Dialog.close();
    }
  });
  
  // "REMOVE" Layer View
  // ----------------------------------------------------------------
  var LayerRemoveView = Backbone.View.extend({
    className: 'dialog dialog-layer-remove',
    template: Utils.parseTemplate(require('text!../tmpl/layers-remove.html')),
    
    initialize: function() {
      this.$el.html(this.template(this.model.toJSON()));
    },
    
    events: {
      'click [data-ui="confirm"]': 'onConfirm',
      'click [data-ui="cancel"]': 'onCancel'
    },
    
    onConfirm: function() {
      this.model.trigger('select', null);
      this.model.destroy();
      Dialog.close();
    },
    
    onCancel: function() {
      Dialog.close();
    }
  });
  
  // Layer Detail View
  // ----------------------------------------------------------------
  var LayerDetailView = Backbone.View.extend({
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
        Dialog.open(new LayerAddView({model: this.model}));
        break;
      case 'remove':
        Dialog.open(new LayerRemoveView({model: this.model}));
        break;
      }
    }
  });
  
  // Layer Item View
  // ----------------------------------------------------------------
  var LayerItemView = Backbone.View.extend({
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
  
  // Layers List View
  // ----------------------------------------------------------------
  var LayersListView = ContainerView.extend({
    // model >> lassie/models/scene:SceneModel
    // collection >> lassie/models/scene:SceneLayerCollection
    className: 'scene-layers',
    template: Utils.parseTemplate(require('text!../tmpl/layers.html')),
    
    initialize: function() {
      // Initialize view with references to active data sources:
      var state = SceneState.instance().attributes;
      this.model = this.model || state.sceneData;
      this.collection = this.collection || state.layersData;
      
      // Render template, create components, and apply draggable behavior.
      this.$el.html(this.template());
      this.list = this.createSubcontainer('.layers-list ul');
      Dragable.apply(this, '.layers-list ul', '[data-ui="reorder"]');
      
      // Listen for layer collection updates:
      this.listenTo(this.collection, 'reset remove add', this.render);
      this.listenTo(this.collection, 'select', this.onSelect);
    },
    
    render: function() {
      this.list.open(LayerItemView, this.collection);
    },
		
    events: {
      'click [data-ui="add"]': 'onAdd'
    },
    
    onAdd: function() {
      Dialog.open(new LayerAddView());
    },
    
    onSelect: function(model) {
      if (model) this.swapIn(new LayerDetailView({model: model}), '.layers-detail');
      this.$el.css({left: model ? -200 : 0});
    }
  });
  
  return LayersListView;
});