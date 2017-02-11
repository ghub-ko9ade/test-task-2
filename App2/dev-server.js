
var http = require('http');
var express = require('express');
var path = require('path');
var config = require('./dev-server.conf');

var app = express();

// Serve static
var root = process.env.SRV_ROOT || config.http.root;
app.use(express.static(path.join(__dirname, root), {
	dotfiles: 'ignore',
	index: false,
	maxAge:7*24*3600
}));

app.get('*', function(req, res, next) {
	var err = new Error();
	err.status = 404;
	next(err);
});

app.use(function (err, req, res, next) {
	res
		.status(err.status ? err.status : 500)
		.send({error:app.get('env') === 'production' ? {status: err.status, message: err.message} : err});
	/*res.render('error', {error:app.get('env') === 'production' ? {status: err.status, message: err.message} : err})*/;
});

var port = parseInt(process.env.SRV_PORT) || config.http.port;

app.listen(config.http.port, function() {
	console.log('Express server started at localhost:' + port + ', root folder "' + root + '"');
	console.log('NODE_ENV:', app.get('env'), ';');
});

module.exports = app;
