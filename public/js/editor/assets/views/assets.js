define(function(require) {
  
  var Backbone = require('backbone');
  var ContainerView = require('containerview');
  var Modal = require('editor/common/modal');
  var Utils = require('editor/common/utils');
  
  // ADD controller:
  // ----------------------------------------------------------------
  var AssetEditView = Modal.EditView.extend({
    title: 'Asset',
    //params: {project_id: Project._id},
    
    collection: function() {
      //return Scenes.instance();
    }
  });
  
  
  // REMOVE controller:
  // ----------------------------------------------------------------
  var AssetRemoveView = Modal.RemoveView;
  
  
  // Asset controller:
  // ----------------------------------------------------------------
  var AssetsView = ContainerView.extend({
    className: 'lassie-assets',
    template: Utils.parseTemplate(require('text!../tmpl/assets.html')),
    
    initialize: function() {
      this.$el.html(this.template());
    }
  });
  
  return AssetsView;
});