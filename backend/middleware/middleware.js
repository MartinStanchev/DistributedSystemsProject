var express = require("express");
var router = express.Router();
var DiagramSchema = require("../models/Diagram");
const script = require("../script/script.js");
const nmap = require("../script/nmap.js");
var repoPath = "resources/";
var Git = require("nodegit");
var path = require("path");
var axios = require("axios");
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
router.get("/ip/:id", function(req, res, next) {
  var ip = req.params.id;
  var localip = nmap.FindLocalIP();
  nmap.SetIPs(ip);
  res.status(200).json({ ip: localip });
});

//middleware post
router.post("/diagrams", function(req, res, next) {
  var link = req.body.GitRepo.slice(19).replace(/\//g, "_");
  var push_date = new Date(req.body.pushed_at);
  console.log("PUSHED AT DATE: " + push_date);
  var ips = nmap.GetIPs();
  var found = false;
  var request = [];
  for (var i = 0; i < ips.length; i++) {
    request.push(axios.get("http://" + ips[i] + ":3000/api/diagram/" + link));
  }
  axios.all(request).then(
    axios.spread((...args) => {
      for (let i = 0; i < args.length; i++) {
        console.log(args[i].status );
        if (args[i].data.data != "" && args[i].status != 500) {
                          // TODO - see the push date:
                /*
                var repoFound = args[i].data;
                if(push_date > repoFound.LatestPush) {
                    console.log("There is a newer version / later push than this one")
                }
                */
          res.status(200).json(args[i].data);
          found = true;
        }
      }

      if (found == false) {
        DiagramSchema.find({ GitRepo: link }, function(err, diagram) {
          if (err) return next(err);
          if (
            (diagram == null ||
            diagram == [] ||
            diagram.length == 0 ||
            diagram == "") ||
            diagram[0].LatestPush < push_date
          ) {

              if(typeof diagram[0] !== 'undefined'){
                if(diagram[0].LatestPush < push_date) {
                    console.log("Diagram found but a newer version is pushed, updating the database");
                    DiagramSchema.find({ GitRepo: link }).remove().exec(); // Remove the entry in database

                }  
            }

            Git.Clone(req.body.GitRepo, repoPath + link).then(function(
              repository
            ) {
              path = link;
              console.log("second response");
              res.status(201).json(script.convertZip(path, push_date));
              Console.log("Successfully cloned to: " + Diagram.GitRepo);
            });
          } else {
            console.log("Found diagram in database that is the newest version.")
            console.log(diagram[0].LatestPush < push_date);
            console.log("third response");
            res.status(200);
          }
        });
      }
    })
  );
});

// update classes,
router.patch("/diagram/:id", function(req, res, next) {
  var link = req.params.id;
  DiagramSchema.find({ GitRepo: link }, function(err, diagram) {
    if (err) return next(err);
    if (diagram == null) {
      return res.status(404).json({ message: "Diagram not found" });
    }
    if (diagram.length == 0) {
      return res.status(404).json({ message: "Diagram not found" });
    }
    if (diagram.length != 0) {
      diagram[0].Classes = req.body.Classes || diagram[0].Classes;
      diagram[0].classConecteds =
        req.body.classConecteds || diagram[0].classConecteds;
      diagram[0].save();
      res.status(200).json({ data: diagram[0] });
    }
    req.io.emit("updateDiagram", "test");
  });
});

// adding new comments to the diagram,update the diagram by adding new comment
// find the diagram by thr given id (repo), then add the new comment
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
    req.io.emit("updateDiagram", "test");
  });
});

router.get("/update/:id", function(req, res, next) {
  connections.push(res);
  console.log("inupdate for: " + req.body.id);
  if (respondToPolls === true) {
    respondToPolls = false;
    var link = req.body.id;
    console.log("responding: " + connections.length);
  }
});

//middleware get
router.get("/diagrams/:id", function(req, res, next) {
  var link = req.params.id;
  var ips = nmap.GetIPs();
  var found = false;
  var request = [];
  for (var i = 0; i < ips.length; i++) {
    request.push(axios.get("http://" + ips[i] + ":3000/api/diagram/" + link));
  }
  axios.all(request).then(
    axios.spread((...args) => {
      for (let i = 0; i < args.length; i++) {
        console.log(args[i].status );

        if (args[i].data.data != "") {
          res.status(200).json(args[i].data);
          found = true;
        }
        else if(args[i].status == 500){
          found = false;
        }
      }
      if (found == false) {
        DiagramSchema.find({ GitRepo: link }, function(err, repo) {
          if (err) {
            return next(err);
          }
          res.status(200).json({ data: repo });
        });
      }
    })
  );
});

//local get
router.get("/diagram/:id", function(req, res, next) {
  var link = req.params.id;
  DiagramSchema.find({ GitRepo: link }, function(err, repo) {
    if (err) {
      res.status(500)
      return next(err);
x    }
    res.status(200).json({ data: repo });
  });
});

router.get("/nmap", function(req, res, next) {
  nmap.FindIPs();
});

module.exports = router;
 