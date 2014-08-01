define(function(require) {
  
  // Imports:
  var InventoryModel = require('lassie/models/inventory');
  var EditorView = require('editor/common/views/editor');
  var Modal = require('editor/common/modal');
  var Utils = require('editor/common/utils');
  
  var itemsCollection = new InventoryModel().items;
  
  var ItemsEditView = Modal.EditView.extend({
    params: {project_id: lassie_project},
    collection: function() {
      return itemsCollection;
    }
  });
  
  var ItemsView = EditorView.extend({
    editView: ItemsEditView,
    collection: itemsCollection
  });
  
  return ItemsView;
});