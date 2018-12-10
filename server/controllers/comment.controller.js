var express = require('express');
var router = express.Router();
var Comment = require('../models/Comment');
var Diagram = require('../models/Diagram');

router.get('/:id', (req, res, next)=>{
    var diagramId = req.params.id;
    Comment.findOne({diagramId: diagramId}).
    populate('Comments').
    exec((err, Comment)=>{
        if(err) return (next.err);
        res.status(200).json(Comment);
    });
})

router.post('/', (req, res, next)=>{
    var newComment = new Comment(req.body)
    newComment.save((err)=>{
        if(err) return next(err);
        res.status(201).json(newComment);
    })
})

module.exports = router