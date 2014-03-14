define(function(require) {
  
  var Backbone = require('backbone');
  var ContainerView = require('containerview');
  var Modal = require('editor/common/modal');
  var Utils = require('editor/common/utils');
  var NavbarView = require('editor/common/views/navbar');
  var Scenes = require('../models/scene');
  
  // "ADD" controller:
  // ----------------------------------------------------------------
  var SceneEditView = Modal.EditView.extend({
    title: 'Scene',
    
    collection: function() {
      return Scenes.instance();
    }
  });
  
  // "REMOVE" controller:
  // ----------------------------------------------------------------
  var SceneRemoveView = Modal.RemoveView;
  
  // Scene view:
  // ----------------------------------------------------------------
  var ScenesView = ContainerView.extend({
    className: 'scene-list',
    template: Utils.parseTemplate(require('text!../tmpl/scenes.html')),
    
    initialize: function(options) {
      this.collection = Scenes.instance();
      this.$el.html(this.template());
      this.swapIn(new NavbarView(), '.navbar-main');
      
      this.listenTo(this.collection, 'reset add remove', this.render);
    },
    
    render: function() {
      this.$('#scene-list').html(Utils.renderOptions(this.collection));
      this.$('[data-ui="edit"]').prop('disabled', !this.collection.length);
      this.$('[data-ui="remove"]').prop('disabled', !this.collection.length);
    },
    
    selection: function() {
      return this.collection.get(this.$('#scene-list').val());
    },
    
    events: {
      'click [data-ui="add"]': 'onAdd',
      'click [data-ui="edit"]': 'onEdit',
      'click [data-ui="remove"]': 'onRemove',
      'click [data-ui="layout"]': 'onLayout'
    },
    
    onAdd: function() {
      Modal.open(new SceneEditView());
    },
    
    onEdit: function() {
      Modal.open(new SceneEditView({model: this.selection()}));
    },
    
    onRemove: function() {
      Modal.open(new SceneRemoveView({model: this.selection()}));
    },
    
    onLayout: function() {
      var id = this.selection().id;
      
      if (id) {
        this.collection.selected = id;
        require('editor/common/models/state').instance().setState('scenes/'+id);
      }
    }
  });
  
  return ScenesView;
});