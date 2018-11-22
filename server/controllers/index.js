var path = require('path');
var express = require('express');
var router = express.Router()

router.get('/api', function(req, res) {
    res.json({"message": "Welcome to backend"});
});

// Insert routes below
router.use('/api/xml', require('./xmlEncoder.js'));

router.route('/*').get(function (req, res) {
    var relativeAppPath = req.app.get('appPath');
    var absoluteAppPath = path.resolve(relativeAppPath);
    res.sendFile(absoluteAppPath + '/index.html');
});

module.exports = router
