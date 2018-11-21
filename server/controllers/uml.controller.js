var express = require('express');
var router = express.Router();
var ClassSchema = require('../models/Classes');
const script = require('../script');

router.get('/', function(req, res, next) {
        ClassSchema.find(function(err,ClassSchema){
        if (err) { return next(err); }
        res.json({"Classes" : ClassSchema})
        res.status(200);
  });
});

router.get('/prosses', function(req, res, next) {
   var value=  script.readXML();
   res.json({"data" : value})
   res.status(200);
});

router.get('/:id', function(req, res, next) {
	ClassSchema.findById(req.params.id, function (err, ClassSchema) {
		if (err) { return next(err); }
		res.status(200).json({"data":ClassSchema});
	});
});

router.post('/', function(req, res, next) {
    var Class = new ClassSchema({
        ClassName :  req.body.ClassName,
        SubClass : req.body.SubClass,
        SuperClass : req.body.SuperClass,
        relation : req.body.relation,
    });
    Class.save(function(err) {
    if (err) {
      return next(err);
    }
      res.status(201).json(Class);
    });
});

module.exports = router;