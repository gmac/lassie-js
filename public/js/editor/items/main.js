define(function(require) {

  var ItemsView = require('./views/items');

  return {
    start: function(state, container) {
      container.open(new ItemsView());
    },
    
    stop: function() {
      
    }
  };
});