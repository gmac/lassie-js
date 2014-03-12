var scenes = require('../app/controllers/scenes');
var layers = require('../app/controllers/layers');
var grids = require('../app/controllers/grids');
var matricies = require('../app/controllers/matricies');

module.exports = function(app) {
  function route(path) {
    return '/api/v1'+path;
  }
  
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