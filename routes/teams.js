var express = require('express');
var router = express.Router();
var http = require('http');
var cheerio = require('cheerio');
var q = require('q');
var debug = require('debug')('wardanalyzer')

/* GET home page. */
router.get('/', function(req, res, next) {
	var team = req.query.team;

	if (!team) {
		return next(new Error('Not found'));
	}

	// Get the team
	getTeamWars(team)
	.then(function(data) {
		return res.json(data);
	})
	.catch(function(err) {
		next(err);
	});

});

function getTeamWars(team) {
	var url = '/team.php?q=376&team=' + team + '&p=ward&ward=0&patch=0';
	return q.promise(function(resolve, reject) {
		http.get({
			hostname: 'www.datdota.com',
			port: 80,
			path: url,
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
		var list = [];
		var team = $('h3').text();

		$('.dataTable tbody tr').each(function() {
			 var datas = $(this).find('td');

			 list.push({
			 	match: datas.eq(0).text(),
			 	type: datas.eq(2).text(),
			 	start: datas.eq(3).text(),
			 	x: datas.eq(9).text(),
			 	y: datas.eq(10).text(),
			 });
		});

		return {team: team, wards: list};
	});
}

module.exports = router;
