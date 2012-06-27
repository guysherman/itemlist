var express = require('express'),
	fs = require('fs'),
	url = require('url'),
	uuid = require('node-uuid'),
	_ = require('underscore');
	
var server = express.createServer();
server.use(express.bodyParser());
var dummyDocuments = [];


server.get("/index.html", function(req, res) {
	var newId = uuid.v4();
	dummyDocuments.push( { id: newId , activities: [ {id: uuid.v4(), "title":"Default Activity","description":"","deadline":""} ] } );
	
	fs.readFile("." + url.parse(req.url).pathname, function(err, data) {
		if (err) {
			console.log(err);
		} else {
			var dataStr = new String(data);
			res.header('Content-Type', 'text/html');
			var result = dataStr.replace(":id:", newId);
			res.send(200, result);
		}
	});
});

server.get("/itemlist.js", function(req, res) {
	fs.readFile("." + url.parse(req.url).pathname, function(err, data) {
		if (err) {
			console.log(err);
		} else {
			res.header('Content-Type', 'text/html');
			res.send(200, data);
		}
	});
});

server.get("/activities/:id", function(req, res) {
	var documentToReturn = _(dummyDocuments).select(function(doc) {
		return doc.id === req.params.id;
	})[0];
	
	res.header('Content-Type', 'application/json');
	res.send(200, documentToReturn.activities);
});

server.post("/activities/:id", function(req, res) {
	var documentToReturn = _(dummyDocuments).select(function(doc) {
		return doc.id === req.params.id;
	})[0];
	
	var activity = req.body;
	activity.id = uuid.v4();
	
	documentToReturn.activities.push(activity);
	
	res.send(200, activity);
});

server.del("/activities/:id/:aid", function(req, res) {
	var documentToReturn = _(dummyDocuments).select(function(doc) {
		return doc.id === req.params.id;
	})[0];
	
	var activity = _(documentToReturn.activities).select(function(act) {
		return act.id == req.params.aid;
	})[0];
	
	documentToReturn.activities = _(documentToReturn.activities).without(activity);
	
	res.send(200, documentToReturn.activities);
});






server.listen(8080);