var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var morgan = require('morgan');
var path = require('path');
var script = require('./script/script');
// Variables
//var mongoURI = process.env.MONGODB_URI || 'mongodb://admin:admin123@ds131373.mlab.com:31373/distrubutedsystemsproject';
var mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/distrubutedsystemsproject';
var port = process.env.PORT || 3000;

//script.FindIPs();

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true }, function(err) {
    if (err) {
        console.error(`Failed to connect to MongoDB with URI: ${mongoURI}`);
        console.error(err.stack);
        process.exit(1);
    }
    console.log(`Connected to MongoDB with URI: ${mongoURI}`);
});

// Create Express app
var app = express();
// Parse requests of content-type 'application/json'
app.use(bodyParser.json());
// HTTP request logger
app.use(morgan('dev'));
// Serve static assets (for frontend client)
var root = path.normalize(__dirname + '/..');
app.use(express.static(path.join(root, 'client')));
app.set('appPath', 'client');
// Import routes
app.use(require('./controllers/index'));

// Error handler (must be registered last)
var env = app.get('env');
app.use(function(err, req, res, next) {
    console.error(err.stack);
    var err_res = {
        "message": err.message,
        "error": {}
    };
    if (env === 'development') {
        err_res["error"] = err;
    }
    res.status(err.status || 500);
    res.json(err_res);
});

app.listen(port, function(err) {
    if (err) throw err;
    console.log(`Express server listening on port ${port}, in ${env} mode`);
    console.log(`Backend: http://localhost:${port}/api/`);
    console.log(`Frontend: http://localhost:${port}/`);
});

module.exports = app;