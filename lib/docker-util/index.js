var _ = require('underscore');
var path = require('path');
var Promise = require('bluebird');
var fs = require('fs');
var cp = require('child_process');

function DockerUtil() {

}

DockerUtil.prototype = {
	buildRunString: function(arr, symbol) {
		var result = [];
		_.each(arr, function(itm) {
			if (Array.isArray(itm)) {
				result.push(this.buildRunString(itm));
			} else {
				result.push(itm);
			}
		});
		return symbol == null ? result.join(' ') : result.join(' ' + symbol + ' ');
	},
	runCommandAsPromise: function(cmd, options) {
		var defaultOptions = {
		    cwd: process.cwd(),
		    env: process.env
		};
		options = _.extend(defaultOptions, options);
		return new Promise((function(resolve, reject) {
			var isWindows = (process.platform.lastIndexOf('win') === 0),
				subShell = null;

			// Launch shell to execute commands
			if (isWindows) {
				subShell = cp.spawn('powershell.exe', ['-NonInteractive', '-NoLogo', '-Command', cmd], {
					env: options.env,
					cwd: options.cwd
				});
			} else {
				subShell = cp.spawn('sh', ['-c', cmd], {
					env: options.env,
					cwd: options.cwd
				});
			}

			var stdOutData = '';
			var stdErrData = '';
			subShell.stdout.on('data', function(data) {
				stdOutData += data.toString();
			});
			subShell.stderr.on('data', function(data) {
				stdErrData += data.toString();
			});
			subShell.once('close', function handleSubShellClose() {
				resolve(stdOutData);
			});

			subShell.once('exit', function handleSubShellExit(code) {
				if (code !== 0) {
					console.log('stdErrData', stdErrData);
					reject('Failure code:', code,'Stderr: ',stdErrData);
				} else {
					resolve(stdOutData);
				}
			});

			/*cp.exec(cmd, options, (error, stdout, stderr) => {
				if (error) {
					console.error('Error stderr', stderr);
					reject(error);
				}
				resolve(stdout);
			});*/
		}).bind(this));
	},
	parseContainers: function(input) {
		return new Promise((function(resolve, reject) {
			var lines = input.split('\n');
			lines.shift();
			var result = [];
			_.each(lines, (function(itm) {
				var cols = _.map(_.without(itm.split('   '), '',' ', '  '), function(col) {
					return col.trim();
				});
				var obj = {
					id: cols[0],
					image: cols[1],
					cmd: cols[2],
					creation: cols[3],
					status: cols[4]
				};
				if (cols.length == 6) {
					obj.name = cols[5]
				}
				if (cols.length == 7) {
					obj.ports = this.parsePorts(cols[5]),
					obj.name = cols[6]
				}
				 if (obj.id != undefined) {
					result.push(obj);
				}
			}).bind(this))
			resolve(result);
		}).bind(this));
	},
	parseImages: function(input) {
		return new Promise((function(resolve, reject) {
			var lines = input.split('\n');
			lines.shift();
			var result = [];
			_.each(lines, function(itm) {
				var cols = _.map(_.without(itm.split('   '), '',' ', '  '), function(col) {
					return col.trim();
				});
				var obj = {
					repository: cols[0],
					tag: cols[1],
					id: cols[2],
					created: cols[3],
					size: cols[4]
				};
				 if (obj.repository != undefined) {
					result.push(obj);
				}
			})
			resolve(result);
		}).bind(this));
	},
	parsePorts: function(str) {
		var result = [];
		var split = str.split(',');
		_.each(split, function(itm) {
			var split2 = itm.split('->');
			result.push({
				external: parseInt(split2[0].replace('0.0.0.0:', '').trim()),
				internal: parseInt(split2[1].replace('/tcp', '').replace('/udp', '').trim())
			})
		})
		return result;
	},
	actOnRelatedContainers: function(imagesToStop, action, container) {
		return new Promise((function(resolve, reject) {
			if (imagesToStop.indexOf(container.image) > -1) {
				this.runCommandAsPromise('docker ' + action + ' ' + container.id).then(function() {
					resolve();
				});
			} else {
				resolve();
			}
		}).bind(this))
	},
	actOnImages: function(images, action, image) {
		return new Promise((function(resolve, reject) {
			if (images.indexOf(image.repository) > -1) {
				this.runCommandAsPromise('docker ' + action + ' ' + image.id).then(function() {
					resolve();
				});
			} else {
				resolve();
			}
		}).bind(this))
	},
	renameContainer: function(containerId, newName) {
		return this.runCommandAsPromise('docker rename ' + containerId + ' ' + newName);
	},
	isRunning: function(containerName) {
		return new Promise((function(resolve, reject) {
			this.runCommandAsPromise('docker ps -a')
				.then(this.parseContainers.bind(this))
				.then(function(containers) {
					_.each(containers, function(container) {
						if (container.name == containerName) {
							if (container.status.indexOf('Up') > -1) {
								resolve(true);
							} else {
								resolve(false);
							}
						}
					});
				})
			}).bind(this));
	},
	exists: function(containerName) {
		return new Promise((function(resolve, reject) {
			this.runCommandAsPromise('docker ps -a')
				.then(this.parseContainers.bind(this))
				.then(function(containers) {
					var found = false;
					_.each(containers, function(container) {
						if (container.name == containerName) {
							found = true;
							return resolve(true);
						}
					});
					if (found == false) {
						resolve(false);
					}
				})
			}).bind(this));
	}
}

module.exports = new DockerUtil();
