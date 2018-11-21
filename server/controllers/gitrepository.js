var express = require('express');
var router = express.Router();
const exec = require('child_process').exec;
let crypto = require('crypto');
var secret = "topsecret"; // Not used - can be implemented later for security
var repoPath = "server/git_repositories/"
var Git = require("nodegit");
var path = require('path');
var Repo = require('../models/repos');


// Get products with sorting query
router.get('/', function(req, res, next) {
    Repo.find(function(err, repo) {
        if (err) { return next(err); }
        res.status(200).json(repo);
    });
});

// Create new user
router.post('/', function(req, res, next) {
	  
		let repo = new Repo(
        {
            url: req.body.url,
            image: req.body.image // later for diagram? 
        }
    );
    repo.save(function(err) {
        if (err) {
            return next(err);
        }
//         let sig = crypto.createHmac('sha1', secret).update(req.headers['x-hub-signature'].toString()).digest('hex');
    // Validate local secret against github's secret - NOT USED YET !
//    if (req.headers['x-hub-signature'] == sig) {
//        console.log("Secret Match");
//    }else {
//        console.log("Wrong secret");
//    }
	
	    Git.Clone(repo.url, repoPath+repo.url.slice(19).replace(/\//g, "_"))
    .then(function(repository) {
        console.log("Successfully cloned to: " + repoPath);
    res.status(200).json({"Sucess message: ": "Git hook received and new project files are syncronizing"});
    }).catch(function(err) { 
        console.log(err);
        res.status(500).json({"Failure message: ": "Git hook received but new project files couldnt be synced"});
    });

    })
});


router.get('/:id', function(req, res, next) {
    Repo.findById(req.params.id, function(err, repo) {
        if (err) { return next(err); }
        if (user == null) {
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



module.exports = router