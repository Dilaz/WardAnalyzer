jQuery('document').ready(function($) {
	$('#teamform').submit(function(e) {
		e.preventDefault();
		load();

		$.getJSON('/team/?team=' + $('#teamname').val())
		.then(function(data) {
			stopload();
			$('h1').text(data.team);

			var matches = {}
			var limit = parseInt($('#matches').val(), 10);

			data.wards.forEach(function(w) {
				var match = matches[w.id] || {wards:[]};
				match.wards.push({
					time: w.start,
					x: (parseFloat(w.x) + 7500),
					y: (parseFloat(w.y) + 7500),
					type: w.type
				});

				matches[w.id] = match;
			});

			var map = $('#map');
			$('#map-wrapper').slideDown('fast', function() {
				var mulX = map.width() / 15000;
				var mulY = map.height() / 15000;

				Object.keys(matches).forEach(function(key) {
					if (--limit <= 0) { return false; }

					var match = matches[key];
					console.log('before', match.wards.length);

					match.wards.filter(function(ward) {
						var time = parseFloat(ward.time);
						var timeLimit = parseInt($('#time').val(), 10);
						console.log(time, timeLimit);
						switch (timeLimit) {
							case 0:
								return time <= 2;
							break;
							case 1:
								return time > 2 && time <= 20;
							break;
							case 2:
								return time > 20 && time <= 40;
							break;
							case 3:
								return time > 40;
							break;
						}

						return parseFloat(ward.time)
					})
					.forEach(function(ward) {
						$('<div>').addClass('ward ' + ward.type.toLowerCase())
						.css({
							left: (ward.x * mulX) + 'px',
							top: (ward.y * mulY) + 'px',
						})
						.appendTo(map);
					});
					console.log('after',map.find('div').length);
				});
			});
		});
	});
});

function load() {
	$('.loader').show();
	$('#submit').attr('disabled', true);
}
function stopload() {
	$('.loader').hide();
	$('#submit').removeAttr('disabled');
}
