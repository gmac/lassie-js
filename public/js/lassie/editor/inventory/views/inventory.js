define(function(require) {
  
  var Backbone = require('backbone');
  var ContainerView = require('containerview');
  var NavbarView = require('editor/common/views/navbar');
  
  var InventoryView = ContainerView.extend({
    initialize: function() {
      this.append(new NavbarView());
    }
  });
  
  return InventoryView;
});