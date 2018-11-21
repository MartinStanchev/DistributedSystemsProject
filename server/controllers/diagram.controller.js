var express = require('express');
var router = express.Router();
var ClassSchema = require('../models/Classes');
var DiagramSchema = require('../models/Diagram');

//Get all classes and connection to a diagram
router.get('/:id/classes', function(req, res, next) {
    ClassSchema.find({ Diagram: req.params.id}, function(err, Diagram) {
      if (err) { return next(err); }
      res.status(200).json({"data": Diagram});
    });
});

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
        user :  req.params.id
    });
    Diagram.save(function(err) {
    if (err) {
      return next(err);
    }
      res.status(201).json(Diagram);
    });
});

module.exports = router;