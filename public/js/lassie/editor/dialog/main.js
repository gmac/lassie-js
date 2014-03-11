define(function(require) {
  
  // Imports:
  var $ = require('jquery.colorbox');
  
  return {
    open: function(view) {
      $.colorbox({
        href: view.$el,
        inline: true,
        close: '',
        width: view.width || 400
      });
    },
    
    close: function() {
      $.colorbox.close();
    }
  };
});