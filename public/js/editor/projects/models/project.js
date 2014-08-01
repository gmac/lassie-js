define(function(require) {
  
  // Imports:
  var Backbone = require('backbone');
  var Utils = require('editor/common/utils');
  
  // Implementation:
  
  // Project model:
  var ProjectModel = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      slug: ''
    }
  });
  
  // Project models group:
  var ProjectsCollection = Backbone.Collection.extend({
    url: '/api/v1/projects',
    model: ProjectModel
  });
  
  return Utils.singleton(ProjectsCollection);
});