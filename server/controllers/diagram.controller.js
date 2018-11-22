var express = require('express');
var router = express.Router();
var DiagramSchema = require('../models/Diagram');
const script = require('../script');

//Get all diagrams
router.get('/', function(req, res, next) {
    DiagramSchema.find(function(err,DiagramSchema){
        if (err) { return next(err); }
        res.json({"data" : DiagramSchema})
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
      res.status(201).json(Diagram);
    });
});

router.get('/prosses', function(req, res, next) {
    var value=  script.readXML();
    res.json({"data" : value})
    res.status(200);
});

 module.exports = router;