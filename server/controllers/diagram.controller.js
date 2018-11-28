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
router.get('/', function(req, res, next) {
    DiagramSchema.find(function(err,Diagram){
        if (err) { return next(err); }
        res.json({"data" : Diagram})
        res.status(200);
    });
});

router.post('/', function(req, res, next) {
    var Diagram = new DiagramSchema({	
        GitRepo :  req.body.GitRepo,	
        Classes : req.body.Classes,	
        classExtends : req.body.classExtends,	
        classConecteds : req.body.classConecteds	
    });	
    Diagram.save(function(err) {	
    if (err) {	
      return next(err);	
    }

	Git.Clone(Diagram.GitRepo, repoPath+Diagram.GitRepo.slice(19).replace(/\//g, "_"))
    .then(function(repository) {
        path = Diagram.GitRepo.slice(19).replace(/\//g, "_");
        console.log("Successfully cloned to: " + Diagram.GitRepo);
        script.convertZip(path);
    res.status(200).json({"Sucess message: ": "Git hook received and new project files are syncronizing"});
    }).catch(function(err) { 
        console.log(err);
        res.status(500).json({"Failure message: ": "Git hook received but new project files couldnt be synced"});
    });
});
});

router.get('/prosses', function(req, res, next) {
    var value=  script.readXML();
    res.json({"data" : value})
    res.status(200);
});


router.get('/:id', function(req, res, next) {
    DiagramSchema.findById(req.params.id, function(err, repo) {
        if (err) { return next(err); }
        if (Diagram == null) {
            return res.status(404).json({"message": "Repo not found"});
        }
        res.status(200).json(repo);
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