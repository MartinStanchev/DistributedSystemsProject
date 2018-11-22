var express = require('express');
var router = express.Router();
var shell = require('shelljs');


router.get('/', function(req, res, next) {
    var res_dir = shell.pwd() + '/resources';
    var srcml = shell.pwd() + '/srcML/bin/srcml ';
    if(shell.ls('-A', res_dir)) {
        shell.echo('dir exists');
        if(shell.exec( srcml + res_dir + '/javaProject.zip -o ' + res_dir + '/q2.xml').code !== 0) {
            shell.echo('Error: srcml command failed.');
            shell.exit(1);
        }

    } else {
        res.status('404').json({"message":"No file in directory resources"});
    }
});

module.exports = router