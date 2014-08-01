define(function(require) {
  
  var InventoriesView = require('./views/inventories');
  
  return {
    start: function(state, container) {
      container.navbar.show();
      container.open(new InventoriesView());
    },
    
    stop: function() {
      
    }
  };
});