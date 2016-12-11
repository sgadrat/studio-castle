var Level4 = {
	triggers: {},
	walkables: {},
	platform: null,

	init: function() {
		Level4.walkables = {
			'goal': Level4.goalReached,
			'pillar_cmd': Level4.openPillar,
			'hole_1': Level4.fall,
			'hole_2': Level4.fall,
			'hole_3': Level4.fall,
		};
		Level4.platform = new Level4.Platform();
		rtge.addObject(Level4.platform);
	},

	walkableActivation: function(name) {
		Level4.walkables[name]();
	},

	interactiveActivation: function(name) {
		Level4.triggers[name].activate();
	},

	fall: function(name) {
		if (! Level4.platform.heroAttached()) {
			Studio.hero.x = 44;
			Studio.hero.y = 72;
		}
	},

	goalReached: function() {
		rtge.removeObject(Level4.platform);
		Studio.level4Complete();
		document.getElementById('sound_button').play();
	},

	openPillar: function() {
		var map_layers = Studio.currentMap.layers;
		for (var layer_index = 0; layer_index < map_layers.length; ++layer_index) {
			var layer = map_layers[layer_index];
			switch (layer.name) {
				case 'level':
					layer.data[1*16+10] = Studio.TILE_EMPTY;
					layer.data[2*16+10] = Studio.TILE_PILLAR_DOWN;
					layer.data[8*16+13] = Studio.TILE_BUTTON_DOWN;
					break;
				case 'blockers':
					var pillar = Studio.findNamedObject(layer.objects, 'pillar');
					pillar.visible = false;
					break;
			};
		}
		Studio.updateCurrentMap();

		Studio.findNamedObject(Studio.findNamedObject(Studio.currentMap.layers, 'walkable').objects, 'pillar_cmd').visible = false;
		document.getElementById('sound_button').play();
	},

	Platform: function() {
		this.maxX = 173;
		this.minX = 99;

		rtge.DynObject.call(this);
		this.x = this.minX;
		this.y = 144;
		this.z = 0;
		this.anchorX = 18;
		this.anchorY = 18;
		this.animation = 'platform';

		this.direction = 1;
		this.landTime = 0;

		this.tick = function(timeElapsed) {
			if (this.landTime > 0) {
				this.landTime = Math.max(0, this.landTime - timeElapsed);
				return;
			}

			var destX = this.x + this.direction * timeElapsed * 0.05;
			destX = Math.min(destX, this.maxX);
			destX = Math.max(destX, this.minX);

			if (this.heroAttached()) {
				Studio.hero.x += destX - this.x;
			}

			this.x = destX;

			if (this.x == this.maxX || this.x == this.minX) {
				this.direction *= -1;
				this.landTime = 500;
			}
		};

		this.heroAttached = function() {
			return Math.abs(Studio.hero.x - this.x) <= 20 && Math.abs(Studio.hero.y - this.y) <= 20;
		};
	},
};
