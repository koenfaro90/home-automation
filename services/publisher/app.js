var sharedCommon = require('../../shared/common');
var config = sharedCommon.loadConfig();
var kafka = require('kafka-node'),
	Producer = kafka.Producer,
	KeyedMessage = kafka.KeyedMessage,
	client = new kafka.Client(config.zooKeeperHost),
	producer = new Producer(client);


setTimeout(function() {
	producer.createTopics(['t'], false, function (err, data) {
		if (err) {
			console.log('Error', err);
		}
		var km = new KeyedMessage('key', 'message'),
			payloads = [
				{ topic: 't', messages: 'hiAAA' }
			];
		producer.send(payloads, function (err, data) {
			console.log('sent', data);
		});
	});
	setInterval(function() {
                producer.send([{ topic: 't', messages: 'test: ' + (+new Date())}], function (err, data) {
                        console.log('repeat sent', data);
                });
	}, 1000);
}, 2000);
