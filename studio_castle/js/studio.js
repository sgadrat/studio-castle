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
			'imgs/sword/top.png',
			'imgs/sword/right.png',
			'imgs/sword/bot.png',
			'imgs/sword/left.png',
			'imgs/platform.png',
		];

		var animations = {};
		var orientations = ['top', 'right', 'bot', 'left'];
		animations['platform'] = new rtge.Animation();
		animations['platform'].steps = ['imgs/platform.png'];
		animations['platform'].durations = [3600000];
		for (var i = 0; i < orientations.length; ++i) {
			orientation = orientations[i];

			animations['hero.walk.'+orientation] = new rtge.Animation();
			animations['hero.walk.'+orientation].steps = ['imgs/hero/'+orientation+'_1.png', 'imgs/hero/'+orientation+'_2.png'];
			animations['hero.walk.'+orientation].durations = [250, 250];

			animations['hero.idle.'+orientation] = new rtge.Animation();
			animations['hero.idle.'+orientation].steps = ['imgs/hero/'+orientation+'_1.png'];
			animations['hero.idle.'+orientation].durations = [3600000];

			animations['sword.'+orientation] = new rtge.Animation();
			animations['sword.'+orientation].steps = ['imgs/sword/'+orientation+'.png'];
			animations['sword.'+orientation].durations = [3600000];
		}

		Studio.hero = new Studio.Hero(128, 128);
		var objects = [
			Studio.hero,
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

		// Cheat
		Studio.level1Complete();
		Studio.hero.hasSword = true;
		Studio.level2Complete();
		Studio.hero.x = 44;
		Studio.hero.y = 72;
		Studio.level3Complete();
		Studio.level4Complete();
		rtge.removeObject(Level4.platform);
	},

	level1Complete: function() {
		Studio.currentMap = level2_map;
		Studio.currentLevel = Level2;
		Level2.init();
		Studio.updateCurrentMap();
	},

	level2Complete: function() {
		Studio.currentMap = level3_map;
		Studio.currentLevel = Level3;
		Level3.init();
		Studio.updateCurrentMap();
	},

	level3Complete: function() {
		Studio.currentMap = level4_map;
		Studio.currentLevel = Level4;
		Level4.init();
		Studio.updateCurrentMap();
	},

	level4Complete: function() {
		Studio.currentMap = level5_map;
		Studio.currentLevel = Level5;
		Level5.init();
		Studio.updateCurrentMap();
	},

	level5Complete: function() {
		if (typeof ugly_global === 'undefined') {
			ugly_global = 'true';
			alert('GG');
		}
	},

	currentLevel: null,

	currentMap: null,

	/* Ensure that the map is redrawn (even with rtge optimizations activated) */
	updateCurrentMap: function() {
		rtge.images['tilemaps/level1'] = {
			'type': 'tilemap',
			'tilemap': Studio.currentMap
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
		var handled = true;
		switch (key) {
			case "Up":
			case "ArrowUp":
				Studio.inputState.up = value;
				break;
			case "Right":
			case "ArrowRight":
				Studio.inputState.right = value;
				break;
			case "Down":
			case "ArrowDown":
				Studio.inputState.down = value;
				break;
			case "Left":
			case "ArrowLeft":
				Studio.inputState.left = value;
				break;
			case "Spacebar":
			case " ":
				Studio.inputState.action = value;
				break;
			default:
				handled = false;
		};

		if (handled && typeof Studio.currentLevel.inputChanged !== 'undefined') {
			Studio.currentLevel.inputChanged();
		}
		return handled;
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
			if (typeof Studio.currentLevel.inputChanged !== 'undefined') {
				Studio.currentLevel.inputChanged();
			}
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

	rectanglesOverlap: function(rect1, rect2) {
		var r1 = { 'top': rect1.y, 'bot': rect1.y+rect1.height, 'left': rect1.x, 'right': rect1.x+rect1.width };
		var r2 = { 'top': rect2.y, 'bot': rect2.y+rect2.height, 'left': rect2.x, 'right': rect2.x+rect2.width };
		return (
			r1.bot >= r2.top &&
			r1.top <= r2.bot &&
			r1.right >= r2.left &&
			r1.left <= r2.right
		);
	},

	hero: null,

	Hero: function(x, y) {
		rtge.DynObject.call(this);
		this.x = x;
		this.y = y;
		this.z = 1;
		this.anchorX = 8;
		this.anchorY = 14;
		this.animation = 'hero.idle.bot';

		this.orientation = 'bot';
		this.hasSword = false;
		this.swordCooldown = 0;
		this.freezed = false;

		this.tick = function(timeElapsed) {
			// Do nothing when freezed
			if (this.freezed) {
				return;
			}

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
					this.orientation = 'bot';
				}else {
					this.orientation = 'top';
				}
				this.animation = 'hero.walk.'+this.orientation;
			}else if (velocity.x != 0) {
				if (velocity.x > 0) {
					this.orientation = 'right';
				}else {
					this.orientation = 'left';
				}
				this.animation = 'hero.walk.'+this.orientation;
			}else {
				this.animation = 'hero.idle.'+this.orientation;
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
				var walkable = walkables[walkable_index];
				if (walkable.visible && Studio.pointInRectangle({x: landing_x, y: landing_y}, walkable)) {
					Studio.currentLevel.walkableActivation(walkables[walkable_index].name);
				}
			}

			// Strike
			if (this.hasSword) {
				this.swordCooldown = Math.max(0, this.swordCooldown - timeElapsed);
				if (Studio.inputState.action == 1 && this.swordCooldown == 0) {
					this.swordCooldown = 500;
					rtge.addObject(new Studio.Sword(
						this.orientation
					));
				}
			}
		};
	},

	Sword: function(orientation) {
		rtge.DynObject.call(this);
		this.z = 1;
		this.anchorX = {'top':7, 'right':2, 'bot':7, 'left':13}[orientation];
		this.anchorY = {'top':13, 'right':8, 'bot':2, 'left':8}[orientation];
		this.animation = 'sword.'+orientation;

		this.duration = 250;
		this.orientation = orientation;
		this.stroke = false;

		this.strike = function() {
			if (this.stroke) {
				return;
			}

			var hitbox = {
				x: this.x + {'top':-1, 'right':0, 'bot':-1, 'left':-12}[this.orientation],
				y: this.y + {'top':-12, 'right':-1, 'bot':0, 'left':-1}[this.orientation],
				width: {'top':3, 'right':12, 'bot':3, 'left':12}[this.orientation],
				height: {'top':12, 'right':3, 'bot':12, 'left':3}[this.orientation]
			};

			var interactives = Studio.getMapObjectLayer('interactive');
			for (var interactive_index = 0; interactive_index < interactives.length; ++interactive_index) {
				var interactive = interactives[interactive_index];
				if (Studio.rectanglesOverlap(interactive, hitbox)) {
					Studio.currentLevel.interactiveActivation(interactive.name);
					this.stroke = true;
					break;
				}
			}
		}

		this.tick = function(timeElapsed) {
			this.duration -= timeElapsed;
			if (this.duration <= 0) {
				rtge.removeObject(this);
				return;
			}

			this.move();
		};

		this.move = function() {
			this.x = Studio.hero.x + {'top':0, 'right':5, 'bot':0, 'left':-5}[this.orientation];
			this.y = Studio.hero.y + {'top':-5, 'right':-5, 'bot':0, 'left':-5}[this.orientation];

			this.strike();
		};
		this.move();
	},

	Trigger: function(x, y, callback) {
		this.state = false;
		this.x = x;
		this.y = y;
		this.callback = callback;

		this.activate = function() {
			this.state = !this.state;
			var level_layer = Studio.findNamedObject(Studio.currentMap.layers, 'level');
			if (this.state) {
				level_layer.data[this.y*16+this.x] = Studio.TILE_TRIGGER_ON;
			}else {
				level_layer.data[this.y*16+this.x] = Studio.TILE_TRIGGER_OFF;
			}

			if (this.callback !== null) {
				this.callback(this);
			}

			Studio.updateCurrentMap();
		};
	},

	// Usefull tile indexes from the tileset
	TILE_BUTTON_DOWN: 25,
	TILE_DOOR: 10,
	TILE_EMPTY: 0,
	TILE_PILLAR_BOT: 26,
	TILE_PILLAR_DOWN: 27,
	TILE_PILLAR_TOP: 14,
	TILE_TRIGGER_OFF: 17,
	TILE_TRIGGER_ON: 18,
	TILES_GLYPHS: [47,48,59,60,71,72,83,84],
};
