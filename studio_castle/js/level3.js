var Level3 = {
	triggers: {},
	walkables: {},

	init: function() {
		Level3.triggers = {
			'trigger_nw': new Studio.Trigger(4, 4, Level3.triggerActivated),
			'trigger_n': new Studio.Trigger(5, 4, Level3.triggerActivated),
			'trigger_ne': new Studio.Trigger(6, 4, Level3.triggerActivated),
			'trigger_sw': new Studio.Trigger(4, 12, Level3.triggerActivated),
			'trigger_s': new Studio.Trigger(6, 12, Level3.triggerActivated),
			'trigger_se': new Studio.Trigger(13, 12, Level3.triggerActivated),
		};

		Level3.walkables = {
			'goal': Studio.level3Complete,
			'pillar_cmd': Level3.openPillar,
		};
	},

	walkableActivation: function(name) {
		Level3.walkables[name]();
	},

	interactiveActivation: function(name) {
		Level3.triggers[name].activate();
	},

	triggerActivated: function(trigger) {
		var equals = true;
		var solution = [
			false, true, false,
			true, false, true
		];
		var actual = [
			Level3.triggers.trigger_nw.state, Level3.triggers.trigger_n.state, Level3.triggers.trigger_ne.state,
			Level3.triggers.trigger_sw.state, Level3.triggers.trigger_s.state, Level3.triggers.trigger_se.state
		];
		for (var i = 0; i < solution.length; ++i) {
			if (actual[i] != solution[i]) {
				equals = false;
				break;
			}
		}

		var level_layer = Studio.findNamedObject(Studio.currentMap.layers, 'level');
		var block_layer = Studio.getMapObjectLayer('blockers');
		if (equals)
		{
			level_layer.data[6*16+11] = Studio.TILE_EMPTY;
			Studio.findNamedObject(block_layer, 'door').visible = false;
		}else {
			level_layer.data[6*16+11] = Studio.TILE_DOOR;
			Studio.findNamedObject(block_layer, 'door').visible = true;
		}
	},

	openPillar: function() {
		var map_layers = Studio.currentMap.layers;
		for (var layer_index = 0; layer_index < map_layers.length; ++layer_index) {
			var layer = map_layers[layer_index];
			switch (layer.name) {
				case 'level':
					layer.data[1*16+8] = Studio.TILE_EMPTY;
					layer.data[2*16+8] = Studio.TILE_PILLAR_DOWN;
					layer.data[4*16+11] = Studio.TILE_BUTTON_DOWN;
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
};
