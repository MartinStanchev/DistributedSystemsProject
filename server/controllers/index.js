var path = require('path');
var express = require('express');
var router = express.Router()

router.get('/api', function(req, res) {
    res.json({"message": "Welcome to DistrubutedSystemsProject - backend!"});
});

// Insert routes below
router.use('/api/gitrepository', require('./gitrepository'));
router.use('/api/xml', require('./xmlEncoder.js'));
router.use('/api/gitrepo', require('./gitrepo.controller'));
router.use('/api/diagrams', require('./diagram.controller'));



router.route('/*').get(function (req, res) {
    var relativeAppPath = req.app.get('appPath');
    var absoluteAppPath = path.resolve(relativeAppPath);
    res.sendFile(absoluteAppPath + '/index.html');
});

module.exports = router
