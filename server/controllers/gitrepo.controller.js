var express = require('express');
var router = express.Router();
var GitSchema = require('../models/GitSchema');
var DiagramSchema = require('../models/Diagram');
const script = require('../script');

router.post('/', function(req, res, next) {
    var User = new GitSchema({
        GitRepo :  req.body.req
    });
    User.save(function(err) {
    if (err) {
      return next(err);
    }
      res.status(201).json(User);
    });
});

router.get('/', function(req, res, next) {
    GitSchema.find(function(err,GitSchema){
    if (err) { return next(err); }
    res.json({"Data" : GitSchema})
    res.status(200);
});
});

router.get('/:id', function(req, res, next) {
    GitSchema.findById(req.params.id,function(err,GitSchema){
    if (err) { return next(err); }
    res.json({"Data" : GitSchema})
    res.status(200);
    });
});


router.get('/repo', function(req, res, next) {
    DiagramSchema.find({GitRepo : req.body.GitRepo},function(err,DiagramSchema){
    if (err) { return next(err); }
    res.json({"Data" : DiagramSchema})
    res.status(200);
    });
});
module.exports = router;