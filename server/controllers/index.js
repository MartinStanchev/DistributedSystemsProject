var path = require('path');
var express = require('express');
var router = express.Router()

const axios = require('axios');
// GITHUB id and secret to be able to make requests to their server
const clientID = 'f14a59521bfa07c193ef'
const clientSecret = 'bbd64cbf98fb58b99d4fad2ed8a0b85763121e41'

router.get('/api', function(req, res) {
    res.json({"message": "Welcome to DistrubutedSystemsProject - backend!"});
});

router.get('/oauth/redirect', (req, res) => {
    const requestToken = req.query.code
  axios({
    method: 'post',
    url: `https://github.com/login/oauth/access_token?client_id=${clientID}&client_secret=${clientSecret}&code=${requestToken}`,
    headers: {
      accept: 'application/json'
    }
  }).then((response) => {
    const accessToken = response.data.access_token
    res.redirect(`/welcome.html?access_token=${accessToken}`)
  })
})

// Insert routes below
router.use('/api/repos', require('./gitrepository'));



router.route('/*').get(function (req, res) {
    var relativeAppPath = req.app.get('appPath');
    var absoluteAppPath = path.resolve(relativeAppPath);
    res.sendFile(absoluteAppPath + '/index.html');
});

module.exports = router