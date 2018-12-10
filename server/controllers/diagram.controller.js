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
var request = require('request');
var axios = require('axios');

//Get all diagrams
/*
router.get('/diagrams', function (req, res, next) {
    DiagramSchema.find(function (err, Diagram) {
        if (err) { return next(err); }
        res.json({ "data": Diagram })
        res.status(200);
    });
});
*/
//to check availbe ips and to add new ip in the array
router.get('/ip/:id', function (req, res, next) {
    var ip = req.params.id;
    var localip = script.FindLocalIP();
    script.SetIPs(ip);
    res.status(200).json({"ip" : localip});
});

//middleware post
router.post('/diagrams', function (req, res, next) {
    var link = req.body.GitRepo.slice(19).replace(/\//g, "_");
    var ips = script.GetIPs();
    var found = false;
    for(var i = 0 ; i < ips.length ; i++){
        var url = "http://" + ips[i] +":3000/api/diagram/" + link;
        request(url, function(error , response , body){
            if(response != undefined){
                if(response.body != undefined){
                    if(JSON.parse(response.body).data.length > 0){
                        console.log("first response");
                        res.status(200);
                        found = true;
                    }
                }
            }
        });
    }
    setTimeout(function() {  
        if(found == false){
            DiagramSchema.find({ GitRepo: link }, function (err, diagram) {
                if (err) return next(err);
                if (diagram == null || diagram == [] || diagram.length == 0) {  
                    Git.Clone(req.body.GitRepo, repoPath + link)
                    .then(function (repository) {
                    path = link;
                    console.log("second response");
                    res.status(201).json(script.convertZip(path));
                    Console.log("Successfully cloned to: " + Diagram.GitRepo);
                });}
                else{             
                    console.log("third response");
                    res.status(200);
                }
            }); 
        }
        else{
        }
    }, 3000);
});

router.patch('/diagram/:id', function (req, res, next) {
    var link = req.params.id;
    DiagramSchema.find({ GitRepo: link }, function (err, diagram) {
        if (err) return next(err);
        if (diagram == null) {
            return res.status(404).json({ "message": "Diagram not found" });
        }
        if(diagram.length != 0){
            diagram[0].Classes = (req.body.Classes|| diagram[0].Classes);
            diagram[0].classConecteds = (req.body.classConecteds || diagram[0].classConecteds);
            diagram[0].save();
            res.status(200).json({"data" : diagram[0]});  
        }
    });
});

//middleware get
router.get('/diagrams/:id', function (req, res, next) {
    var link = req.params.id;
    var ips = script.GetIPs();
    var found = false;
    var request = [];
    var myObject = [];
    for(var i = 0 ; i < ips.length ; i++){
        request.push(axios.get("http://" + ips[i] +":3000/api/diagram/" + link));
    }
    axios.all(request).then(axios.spread((...args) => {
        for (let i = 0; i < args.length; i++) {
            console.log("args : " + args[i].data);
            console.log("args" + args[i]);
            myObject[args[i]] = args[i].data;

            if(args[i].data != undefined){
                if(args[i].data.body != undefined){
                    console.log(JSON.parse(args[i].data.body).data);
                    if(JSON.parse(args[i].data.body).data.length > 0){
                        console.log(JSON.parse(args[i].data.body).data);
                        console.log("fourt response");
                        res.status(200).json(JSON.parse(args[i].data.body));
                        found = true;
                    }
                }
            }

        }
        if(found == false){
            DiagramSchema.find({ GitRepo: link }, function (err, repo) {
                if (err) { return next(err); }
                console.log("fift response");
                res.status(200).json({ "data": repo });
            });
        }
    }));

    /*for(var i = 0 ; i < ips.length ; i++){
        var url = "http://" + ips[i] +":3000/api/diagram/" + link;
        request(url, function(error , response , body){
            if(response != undefined){
                if(response.body != undefined){
                    console.log(JSON.parse(response.body).data);
                    if(JSON.parse(response.body).data.length > 0){
                        console.log(JSON.parse(response.body).data);
                        console.log("fourt response");
                        res.status(200).json(JSON.parse(response.body));
                        found = true;
                    }
                }
            }

        });
    }
        if(found == false){
            DiagramSchema.find({ GitRepo: link }, function (err, repo) {
                if (err) { return next(err); }
                console.log("fift response");
                res.status(200).json({ "data": repo });
            });
        } */
});   

//local get
router.get('/diagram/:id', function (req, res, next) {
    var link = req.params.id;
    DiagramSchema.find({ GitRepo: link }, function (err, repo) {
        if (err) { return next(err); }
        res.status(200).json({ "data": repo });
    });
});

//local post
router.post('/diagram', function (req, res, next) {
    DiagramSchema.find({ GitRepo: req.body.GitRepo.slice(19).replace(/\//g, "_") }, function (err, diagram) {
        if (err) return next(err);
        if (diagram == null || diagram == [] || diagram.length == 0) {    
            Git.Clone(req.body.GitRepo, repoPath + req.body.GitRepo.slice(19).replace(/\//g, "_"))
            .then(function (repository) {
            path = req.body.GitRepo.slice(19).replace(/\//g, "_");
            res.status(201).json(script.convertZip(path));
            console.log("Successfully cloned to: " + Diagram.GitRepo);
        });}
        res.status(200);

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
