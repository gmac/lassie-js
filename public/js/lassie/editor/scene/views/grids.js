define(function(require) {
  
  // Imports:
  var Backbone = require('backbone');
  var ContainerView = require('containerview');
  var Utils = require('helpers/utils');
  var Dialog = require('editor/dialog/main');
  
  // "ADD" Grid View
  // ----------------------------------------------------------------
  var GridsAddView = Backbone.View.extend({
    className: 'form-horizontal dialog',
    template: Utils.parseTemplate(require('text!../tmpl/grids-add.html')),
    
    initialize: function() {
      this.$el.html(this.template());
    },
    
    events: {
      'click [data-ui="confirm"]': 'onConfirm',
      'click [data-ui="cancel"]': 'onCancel'
    },
    
    onConfirm: function() {
      Dialog.close();
    },
    
    onCancel: function() {
      Dialog.close();
    }
  });
  
  // "REMOVE" Grid View
  // ----------------------------------------------------------------
  var GridsRemoveView = Backbone.View.extend({
    className: 'form-horizontal dialog',
    template: Utils.parseTemplate(require('text!../tmpl/grids-remove.html')),
    
    initialize: function() {
      this.$el.html(this.template());
    },
    
    events: {
      'click [data-ui="confirm"]': 'onConfirm',
      'click [data-ui="cancel"]': 'onCancel'
    },
    
    onConfirm: function() {
      Dialog.close();
    },
    
    onCancel: function() {
      Dialog.close();
    }
  });
  
  // Grids View
  // ----------------------------------------------------------------
  var GridsView = Backbone.View.extend({
    className: 'scene-grids',
    template: Utils.parseTemplate(require('text!../tmpl/grids.html')),
    
    initialize: function() {
      this.$el.html(this.template());
    },
    
    render: function() {
      
    },
    
    events: {
      'click [data-ui="add"]': 'onAdd'
    },
    
    onAdd: function() {
      Dialog.open(new GridsAddView());
    }
  });
  
  return GridsView;
});