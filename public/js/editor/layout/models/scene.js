define(function(require) {
  
  // Imports:
  var Backbone = require('backbone');
  var Utils = require('editor/common/utils');
  var SceneModel = require('lassie/models/scene');
  
  // Implementation:
  
  var SceneCollection = Backbone.Collection.extend({
    url: Utils.apiPath('scenes'),
    model: SceneModel,
    loaded: null,
    
    load: function() {
      if (!this.loaded) this.loaded = this.fetch({reset: true});
      return this.loaded;
    }
  });
  
  return Utils.singleton(SceneCollection);
});