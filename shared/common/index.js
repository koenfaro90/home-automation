var fs = require('fs');

module.exports = {
	loadConfig: function() {
		try {
			return JSON.parse(fs.readFileSync('config.json').toString());
		} catch (e) {
			console.error('config.json not found or invalid, trying to load default', e);
			try {
				return JSON.parse(fs.readFileSync('config.default.json').toString());
			} catch (e) {
				console.log('config.default.json not found either');
				return {};
			}
		}
	}
}
