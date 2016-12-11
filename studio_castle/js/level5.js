var Level5 = {
	triggers: {},
	walkables: {},
	dialogState: 'not-started',
	lastActionBtnState: null,

	init: function() {
		Level5.walkables = {
			'goal': Studio.level5Complete,
		};
		Level5.triggers = {
			'king': Level5.showDialog,
		};
	},

	walkableActivation: function(name) {
		document.getElementById('sound_button').play();
		Level5.walkables[name]();
	},

	interactiveActivation: function(name) {
		Level5.triggers[name]();
	},

	inputChanged: function() {
		if (Level5.dialogState == 'running') {
			var newActionState = Studio.inputState.action;
			if (Level5.lastActionBtnState == 0 && newActionState == 1) {
				Level5.endDialog();
			}
			Level5.lastActionBtnState = newActionState;
		}
	},

	showDialog: function() {
		Studio.hero.freezed = true;

		Studio.findNamedObject(Studio.currentMap.layers, 'dialog').visible = true;
		Studio.findNamedObject(Studio.getMapObjectLayer('interactive'), 'king').visible = false;
		Studio.updateCurrentMap();

		Level5.dialogState = 'running';
		Level5.lastActionBtnState = Studio.inputState.action;
	},

	endDialog: function() {
		Studio.hero.freezed = false;

		Studio.findNamedObject(Studio.currentMap.layers, 'dialog').visible = false;
		Studio.updateCurrentMap();

		Level5.dialogState = 'finished';

		Level5.openPillar();
	},

	openPillar: function() {
		var map_layers = Studio.currentMap.layers;
		for (var layer_index = 0; layer_index < map_layers.length; ++layer_index) {
			var layer = map_layers[layer_index];
			switch (layer.name) {
				case 'level':
					layer.data[1*16+12] = Studio.TILE_EMPTY;
					layer.data[2*16+12] = Studio.TILE_PILLAR_DOWN;
					break;
				case 'blockers':
					var pillar = Studio.findNamedObject(layer.objects, 'pillar');
					pillar.visible = false;
					break;
			};
		}
		Studio.updateCurrentMap();
	},
};
