var fs = require('fs'),
	service = process.argv[2],
	zooKeeperHost = process.argv[3],
	config;

// Check if we have any local config
try {
	config = JSON.parse(fs.readFileSync(__dirname + '/../services/config.json').toString());
} catch (e) {
	try {
		config = JSON.parse(fs.readFileSync(__dirname + '/../services/config.default.json').toString());
	} catch (e) {}
}
if (config == null) {
	config = {};
}

// For now we only append the zookeper config
config.zooKeeperHost = zooKeeperHost;
fs.writeFileSync(__dirname + '/../services/' + service + '/config.json', JSON.stringify(config, 0, '\t'));
