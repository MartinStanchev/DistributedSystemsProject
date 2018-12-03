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
router.get('/diagrams', function (req, res, next) {
    DiagramSchema.find(function (err, Diagram) {
        if (err) { return next(err); }
        res.json({ "data": Diagram })
        res.status(200);
    });
});


router.post('/diagrams', function (req, res, next) {
    Git.Clone(req.body.GitRepo, repoPath + req.body.GitRepo.slice(19).replace(/\//g, "_"))
        .then(function (repository) {
            path = req.body.GitRepo.slice(19).replace(/\//g, "_");
            res.status.json(script.convertZip(path));
            console.log("Successfully cloned to: " + Diagram.GitRepo);
        });
});

router.get('/diagram/:id', function (req, res, next) {
    var link = req.params.id;
    DiagramSchema.find({ GitRepo: link }, function (err, repo) {
        if (err) { return next(err); }
        if (repo.length == 0) {
            console.log(repo);
            var RepoPath = "https://github.com/" + link.replace("_", /\//g);
            Git.Clone(RepoPath, repoPath + path).then(function (repository) {
                var returnedDiagram = script.convertZip(link);
                return res.status(201).json({ "data": returnedDiagram });
            });
        }
        res.status(200).json({ "data": repo });
    });
});

router.patch('/:id', function (req, res, next) {
    var link = req.params.id;
    DiagramSchema.find({ GitRepo: link }, function (err, diagram) {
        if (err) return next(err);
        if (diagram == null) {
            return res.status(404).json({ "message": "Diagram not found" });
        }
        diagram.GitRepo = diagram.GitRepo;
        for (var i = 0; i < req.body.nodeDataArray.length; i++) {
            diagram.Classes[i].name = (req.body.nodeDataArray[i].name || diagram.Classes[i].name);
            for (var j = 0; j < req.body.nodeDataArray[i].properties.length; j++) {
                diagram.Classes[i].properties[j].name = (req.body.nodeDataArray[i].properties[j].name
                    || diagram.Classes[i].properties[j].name);
                diagram.Classes[i].properties[j].type = (req.body.nodeDataArray[i].properties[j].type
                    || diagram.Classes[i].properties[j].type);
                diagram.Classes[i].properties[j].visibility = (req.body.nodeDataArray[i].properties[j].visibility
                    || diagram.Classes[i].properties[j].visibility);
            }
            for (var j = 0; j < req.body.nodeDataArray[i].methods.length; j++) {
                diagram.Classes[i].methods[j].name = (req.body.nodeDataArray[i].methods[j].name
                    || diagram.Classes[i].methods[j].name);
                diagram.Classes[i].methods[j].type = (req.body.nodeDataArray[i].methods[j].type
                    || diagram.Classes[i].methods[j].type);
                for (var k = 0; k < req.body.nodeDataArray[i].methods.parameters.length; k++) {
                    diagram.Classes[i].methods[j].parameters[k].name = (req.body.nodeDataArray[i].methods[j].parameters[k].name
                        || diagram.Classes[i].methods[j].parameters[k].name);
                    diagram.Classes[i].methods[j].parameters[k].type = (req.body.nodeDataArray[i].methods[j].parameters[k].type
                        || diagram.Classes[i].methods[j].parameters[k].type);
                }
                diagram.Classes[i].methods[j].visibility = (req.body.nodeDataArray[i].methods[j].visibility
                    || diagram.Classes[i].methods[j].visibility);
            }
        }
        for (var i = 0; i < req.body.linkDataArray.length; i++){
            diagram.classConecteds[i].from = diagram.classConecteds[i].from;
            diagram.classConecteds[i].to = diagram.classConecteds[i].to;
            diagram.classConecteds[i].relationship = diagram.classConecteds[i].relationship;
        }
        //     GitRepo : { type: String, unique: true},
        // Classes : [{key : String , name : String 
        //     , properties : [{name : String, type : {type : String} , visibility : String }]
        //     , methods:  [{name: String, type: {type : String}, parameters: [{ name: String, type: {type : String}  }], visibility: String  }]}],
        // classConecteds : [{from: String , to : String , relationship : String}]
        // diagram.GitRepo = (req.body.GitRepo || diagram.GitRepo);
        // diagram.Classes.name = (req.body.Classes.name || diagram.Classes.name);
        // diagram.Classes.properties.name = (req.body. || diagram.Classes.properties.name)
        // diagram.classExtends.SubClass = (req.body.classExtends.SubClass || diagram.classExtends.SubClass);
        // diagram.classExtends.SuperClass = (req.body.classExtends.SuperClass || diagram.classExtends.SuperClass);
        // diagram.classConecteds.MainClass = (req.body.classConecteds.MainClass || diagram.classConecteds.MainClass);
        // diagram.classConecteds.UsedClass = (req.body.classConecteds.UsedClass || diagram.classConecteds.UsedClass);
        diagram.save();
        res.status(200).json(diagram);
    })
})
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
