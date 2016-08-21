Home Automation
=======
1. Components
	1. Services
		1. LightService
			1. Responsibilities
				- Turn lights on/off
				- Retain current state of lights (assuming no other remote is controlling)
			2. Dependencies
				- MiLight WiFi controller
			3. Emits events
				- RegisterLight
					- id
					- location
					- type
				- LightSet
					- id
					- isOn (boolean)
					- color (RGB)
					- brightness (RGB)
			4. Listens to events
				- SetLight
					- id
					- isOn
					- color
					- brightness
		2. SoundService
			1. Responsibilities
				- Playing sound/music on a certain output
			2. Dependencies
			3. Emits events
				- RegisterSoundDevice
					- id
					- location
					- type (speaker, spotify)
				- VolumeChanged
				- SoundStarted
				- SoundDone
			4. Listens to events
				- PlaySound
					- id
					- data (base64 MP3 or spotify URL)
		3. AlarmService
			1. Responsibilities
				- Accept scheduled alarms
				- Store scheduled alarms
				- When time for an alarm comes emit Light and Sound events
				- Accept snoozing events
			2. Dependencies
			3. Emits events
				- SetLight
				- PlaySound
			4. Listens to events
		4. IntelligenceService
			1. Responsibilities
				- Periodicially scans calendar for events
				- Aligns alarms with events
				- Determines when user went to bed to allow for enough sleeping
			2. Dependencies
			3. Emits events
			4. Listens to events
		5. MobileService
			1. Responsibilities
				- Allow Mobile application to connect
			2. Dependencies
			3. Emits events
			4. Listens to events
	2. Applications
		1. Mobile
