define(function(require) {
  
  var Backbone = require('backbone');
  var ContainerView = require('containerview');
  var Modal = require('editor/common/modal');
  var Utils = require('editor/common/utils');
  var NavbarView = require('editor/common/views/navbar');
  
  var InventoriesView = ContainerView.extend({
    className: 'lassie-inventories',
    template: Utils.parseTemplate(require('text!../tmpl/inventories.html')),
    
    initialize: function() {
      this.$el.html(this.template());
      this.swapIn(new NavbarView(), '[data-ui="navbar"]');
    }
  });
  
  return InventoriesView;
});