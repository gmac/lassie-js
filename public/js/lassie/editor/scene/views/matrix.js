define(function(require) {
  
  // Imports:
  var Backbone = require('backbone');
  var ContainerView = require('containerview');
  var Utils = require('helpers/utils');
  var Dialog = require('editor/dialog/main');
  
  // "ADD" Matrix View
  // ----------------------------------------------------------------
  var MatrixAddView = Backbone.View.extend({
    className: 'form-horizontal dialog',
    template: Utils.parseTemplate(require('text!../tmpl/matrix-add.html')),
    
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
  
  // "REMOVE" Matrix View
  // ----------------------------------------------------------------
  var MatrixRemoveView = Backbone.View.extend({
    className: 'form-horizontal dialog',
    template: Utils.parseTemplate(require('text!../tmpl/matrix-remove.html')),
    
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
  
  // Matrix View
  // ----------------------------------------------------------------
  var MatrixView = Backbone.View.extend({
    className: 'scene-matrix',
    template: Utils.parseTemplate(require('text!../tmpl/matrix.html')),
    
    initialize: function() {
      this.$el.html(this.template());
    },
    
    render: function() {
      
    },
    
    events: {
      'click [data-ui="add"]': 'onAdd'
    },
    
    onAdd: function() {
      Dialog.open(new MatrixAddView());
    }
  });
  
  return MatrixView;
});