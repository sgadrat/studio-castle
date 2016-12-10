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

	Hero: function(x, y) {
		rtge.DynObject.call(this);
		this.x = x;
		this.y = y;
		this.z = 1;
		this.anchorX = 8;
		this.anchorY = 14;
		this.animation = 'hero.idle';

		this.tick = function(timeElapsed) {
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

			this.x += velocity.x * timeElapsed * 0.05;
			this.y += velocity.y * timeElapsed * 0.05;
		};
	},
};
