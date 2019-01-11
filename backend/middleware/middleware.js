var express = require("express");
var router = express.Router();
var DiagramSchema = require("../models/Diagram");
const script = require("../script/script.js");
const nmap = require("../script/nmap.js");
var repoPath = "resources/";
var Git = require("nodegit");
var path = require('path');
var axios = require('axios');
var connections = [];
var respondToPolls = false;

//Get all diagrams
router.get("/diagrams", function(req, res, next) {
  DiagramSchema.find(function(err, Diagram) {
    if (err) {
      return next(err);
    }
    res.json({ data: Diagram });
    res.status(200);
  });
});

//to check availbe ips and to add new ip in the array
router.get('/ip/:id', function (req, res, next) {
    var ip = req.params.id;
    var localip = nmap.FindLocalIP();
    nmap.SetIPs(ip);
    res.status(200).json({"ip" : localip});
});

//middleware post
router.post('/diagrams', function (req, res, next) {
    var link = req.body.GitRepo.slice(19).replace(/\//g, "_");
    var ips = nmap.GetIPs();
    var found = false;
    var request = [];
    for(var i = 0 ; i < ips.length ; i++){
        request.push(axios.get("http://" + ips[i] +":3000/api/diagram/" + link));
    }
    axios.all(request).then(axios.spread((...args) => {
        for (let i = 0; i < args.length; i++) {
            if(args[i].data.data != ""){
                res.status(200).json(args[i].data);
                found = true;
            }
        }
        if(found == false){
            DiagramSchema.find({ GitRepo: link }, function (err, diagram) {
                if (err) return next(err);
                if (diagram == null || diagram == [] || diagram.length == 0 || diagram == "") {  
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
    }));
});   

// update classes
router.patch("/diagram/:id", function(req, res, next) {
  var link = req.params.id;
  DiagramSchema.find({ GitRepo: link }, function(err, diagram) {
    if (err) return next(err);
    if (diagram == null) {
      return res.status(404).json({ message: "Diagram not found" });
    }
    if (diagram.length != 0) {
      diagram[0].Classes = req.body.Classes || diagram[0].Classes;
      diagram[0].classConecteds =
        req.body.classConecteds || diagram[0].classConecteds;
      diagram[0].save();
      res.status(200).json({ data: diagram[0] });
    }
    req.io.emit('updateDiagram' , 'test');
  });
});

// adding new comments to the diagram
router.patch("/diagram/add/:id", function(req, res, next) {
  var link = req.params.id;
  DiagramSchema.findOne({ GitRepo: link }, function(err, diagram) {
    if (err) return next(err);
    if (diagram == null) {
      return res.status(404).json({ message: "Diagram not found" });
    }

    diagram.comments.push(req.body);
    diagram.save();
    res.status(200).json({ data: diagram });
    req.io.emit('updateDiagram' , 'test');
  });
});

//local patch
/*router.patch('/diagram/:id', function (req, res, next) {
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
        var resp;
        for(var i = 0; i < connections.length; i++) {
                resp = connections.pop();
                DiagramSchema.find({ GitRepo: link }, function (err, repo) {
                    if (err) { return next(err); }
                    resp.status(200).json({ "data": repo });
                    resp.end();
                });
        }
    respondToPolls = true;
});
*/
router.get('/update/:id', function(req, res, next) {
    connections.push(res);
    console.log('inupdate for: ' + req.body.id);
    if(respondToPolls === true) {
        respondToPolls = false;
        var link = req.body.id;
        console.log('responding: ' + connections.length);
        // connections.forEach(function(resp) {
        //     DiagramSchema.find({ GitRepo: link }, function (err, repo) {
        //         if (err) { return next(err); }
        //         resp.status(200).json({ "data": repo });
        //         resp.end();
        //     });
        // });
        // var resp;
        // for(var i = 0; i < connections.length; i++) {
        //     resp = connections.pop();
        //     DiagramSchema.find({ GitRepo: link }, function (err, repo) {
        //         if (err) { return next(err); }
        //         resp.status(200).json({ "data": repo });
        //         resp.end();
        //     });
        // }
    }


});

//middleware patch
router.patch('/diagrams/:id', function (req, res, next) {
    var link = req.params.id;
    var ips = nmap.GetIPs();
    var excistIP;
    var found = false;
    var request = [];
    for(var i = 0 ; i < ips.length ; i++){
        request.push(axios.get("http://" + ips[i] +":3000/api/diagram/" + link));
    }
    axios.all(request).then(axios.spread((...args) => {
        for (let i = 0; i < args.length; i++) {
            if(args[i].data.data != ""){
                found = true;
                console.log(args[i].data);
             //   excistIP = args[i].data;
             //   var url = "http://" + excistIP +":3000/api/diagram/" + link
                /*axios.post(url, {
                    Classes: req.body.Classes,
                    classConecteds: req.body.classConecteds
                  })
                  .then(function (response) {
                    console.log(response);
                  })*/
            }
        }
        /* if(found == false){
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
        }*/
    }));
});

//middleware get
router.get('/diagrams/:id', function (req, res, next) {
    var link = req.params.id;
    var ips = nmap.GetIPs();
    var found = false;
    var request = [];
    for(var i = 0 ; i < ips.length ; i++){
        request.push(axios.get("http://" + ips[i] +":3000/api/diagram/" + link));
    }
    axios.all(request).then(axios.spread((...args) => {
        for (let i = 0; i < args.length; i++) {
            if(args[i].data.data != ""){
                res.status(200).json(args[i].data);
                found = true;
            }
        }
        if(found == false){
            DiagramSchema.find({ GitRepo: link }, function (err, repo) {
                if (err) { return next(err); }
                res.status(200).json({ "data": repo });
            });
        }
    }));
});   

//local get
router.get('/diagram/:id', function (req, res, next) {
    var link = req.params.id;
    DiagramSchema.find({ GitRepo: link }, function (err, repo) {
        if (err) { return next(err); }
        res.status(200).json({"data": repo});
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
