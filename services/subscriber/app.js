var sharedCommon = require('../../shared/common');
var config = sharedCommon.loadConfig();
var kafka = require('kafka-node'),
	Consumer = kafka.Consumer,
	client = new kafka.Client(config.zooKeeperHost);

setTimeout(function() {
	consumer = new Consumer(
		client,
		[
			{ topic: 't'}
		],
		{
			autoCommit: false
		}
	);
	console.log('consumer listening');
	consumer.on('message', function (message) {
		console.log('received', message);
	});
}, 1000);
