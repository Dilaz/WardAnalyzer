var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var q = require('q');
var http = require('http');
var cheerio = require('cheerio');
var debug = require('debug')('wardanalyzer')

var routes = require('./routes/index');
var teams = require('./routes/teams');

var teamList = {};

debug('Loading teams...');
q.promise(function(resolve, reject) {
	debug('Request');
	http.get({
		hostname: 'www.datdota.com',
		port: 80,
		path: '/teams.php?p=stats',
		agent: false
	}, function(res) {
		var body = '';
		res.on('data', function(d) {
			body += d;
		})
		res.on('end', function() {
			resolve(body);
		});
	})
})
.then(function(data) {
	var $ = cheerio.load(data);
	$('.dataTable tbody tr').each(function(i, el) {
		var team = $(this).find('td a');
		try {
			var teamname = team.text().replace(/[^a-z0-9 -_\.,]/i, '').toLowerCase()
			var teamId = team.attr('href').match(/[0-9]+/)[0];
			if (!teamList[teamname]) {
				teamList[teamname] = teamId;
			}
		}
		catch (e) {
			// ...
		}
	});

	debug('%d teams loaded!', Object.keys(teamList).length);
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(require('node-compass')({mode: 'expanded'}));
app.use(express.static(path.join(__dirname, 'public')));
app.disable('x-powered-by');

app.use(function(req, res, next) {
	req.teams = teamList;
	next();
});

app.use('/', routes);
app.use('/team', teams)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});


module.exports = app;
