var shows = function() {
	$.programmes.get('genres/music/player').done(function(data) {
		data.category_slice.programmes.filter(function(item) {
			return item.type == 'brand';
		}).forEach(show);
	});
};

var show = function(show) {
	$.programmes.get(show.pid + '/episodes/player').done(function(data) {
		episode(data.episodes[0].programme);
	});
};

var episode = function(episode) {
	$.programmes.get(episode.pid).done(function(data) {
		version(data.programme.versions[0], episode);
	});
};

var version = function(version, episode) {
	$.programmes.get(version.pid).done(function(data) {
		data.version.segment_events.forEach(save, episode);
	});
};

var save = function(segment_event) {
	var data = segment_event.segment;

	if (data.type == 'music') {
		data._id = data.pid;

		try {
			data.episode = {
				pid: this.pid,
				title: this.title,
			};

			data.series = {
				pid: this.programme.pid,
				title: this.programme.title,
			};

			data.brand = {
				pid: this.programme.programme.pid,
				title: this.programme.programme.title,
			};
		} catch (e) {
			console.log(e);
		}

		db.put(data, function (err, response) {
		  //console.log(err || response);
		});
	}
};

var db;

$(function() {
	$('#update').on('click', function(event) {
		event.preventDefault();

		PouchDB.destroy('bbc-tracks', function() {
			db = new PouchDB('bbc-tracks');
			shows();
		});
	});
});
