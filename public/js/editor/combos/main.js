define(function(require) {
  
  var CombosView = require('./views/combos');
  
  return {
    start: function(state, container) {
      container.open(new CombosView());
    },
    
    stop: function() {
      
    }
  };
});