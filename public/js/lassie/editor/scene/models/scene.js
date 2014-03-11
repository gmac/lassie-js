define(function(require) {
  
  // Imports:
  var Backbone = require('backbone');
  var Utils = require('helpers/utils');
  var SceneModel = require('models/scene');
  
  // Implementation:

  var SceneCollection = Backbone.Collection.extend({
    url: '/api/v1/scenes',
    model: SceneModel,
    loaded: null,
    
    load: function() {
      if (!this.loaded) this.loaded = this.fetch({reset: true});
      return this.loaded;
    }
  });
  
  return Utils.singleton(SceneCollection);
});