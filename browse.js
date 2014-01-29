var list = function() {
	var table = $('#artists tbody').empty();

	$('#status').text('loading data (takes several seconds)…').show();

	Handlebars.registerHelper('pluralize', function(number, single, plural) {
	  if (number === 1) { return single; }
	  else { return plural; }
	});

	var template = Handlebars.compile($('#track-template').html());

	var map = function (doc) {
		emit(doc.primary_contributor, doc);
	};

	var reduce = function(artist, segments) {
		var series = {};

		segments.forEach(function(segment) {
			if (typeof series[segment.series.pid] === 'undefined') {
				series[segment.series.pid] = {
					count: 0,
					title: segment.series.title,
					tracks: [],
				}
			}

			series[segment.series.pid].count++;
			series[segment.series.pid].tracks.push(segment);
		});

		return series;
	}

	var filter = function (err, response) {
		var rows = response.rows.sort(function(a, b) {
			return Object.keys(b.value).length - Object.keys(a.value).length;
		});

		$('#status').hide();

		rows.forEach(function(row) {
			if (!row.key) {
				return;
			}

			var series = row.value;

			row.value = Object.keys(series).sort(function(a, b) {
				return series[b].tracks.length - series[a].tracks.length;
			}).map(function(key) {
				return series[key];
			});

			table.append(template(row));
		});
	};

	var db = new PouchDB('bbc-tracks');
	db.query({ map: map, reduce: reduce }, filter);
};

$(function() {
	$('#list').on('click', function(event) {
		event.preventDefault();
		list();
	});
});
