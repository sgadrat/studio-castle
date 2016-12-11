var Level2 = {
	triggers: {},
	showingMessage: false,
	lastActionBtnState: null,

	init: function() {
		Level2.triggers = {
			'trigger_1': new Studio.Trigger(4, 7, Level2.triggerActivated),
		};
	},

	walkableActivation: function(name) {
		if (name == 'goal') {
			Studio.level2Complete();
		}else {
			Level2.openChest();
		}
	},

	interactiveActivation: function(name) {
		Level2.triggers[name].activate();
	},

	openChest: function() {
		Studio.hero.hasSword = true;

		var walkables = Studio.getMapObjectLayer('walkable');
		walkable_chest = Studio.findNamedObject(walkables, 'chest');
		walkable_chest.visible = false;

		var level_layer = Studio.findNamedObject(Studio.currentMap.layers, 'level');
		level_layer.data[7*16+7] = Studio.TILE_EMPTY;
		level_layer.data[7*16+8] = Studio.TILE_EMPTY;

		var message_layer = Studio.findNamedObject(Studio.currentMap.layers, 'message');
		message_layer.visible = true;
		Studio.hero.freezed = true;
		Studio.hero.visible = false;
		Level2.lastActionBtnState = Studio.inputState.action;
		Level2.showingMessage = true;

		Studio.updateCurrentMap();
	},

	endMessage: function() {
		var message_layer = Studio.findNamedObject(Studio.currentMap.layers, 'message');
		message_layer.visible = false;
		Studio.hero.freezed = false;
		Studio.hero.visible = true;
		Level2.showingMessage = false;
		Studio.updateCurrentMap();
	},

	inputChanged: function() {
		if (Level2.showingMessage) {
			var newActionState = Studio.inputState.action;
			if (Level2.lastActionBtnState == 0 && newActionState == 1) {
				Level2.endMessage();
			}
			Level2.lastActionBtnState = newActionState;
		}
	},

	triggerActivated: function(trigger) {
		if (trigger.state) {
			Level2.openPillar();
		}else {
			Level2.closePillar();
		}
	},

	openPillar: function() {
		var map_layers = Studio.currentMap.layers;
		for (var layer_index = 0; layer_index < map_layers.length; ++layer_index) {
			var layer = map_layers[layer_index];
			switch (layer.name) {
				case 'level':
					layer.data[1*16+6] = Studio.TILE_EMPTY;
					layer.data[2*16+6] = Studio.TILE_PILLAR_DOWN;
					break;
				case 'blockers':
					var pillar = Studio.findNamedObject(layer.objects, 'pillar');
					pillar.visible = false;
					break;
			};
		}
		Studio.updateCurrentMap();
	},

	closePillar: function() {
		var map_layers = Studio.currentMap.layers;
		for (var layer_index = 0; layer_index < map_layers.length; ++layer_index) {
			var layer = map_layers[layer_index];
			switch (layer.name) {
				case 'level':
					layer.data[1*16+6] = Studio.TILE_PILLAR_TOP;
					layer.data[2*16+6] = Studio.TILE_PILLAR_BOT;
					break;
				case 'blockers':
					var pillar = Studio.findNamedObject(layer.objects, 'pillar');
					pillar.visible = true;
					break;
			};
		}
		Studio.updateCurrentMap();
	},
};
