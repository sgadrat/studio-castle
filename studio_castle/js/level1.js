var Level1 = {
	walkableActivation: function(name) {
		document.getElementById('sound_button').play();
		if (name == 'walkable_1') {
			Level1.openPillar();
			Studio.findNamedObject(Studio.findNamedObject(Studio.currentMap.layers, 'walkable').objects, 'walkable_1').visible = false;
		}else {
			Studio.level1Complete();
		}
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
