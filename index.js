const express = require('express');
const axios = require('axios');

const clientID = 'f14a59521bfa07c193ef'
const clientSecret = 'bbd64cbf98fb58b99d4fad2ed8a0b85763121e41'

const app = express()
app.use(express.static(__dirname + '/public'))

app.get('/oauth/redirect', (req, res) => {
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

app.listen(3000)