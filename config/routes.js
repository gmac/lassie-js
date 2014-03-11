var scenes = require('../app/controllers/scene');
var layers = require('../app/controllers/layer');

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
};