var express = require('express');
var router = express.Router();
var DiagramSchema = require('../models/Diagram');
const script = require('./../script/script.js');
const exec = require('child_process').exec;
let crypto = require('crypto');
var secret = "topsecret"; // Not used - can be implemented later for security
var repoPath = "resources/"
var Git = require("nodegit");
var path = require('path');

//Get all diagrams
router.get('/diagrams', function(req, res, next) {
    DiagramSchema.find(function(err,Diagram){
        if (err) { return next(err); }
        res.json({"data" : Diagram})
        res.status(200);
    });
});


router.post('/diagrams', function(req, res, next) {
	Git.Clone(req.body.GitRepo, repoPath+req.body.GitRepo.slice(19).replace(/\//g, "_"))
    .then(function(repository) {
        path = req.body.GitRepo.slice(19).replace(/\//g, "_");
        res.status.json(script.convertZip(path));
      console.log("Successfully cloned to: " + Diagram.GitRepo);
    });
});

router.get('/diagram/:id', function(req, res, next) {
    DiagramSchema.find({GitRepo: req.params.id}, function(err, repo) {
        if (err) { return next(err); }
        if (repo == null) {
            var RepoPath = "https://github.com/" + path.replace("_",/\//g);
            Git.Clone(RepoPath, repoPath+path)
            .then(function(repository) {
                console.log("Successfully cloned to: " + Diagram.GitRepo);
                return res.status(201).json({"data" : script.convertZip(req.params.id)});
            });
        }
        res.status(200).json({"data" : repo});
    });
});
//// Github listener
////router.post('/', function(req, res, next) {
//    // Encrypt local secret - NOT USED YET !
//    let sig = crypto.createHmac('sha1', secret).update(req.headers['x-hub-signature'].toString()).digest('hex');
//    // Validate local secret against github's secret - NOT USED YET !
//    if (req.headers['x-hub-signature'] == sig) {
//        console.log("Secret Match");
//    }else {
//        console.log("Wrong secret");
//    }
//
//
//    // Clone / Pull the new code
//    Git.Clone("https://github.com/jansson215/TheDistrubutedProject", repoPath)
//    .then(function(repository) {
//        console.log("Successfully cloned to: " + repoPath);
//    res.status(200).json({"Sucess message: ": "Git hook received and new project files are syncronizing"});
//    }).catch(function(err) { 
//        console.log(err);
//        res.status(500).json({"Failure message: ": "Git hook received but new project files couldnt be synced"});
//    });;
//
//
//    res.status(200).json({"Done: ": "Git hook received and new project files are syncronizing"});
//});

 module.exports = router;