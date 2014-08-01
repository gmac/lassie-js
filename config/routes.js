var application = require('../app/controllers/application');
var projects = require('../app/controllers/projects');
var items = require('../app/controllers/items');
var scenes = require('../app/controllers/scenes');
var layers = require('../app/controllers/layers');
var grids = require('../app/controllers/grids');
var matricies = require('../app/controllers/matricies');
var assets = require('../app/controllers/assets');

module.exports = function(app) {
  function route(path) {
    return '/api/v1'+path;
  }
  
  app.get('/projects', application.projects);
  app.get('/projects/:slug/setup', application.setup);
  app.get('/projects/:slug/assets', application.assets);
  app.get('/projects/:slug/items', application.items);
  app.get('/projects/:slug/scenes', application.scenes);
  app.get('/projects/:project/scenes/:scene', application.layout);
  
  // Projects:
  app.get(route('/projects'), projects.getAll);
  app.post(route('/projects'), projects.create);
  app.get(route('/projects/:id'), projects.getOne);
  app.put(route('/projects/:id'), projects.update);
  app.del(route('/projects/:id'), projects.destroy);
  
  // Assets:
  app.get(route('/assets'), assets.getAll);
  app.post(route('/assets'), assets.create);
  app.get(route('/assets/:id'), assets.getOne);
  app.put(route('/assets/:id'), assets.update);
  app.del(route('/assets/:id'), assets.destroy);
  app.post(route('/uploads'), assets.upload);
  
  // Actors
  // Items:
  app.get(route('/items'), items.getAll);
  app.post(route('/items'), items.create);
  app.get(route('/items/:id'), items.getOne);
  app.put(route('/items/:id'), items.update);
  app.del(route('/items/:id'), items.destroy);
  
  // Combos
  // Inventories
  
  // Scenes:
  app.get(route('/scenes'), scenes.getAll);
  app.post(route('/scenes'), scenes.create);
  app.get(route('/scenes/:id'), scenes.getOne);
  app.put(route('/scenes/:id'), scenes.update);
  app.del(route('/scenes/:id'), scenes.destroy);
  
  // Scene Layers:
  app.post(route('/layers'), layers.create);
  app.put(route('/layers'), layers.reorder);
  app.get(route('/layers'), layers.getAll);
  app.get(route('/layers/:id'), layers.getOne);
  app.put(route('/layers/:id'), layers.update);
  app.del(route('/layers/:id'), layers.destroy);
  
  // Scene Grids:
  app.get(route('/grids'), grids.getAll);
  app.post(route('/grids'), grids.create);
  app.get(route('/grids/:id'), grids.getOne);
  app.put(route('/grids/:id'), grids.update);
  app.del(route('/grids/:id'), grids.destroy);
  
  // Scene Matricies:
  app.get(route('/matricies'), matricies.getAll);
  app.post(route('/matricies'), matricies.create);
  app.get(route('/matricies/:id'), matricies.getOne);
  app.put(route('/matricies/:id'), matricies.update);
  app.del(route('/matricies/:id'), matricies.destroy);
};