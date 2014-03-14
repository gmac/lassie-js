define(function(require) {
  
  var InventoriesView = require('./views/inventories');
  
  return {
    start: function(state, container) {
      container.open(new InventoriesView());
    },
    
    stop: function() {
      
    }
  };
});