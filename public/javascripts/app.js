var teams = {};
jQuery('document').ready(function($) {
	var hash = document.location.hash.substr(1);

	if (hash) {
		$('#teamname').val(hash);
		setTimeout(function() {
			$('#teamform').submit();
		}, 0);
	}

	$('#teamform').submit(function(e) {
		e.preventDefault();
		document.location.hash = $('#teamname').val();
		$('#map div').remove();
		load();

		$.getJSON('/team/?team=' + $('#teamname').val())
		.then(function(data) {
			stopload();
			if (data.error) {
				alert(data.error);
				return;
			}
			else if (data.wards.length === 0) {
				alert('Unknown team');
				return;
			}

			$('h1').text(data.team);

			var matches = {}
			var limit = parseInt($('#matches').val(), 10);

			data.wards.forEach(function(w) {
				var id = parseInt(w.match, 10);
				var match = matches[id] || {wards:[]};

				match.wards.push({
					time: w.start,
					x: (parseFloat(w.x) + 7500),
					y: (parseFloat(w.y) + 7500),
					type: w.type
				});

				matches[id] = match;
			});

			var map = $('#map');
			$('#map-wrapper').slideDown('fast', function() {
				var mulX = map.width() / 15000;
				var mulY = map.height() / 15000;

				Object.keys(matches).sort().reverse().forEach(function(key) {
					if (limit <= 0) { return false; }
					limit--;

					var match = matches[key];
					match.wards.filter(function(ward) {
						var time = parseFloat(ward.time);
						var timeLimit = parseInt($('#time').val(), 10);
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
							default:
								return true;
							break;
						}
					})
					.forEach(function(ward) {
						$('<div>').addClass('ward ' + ward.type.toLowerCase())
						.attr('title', 'Match: ' + key + ' (' + [ward.x - 7500, ward.y - 7500].join(',') + ')')
						.css({
							left: ((ward.x / 15000) * 100) + '%',
							bottom: ((ward.y / 15000) * 100) + '%',
						})
						.appendTo(map);
					});
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
