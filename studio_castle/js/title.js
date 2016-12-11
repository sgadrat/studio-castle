var TitleScreen = {
	lastActionBtnState: null,

	init: function() {
		this.lastActionBtnState = Studio.inputState.action;
		Studio.hero.freezed = true;
		Studio.hero.visible = false;
	},

	end: function() {
		Studio.hero.freezed = false;
		Studio.hero.visible = true;
		Studio.updateCurrentMap();
		Studio.startLevel1();
	},

	inputChanged: function() {
		var newActionState = Studio.inputState.action;
		if (TitleScreen.lastActionBtnState == 0 && newActionState == 1) {
			TitleScreen.end();
		}
		TitleScreen.lastActionBtnState = newActionState;
	},
};
