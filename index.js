var express = require('express');

var app = express();
app.use('/static', express.static('static'));

var port = 8000;
app.listen(port, function () {
	console.log('App listening.')
});
