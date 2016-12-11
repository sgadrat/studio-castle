var Level2 = {
	walkableActivation: function(name) {
		if (name == 'goal') {
			Studio.level2Complete();
		}else {
			Level2.openChest();
		}
	},

	interactiveActivation: function(name) {
		alert('TODO');
	},

	openChest: function() {
		Studio.hero.hasSword = true;

		walkables = Studio.getMapObjectLayer('walkable');
		walkable_chest = Studio.findNamedObject(walkables, 'chest');
		walkable_chest.visible = false;

		level_layer = Studio.findNamedObject(Studio.currentMap.layers, 'level');
		level_layer.data[7*16+7] = Studio.TILE_EMPTY;
		level_layer.data[7*16+8] = Studio.TILE_EMPTY;

		Studio.updateCurrentMap();
	},

	openPillar: function() {
		var map_layers = Studio.currentMap.layers;
		for (var layer_index = 0; layer_index < map_layers.length; ++layer_index) {
			var layer = map_layers[layer_index];
			switch (layer.name) {
				case 'level':
					layer.data[2*16+3] = Studio.TILE_BUTTON_DOWN;
					layer.data[1*16+4] = Studio.TILE_EMPTY;
					layer.data[2*16+4] = Studio.TILE_PILLAR_DOWN;
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
