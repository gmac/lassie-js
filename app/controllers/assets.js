'use strict';

var fs = require('fs');
var generic = require('./generic');
var Asset = require('../models/asset');

exports.getAll = generic.getAll(Asset);
exports.getOne = generic.getOne(Asset);
exports.create = generic.create(Asset);
exports.update = generic.update(Asset);
exports.destroy = generic.destroy(Asset);

exports.upload = function(req, res) {

	fs.readFile(req.files.image.path, function (err, data) {

		var imageName = req.files.image.name
    
		/// If there's an error
		if(!imageName){

			console.log("There was an error")
			res.redirect("/");
			res.end();

		} else {
		  var newPath = __dirname + "/../../uploads/" + imageName;
      console.log(newPath);
      
		  /// write file to uploads/fullsize folder
		  fs.writeFile(newPath, data, function (err) {
		  	res.redirect("/uploads/" + imageName);
		  });
		}
	});
};