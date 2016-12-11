var Studio = {
	init: function() {
		var graphics = [
			{
				'name': 'tilemaps/level1',
				'data': {
					'type': 'tilemap',
					'tilemap': level1_map
				}
			},
			'imgs/hero/top_1.png',
			'imgs/hero/top_2.png',
			'imgs/hero/right_1.png',
			'imgs/hero/right_2.png',
			'imgs/hero/bot_1.png',
			'imgs/hero/bot_2.png',
			'imgs/hero/left_1.png',
			'imgs/hero/left_2.png',
		];

		var animations = {};
		animations['hero.idle'] = new rtge.Animation();
		animations['hero.idle'].steps = ['imgs/hero/top_1.png'];
		animations['hero.idle'].durations = [3600000];
		var orientations = ['top', 'right', 'bot', 'left'];
		for (var i = 0; i < orientations.length; ++i) {
			orientation = orientations[i];
			animations['hero.walk.'+orientation] = new rtge.Animation();
			animations['hero.walk.'+orientation].steps = ['imgs/hero/'+orientation+'_1.png', 'imgs/hero/'+orientation+'_2.png'];
			animations['hero.walk.'+orientation].durations = [250, 250];
		}

		var objects = [
			new Studio.Hero(128, 128),
		];

		var camera = new rtge.Camera();
		camera.x = 0;
		camera.y = 0;

		Studio.currentMap = level1_map;
		Studio.currentLevel = Level1;

		rtge.init(
			'screen',
			{
				'terrain': 'tilemaps/level1',
				'objects': objects
			},
			animations,
			[],
			graphics,
			{
				'globalTick': null,
			},
			camera
		);

		window.addEventListener("keydown", Studio.keydown, true);
		window.addEventListener("keyup", Studio.keyup, true);
	},

	level1Complete: function() {
		alert('GG');
	},

	currentLevel: null,

	currentMap: null,

	/* Ensure that the map is redrawn (even with rtge optimizations activated) */
	updateCurrentMap: function() {
		rtge.images['tilemaps/level1'] = {
			'type': 'tilemap',
			'tilemap': level1_map
		};
	},

	/* Find an object in array having a specified "name" attribute */
	findNamedObject: function(list, name) {
		var index;
		var object;
		for (index = 0; index < list.length; ++index) {
			object = list[index];
			if (object.name == name) {
				return object;
			}
		}
		return null;
	},

	/* Get the objects array from an object layer of the current map */
	getMapObjectLayer: function(name) {
		var layer = Studio.findNamedObject(Studio.currentMap.layers, name);
		if (layer !== null) {
			return layer.objects;
		}
		return [];
	},

	/* State of the input buttons (0: release; 1: pushed) */
	inputState: {
		up: 0, right: 0, down: 0, left: 0,
		action: 0
	},

	keyboardInput: function(key, value) {
		switch (key) {
			case "Up":
			case "ArrowUp":
				Studio.inputState.up = value;
				return true;
			case "Right":
			case "ArrowRight":
				Studio.inputState.right = value;
				return true;
			case "Down":
			case "ArrowDown":
				Studio.inputState.down = value;
				return true;
			case "Left":
			case "ArrowLeft":
				Studio.inputState.left = value;
				return true;
			case "Spacebar":
			case " ":
				Studio.inputState.action = value;
				return true;
		};
		return false;
	},

	keydown: function(e) {
		if (e.defaultPrevented) {
			return;
		}
		if (Studio.keyboardInput(e.key, 1)) {
			e.preventDefault();
		}
	},

	keyup: function(e) {
		if (e.defaultPrevented) {
			return;
		}
		e.preventDefault();
		if (Studio.keyboardInput(e.key, 0)) {
			e.preventDefault();
		}
	},

	pointInRectangle: function(point, rect) {
		return (
			point.x >= rect.x &&
			point.x <= rect.x + rect.width &&
			point.y >= rect.y &&
			point.y <= rect.y + rect.height
		);
	},

	Hero: function(x, y) {
		rtge.DynObject.call(this);
		this.x = x;
		this.y = y;
		this.z = 1;
		this.anchorX = 8;
		this.anchorY = 14;
		this.animation = 'hero.idle';

		this.tick = function(timeElapsed) {
			// Refuse to consider too big timeElapsed values
			timeElapsed = Math.min(timeElapsed, 500);

			// Compute movement from input
			var velocity = { x: 0, y: 0 };
			velocity.x -= Studio.inputState.left;
			velocity.x += Studio.inputState.right;
			velocity.y -= Studio.inputState.up;
			velocity.y += Studio.inputState.down;

			if (velocity.y != 0) {
				if (velocity.y > 0) {
					this.animation = 'hero.walk.bot';
				}else {
					this.animation = 'hero.walk.top';
				}
			}else if (velocity.x != 0) {
				if (velocity.x > 0) {
					this.animation = 'hero.walk.right';
				}else {
					this.animation = 'hero.walk.left';
				}
			}else {
				this.animation = 'hero.idle';
			}

			var landing_x = this.x + velocity.x * timeElapsed * 0.05;
			var landing_y = this.y + velocity.y * timeElapsed * 0.05;

			// Apply movement restictions
			landing_x = Math.max(landing_x, 32+5);
			landing_x = Math.min(landing_x, 223-5);
			landing_y = Math.max(landing_y, 32+5);
			landing_y = Math.min(landing_y, 213-5);

			var blockers = Studio.getMapObjectLayer('blockers');
			for (var blocker_index = 0; blocker_index < blockers.length; ++blocker_index) {
				var blocker = blockers[blocker_index];
				if (blocker.visible && Studio.pointInRectangle({x: landing_x, y: landing_y}, blocker)) {
					landing_x = this.x;
					landing_y = this.y;
					break;
				}
			}

			this.x = landing_x;
			this.y = landing_y;

			// Trigger walkables events
			var walkables = Studio.getMapObjectLayer('walkable');
			for (var walkable_index = 0; walkable_index < walkables.length; ++walkable_index) {
				if (Studio.pointInRectangle({x: landing_x, y: landing_y}, walkables[walkable_index])) {
					Studio.currentLevel.walkableActivation(walkables[walkable_index].name);
				}
			}
		};
	},

	// Usefull tile indexes from the tileset
	TILE_EMPTY: 0,
	TILE_BUTTON_DOWN: 25,
	TILE_PILLAR_DOWN: 27,
};
