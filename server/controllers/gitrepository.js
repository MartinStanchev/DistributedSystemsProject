var express = require('express');
var router = express.Router();
const exec = require('child_process').exec;
let crypto = require('crypto');
var secret = "topsecret"; // Not used - can be implemented later for security
var repoPath = "server/git_repository/TheDistrubutedProject"
var Git = require("nodegit");
var path = require('path');

// Return something just for testing!
router.get('/', function(req, res, next) {
    console.log("Get  called");
    res.json({"message": "Githandler Get request - gitrepository!"});
});




// Github listener
router.post('/', function(req, res, next) {
    // Encrypt local secret - NOT USED YET !
    let sig = crypto.createHmac('sha1', secret).update(req.headers['x-hub-signature'].toString()).digest('hex');
    // Validate local secret against github's secret - NOT USED YET !
    if (req.headers['x-hub-signature'] == sig) {
        console.log("Secret Match");
    }else {
        console.log("Wrong secret");
    }


    // Clone / Pull the new code
    Git.Clone("https://github.com/jansson215/TheDistrubutedProject", repoPath)
    .then(function(repository) {
        console.log("Successfully cloned to: " + repoPath);
    res.status(200).json({"Sucess message: ": "Git hook received and new project files are syncronizing"});
    }).catch(function(err) { 
        console.log(err);
        res.status(500).json({"Failure message: ": "Git hook received but new project files couldnt be synced"});
    });;


    res.status(200).json({"Done: ": "Git hook received and new project files are syncronizing"});
});



module.exports = router