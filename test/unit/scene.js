'use strict';
var Q = require('q');
var request = require('superagent');
var mocha = require('mocha');
var chai = require('chai');
var expect = chai.expect;
var Scene = require('../../app/models/scene');
var Layer = require('../../app/models/layer');

module.exports = function(url) {
  url += '/scenes';
  
  describe('Scene Routes', function() {
    beforeEach(function(done) {
      done();
    });
    
    afterEach(function(done) {
      var sp = Scene.remove({}).exec();
      var lp = Layer.remove({}).exec();
      Q.all([sp, lp]).then(function() {
        done();
      });
    });
    
    it('Should create a new scene using POST', function(done) {
      request
        .post(url)
        .send({slug: 'beach'})
        .end(function(res) {
          expect(res.statusCode).to.equal(200);
          expect(res.body.slug).to.equal('beach');
          //expect(res.body).to.have.keys('_id', 'name');
          done();
        });
    });
    
    it('Should fail to GET an undefined scene and return 404 status', function(done) {
      request
        .get(url + '/1234567890')
        .send()
        .end(function(res) {
          expect(res.statusCode).to.equal(404);
          done();
        });
    });
    
    it('Should GET a defined scene and return 200 status', function(done) {
      Scene.create({slug: 'beach'}, function(err, scene) {
        request
          .get(url +'/'+ scene._id)
          .send()
          .end(function(res) {
            expect(res.statusCode).to.equal(200);
            expect(res.body.slug).to.equal('beach');
            done();
          });
      });
    });
    
    it('Should GET a scene detail with all child layers included', function(done) {
      var scene, layer;
      
      Q(Scene.create({slug: 'beach'}))
        .then(function(s) {
          scene = s;
          return Layer.create({scene_id: scene._id, slug: 'coconut'});
        })
        .then(function(l) {
          layer = l;
          request
            .get(url +'/'+ scene._id)
            .send()
            .end(function(res) {
              expect(res.statusCode).to.equal(200);
              var layers = res.body.layers;
              
              expect(layers).to.have.length(1);
              expect(String(layers[0]._id)).to.equal(String(layer._id));
              done();
            });
        });
    });
    
    it('Should fail to PUT unknown scene data and return 404 status', function(done) {
      request
        .put(url + '/1234567890')
        .send()
        .end(function(res) {
          expect(res.statusCode).to.equal(404);
          done();
        });
    });
    
    it('Should PUT updated scene data and return 200 status', function(done) {
      Scene.create({slug: 'beach'}, function(err, scene) {
        request
          .put(url +'/'+ scene._id)
          .send({slug: 'cabana'})
          .end(function(res) {
            expect(res.statusCode).to.equal(200);

            Scene.findById(scene._id, function(err, updatedScene) {
              expect(updatedScene.slug).to.equal('cabana');
              done();
            });
          });
      });
    });
    
    it('Should fail to DEL an undefined scene and return 404 status', function(done) {
      request
        .del(url + '/1234567890')
        .send()
        .end(function(res) {
          expect(res.statusCode).to.equal(404);
          done();
        });
    });
    
    it('Should DEL a defined scene and return 200 status', function(done) {
      Scene.create({slug: 'beach'}, function(err, scene) {
        request
          .del(url +'/'+ scene._id)
          .send()
          .end(function(res) {
            expect(res.statusCode).to.equal(200);

            Scene.findById(res.body._id, function(err, removedScene) {
              expect(removedScene).to.be.null;
              done();
            });
          });
      });
    });
    
    it('Should DEL a scene and all of its child layers', function(done) {
      var scene, layer;
      
      // Create a scene:
      Q(Scene.create({slug: 'beach'}))
        // Then create a scene layer:
        .then(function(s) {
          scene = s;
          return Layer.create({scene_id: scene._id, slug: 'coconut'});
        })
        // Then delete the scene via the API:
        .then(function(l) {
          layer = l;
          var deferred = Q.defer();
          
          request
            .del(url +'/'+ scene._id)
            .send()
            .end(function(res) {
              deferred.resolve(res);
            });
            
          return deferred.promise;
        })
        // Then query for the layer:
        .then(function(res) {
          expect(res.statusCode).to.equal(200);
          return Layer.findById(layer._id).exec();
        })
        // Then verify that the layer has been removed:
        .then(function(layer) {
          expect(layer).to.be.null;
          done();
        })
        .done();
    });
  });
  
};