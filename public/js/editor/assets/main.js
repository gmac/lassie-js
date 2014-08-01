define(function(require) {
  
  var AssetsView = require('./views/assets');
  
  return {
    start: function(state, container) {
      container.navbar.show();
      container.open(new AssetsView());
    },
    
    stop: function() {
      
    }
  };
});