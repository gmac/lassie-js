define(function(require) {
  
  // Imports:
  var Backbone = require('backbone');
  var Data = require('./data');
  
  // Implementation:
  
  // Items:
  var InventoryItem = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      slug: '',
      label: {}
    },
    
    initialize: function() {
      
    }
  });
  
  var InventoryItemCollection = Backbone.Collection.extend({
    model: InventoryItem,
    url: Data.apiPath('items')
  });
  
  
  // Combos:
  var InventoryCombo = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      slug: '',
      items: []
    }
  });
  
  var InventoryComboCollection = Backbone.Collection.extend({
    model: InventoryCombo,
    url: Data.apiPath('combos')
  });
  
  
  // Manifests:
  var InventoryManifest = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      slug: '',
      items: []
    }
  });
  
  var InventoryManifestCollection = Backbone.Collection.extend({
    model: InventoryManifest,
    url: Data.apiPath('manifests')
  });
  
  
  // Inventory:
  function InventoryModel() {
    this.items = new InventoryItemCollection();
    this.combos = new InventoryComboCollection();
    this.manifests = new InventoryManifestCollection();
    this.items.inventory = this.combos.inventory = this.manifests.inventory = this;
  }
  
  InventoryModel.prototype = {
    
  };
  
  return InventoryModel;
});