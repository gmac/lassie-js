define(function(require) {
  
  // Imports:
  var Backbone = require('backbone');
  var ContainerView = require('containerview');
  var Modal = require('editor/common/modal');
  var Utils = require('editor/common/utils');
  var NavbarView = require('editor/common/views/navbar');
  
  var ItemsView = ContainerView.extend({
    className: 'lassie-items',
    template: Utils.parseTemplate(require('text!../tmpl/items.html')),
    
    initialize: function() {
      this.$el.html(this.template());
      this.swapIn(new NavbarView(), '[data-ui="navbar"]');
    }
  });
  
  return ItemsView;
});