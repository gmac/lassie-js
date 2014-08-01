define(function(require) {
  
  var Backbone = require('backbone');
  var Utils = require('editor/common/utils');
  
  var LayoutStateModel = Backbone.Model.extend({
    defaults: {
      grids: null,
      layers: null,
      layoutManager: null,
      matricies: null,
      sceneId: null,
      sceneView: null,
      sceneModel: null,
      viewState: 'layer',
      viewWidth: 0,
      viewHeight: 0
    },
    
    view: function(view) {
      if (view) this.set('viewState', view);
      return this.get('viewState');
    },
    
    reset: function() {
      this.set(this.defaults);
      return this;
    }
  });
  
  LayoutStateModel.get = function(attr) {
    return this.instance().get(attr);
  };
  
  return Utils.singleton(LayoutStateModel);
});