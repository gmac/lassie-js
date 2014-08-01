define(function(require) {
  
  var SetupView = require('./views/setup');
  
  return {
    start: function(state, container) {
      container.navbar.show();
      container.open(new SetupView());
    },
    
    stop: function() {
      
    }
  };
});