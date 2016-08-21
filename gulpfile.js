var gulp = require('gulp');
var _ = require('underscore');
var Promise = require('bluebird');
var common = require('./shared/common');
var path = require('path');
var dockerUtil = require('./lib/docker-util');
var config = common.loadConfig();

// Default task
gulp.task('default', function() {
	console.error('Please specifiy a task to use', ['clean', 'make', 'run']);
});

// Cleanup
gulp.task('clean', ['remove images'], function() {});
gulp.task('remove containers', ['stop'], function() {
	return dockerUtil.runCommandAsPromise('docker ps -a')
			.then(dockerUtil.parseContainers.bind(dockerUtil))
			.each(dockerUtil.actOnRelatedContainers.bind(dockerUtil, config.images, 'rm'));
});
gulp.task('remove images', ['remove containers'], function() {
	return dockerUtil.runCommandAsPromise('docker images')
				.then(dockerUtil.parseImages.bind(dockerUtil))
				.each(dockerUtil.actOnImages.bind(dockerUtil, config.images, 'rmi'));
});
gulp.task('cc', ['remove containers'], function() {
	return gulp.start('run');
});

// Stopping / Restarting
gulp.task('stop', function() {
	return dockerUtil.runCommandAsPromise('docker ps -a')
			.then(dockerUtil.parseContainers.bind(dockerUtil))
			.each(dockerUtil.actOnRelatedContainers.bind(dockerUtil, config.images, 'stop'));
});
gulp.task('restart', ['stop'], function() {
	return gulp.start('run');
});

// Building
gulp.task('make', _.map(config.images, function(image) { return 'make ' + image }));

// Define image tasks
_.each(config.images, function(image) {
	gulp.task('make ' + image, function() {
		return dockerUtil.runCommandAsPromise('docker build -t ' + image + ' .', {
			cwd: path.normalize(__dirname + '/docker/' + image + '/')
		});
	});
});

// Define container tasks
var runMap = [];
_.each(config.containers, function(cnt) {
	runMap[cnt.name] = (function(container) {
		return dockerUtil.exists(container.name).then(function(exists) {
			if (exists) {
				console.log(container.name,'already existed');
				return dockerUtil.isRunning(container.name).then(function(isRunning) {
					if (isRunning == false) {
						console.log(container.name, 'was not running');
						return dockerUtil.runCommandAsPromise('docker start ' + container.name).then(function() {
							if (container.service) {
								// first get the zookeeper IP
								return dockerUtil.runCommandAsPromise('docker exec kafka /bin/bash -c \'ip addr | grep inet | grep eth0 | grep -E -o \\"([0-9]{1,3}[.]){3}[0-9]{1,3}\\"\'').then(function(zooKeeperHost) {
									return dockerUtil.runCommandAsPromise('docker exec -d -t ' + container.name + ' /bin/bash -c "/home/app/run_service.sh ' + container.service + ' ' + zooKeeperHost.trim() + ':2181"');
								});
							} else if (container.startDelay) {
								return Promise.delay(container.startDelay);
							} else {
								return Promise.resolve();
							}
						})
					} else {
						console.log(container.name, 'was already running');
					}
				})
			} else {
				console.log(container.name, 'did not exist');
				return dockerUtil.runCommandAsPromise('docker run -d -P ' + container.image).then(function(stdout) {
					var containerId = stdout.trim();
					return dockerUtil.renameContainer(containerId, container.name).then(function() {
						if (container.service) {
							return dockerUtil.runCommandAsPromise('docker exec kafka /bin/bash -c \'ip addr | grep inet | grep eth0 | grep -E -o \\"([0-9]{1,3}[.]){3}[0-9]{1,3}\\"\'').then(function(zooKeeperHost) {
								return dockerUtil.runCommandAsPromise('docker exec -d -t ' + container.name + ' /bin/bash -c "git clone https://github.com/koenfaro90/home-automation /home/app/ && /home/app/run_service.sh ' + container.service + ' ' + zooKeeperHost.trim() + ':2181"');
							});
						} else if (container.startDelay) {
							return Promise.delay(container.startDelay);
						} else {
							return Promise.resolve();
						}
					});
				})
			}
		});
	}).bind(null, cnt);
	gulp.task('run ' + cnt.name, runMap[cnt.name]);
});

// Running
gulp.task('run', function() {
	var pList = [];
	_.each(_.sortBy(config.containers, 'sequence'), function(container) {
		pList.push(runMap[container.name]);
	});
	return Promise.mapSeries(pList, function(itm) {
		return itm();
	});
});

// Ports

gulp.task('ports', function() {
	return dockerUtil.runCommandAsPromise('docker ps -a')
			.then(dockerUtil.parseContainers.bind(dockerUtil))
			.each(function(container) {
				console.log('Container: ' + container.name);
				console.log('====================');
				_.each(container.ports, function(map) {
					console.log(map.internal + ' => ' + map.external);
				})
				console.log('====================');
			})
});
