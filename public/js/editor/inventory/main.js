define(function(require) {
  
  var InventoryView = require('./views/inventory');
  
  return {
    start: function(state, container) {
      container.open(new InventoryView());
    },
    
    stop: function() {
      
    }
  };
});