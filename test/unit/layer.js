'use strict';
var Q = require('q');
var request = require('superagent');
var mocha = require('mocha');
var chai = require('chai');
var expect = chai.expect;
var Scene = require('../../app/models/scene');
var Layer = require('../../app/models/layer');

module.exports = function(url) {
  url += '/layers';
  
  var sceneId;
  
  describe('Layer Routes', function() {
    beforeEach(function(done) {
      Scene.create({slug: 'test'}, function(err, scene) {
        sceneId = scene._id;
        done();
      });
    });
    
    afterEach(function(done) {
      var sp = Scene.remove({}).exec();
      var lp = Layer.remove({}).exec();
      Q.all([sp, lp]).then(function() {
        done();
      });
    });
    
    it('Should create a new layer using POST', function(done) {
      request
        .post(url)
        .send({
          scene_id: sceneId,
          slug: 'coconut'
        })
        .end(function(res) {
          expect(res.statusCode).to.equal(200);
          expect(res.body.slug).to.equal('coconut');
          //expect(res.body).to.have.keys('_id', 'name');
          done();
        });
    });
    
    it('Should fail to GET an undefined layer and return 404 status', function(done) {
      request
        .get(url + '/1234567890')
        .send()
        .end(function(res) {
          expect(res.statusCode).to.equal(404);
          done();
        });
    });
    
    it('Should GET a defined layer and return 200 status', function(done) {
      Layer.create({scene_id: sceneId, slug: 'coconut'}, function(err, layer) {
        request
          .get(url +'/'+ layer._id)
          .send()
          .end(function(res) {
            expect(res.statusCode).to.equal(200);
            expect(res.body.slug).to.equal('coconut');
            done();
          });
      });
    });
    
    it('Should fail to PUT unknown layer data and return 404 status', function(done) {
      request
        .put(url + '/1234567890')
        .send()
        .end(function(res) {
          expect(res.statusCode).to.equal(404);
          done();
        });
    });
    
    it('Should PUT updated layer data and return 200 status', function(done) {
      Layer.create({scene_id: sceneId, slug: 'coconut'}, function(err, layer) {
        request
          .put(url +'/'+ layer._id)
          .send({slug: 'palm'})
          .end(function(res) {
            expect(res.statusCode).to.equal(200);
            
            Layer.findById(layer._id, function(err, updatedLayer) {
              expect(updatedLayer.slug).to.equal('palm');
              done();
            });
          });
      });
    });
    
    it('Should fail to DEL an undefined layer and return 404 status', function(done) {
      request
        .del(url + '/1234567890')
        .send()
        .end(function(res) {
          expect(res.statusCode).to.equal(404);
          done();
        });
    });
    
    it('Should DEL a defined layer and return 200 status', function(done) {
      Layer.create({scene_id: sceneId, slug: 'coconut'}, function(err, layer) {
        request
          .del(url +'/'+ layer._id)
          .send()
          .end(function(res) {
            expect(res.statusCode).to.equal(200);

            Layer.findById(layer._id, function(err, removedLayer) {
              expect(removedLayer).to.be.null;
              done();
            });
          });
      });
    });
  });
  
};