var express = require('express');
var router = express.Router();
var UserSchema = require('../models/users');

router.post('/', function(req, res, next) {
    var User = new UserSchema({
        Email :  req.body.ClassName,
        Password : req.body.SubClass,
        OtherUsers : req.body.SuperClass,
        GitRepo : req.body.relation
    });
    User.save(function(err) {
    if (err) {
      return next(err);
    }
      res.status(201).json(User);
    });
});

router.get('/', function(req, res, next) {
    UserSchema.find(function(err,UserSchema){
    if (err) { return next(err); }
    res.json({"Users" : UserSchema})
    res.status(200);
});
});

module.exports = router;