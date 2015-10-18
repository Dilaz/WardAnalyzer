var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	var team = req.params.team;
	if (!team) {
		res.render('index', { title: 'WardAnalyzer 0.0.1' });
	}
	else {

	}
});


module.exports = router;
