var Level6 = {
	boss: null,

	init: function() {
		Level6.boss = new Level6.Boss(192, 128);
		rtge.addObject(Level6.boss);
	},

	gameover: function() {
		rtge.removeObject(this.boss);
		this.boss = null;
		Studio.hero.freezed = true;
		Studio.hero.visible = false;

		Studio.findNamedObject(Studio.currentMap.layers, 'gameover').visible = true;
		Studio.updateCurrentMap();
		document.getElementById('sound_gameover').play();
	},

	Boss: function(x, y) {
		rtge.DynObject.call(this);
		this.x = x;
		this.y = y;
		this.z = 0;
		this.anchorX = 16;
		this.anchorY = 29;
		this.animation = 'boss.walk.bot';

		this.velocity = {x: 0, y: 100};
		this.animChangeCooldown = 0;

		this.state_roaming = {
			chargeCooldown: 5000,

			init: function() {
				this.chargeCooldown = 5000;
			},

			updateVelocity: function(boss) {
				boss.velocity.y += Math.random() * 12 - 6;
				boss.velocity.y = Math.max(-50, boss.velocity.y);
				boss.velocity.y = Math.min(50, boss.velocity.y);
				boss.velocity.x += Math.random() * 12 - 6;
				boss.velocity.x = Math.max(-50, boss.velocity.x);
				boss.velocity.x = Math.min(50, boss.velocity.x);
			},

			tick: function(boss, timeElapsed) {
				this.chargeCooldown = Math.max(0, this.chargeCooldown - timeElapsed);
				if (this.chargeCooldown == 0) {
					boss.state_charging.init();
					boss.state = boss.state_charging;
				}
			}
		};

		this.state_charging = {
			chargeDuration: 2000,

			init: function() {
				this.chargeDuration = 2000;
			},

			updateVelocity: function(boss) {
				var diffY = Studio.hero.y - boss.y;
				var diffX = Studio.hero.x - boss.x;
				boss.velocity.y = (diffY == 0 ? 0 : 100 * diffY / Math.abs(diffY));
				boss.velocity.x = (diffX == 0 ? 0 : 100 * diffX / Math.abs(diffX));
			},

			tick: function(boss, timeElapsed) {
				this.chargeDuration = Math.max(0, this.chargeDuration - timeElapsed);
				if (this.chargeDuration == 0) {
					boss.state_roaming.init();
					boss.state = boss.state_roaming;
				}
			},
		};

		this.state = this.state_roaming;

		this.tick = function(timeElapsed) {
			// Update velocity
			this.state.tick(this, timeElapsed);
			this.state.updateVelocity(this);

			// Update animation
			this.animChangeCooldown = Math.max(0, this.animChangeCooldown - timeElapsed);
			if (this.animChangeCooldown == 0) {
				var new_anim;
				if (Math.abs(this.velocity.y) >= Math.abs(this.velocity.x)) {
					if (this.velocity.y >= 0) {
						new_anim = 'boss.walk.bot';
					}else {
						new_anim = 'boss.walk.top';
					}
				}else {
					if (this.velocity.x >= 0) {
						new_anim = 'boss.walk.right';
					}else {
						new_anim = 'boss.walk.left';
					}
				}

				if (new_anim != this.animation) {
					this.animation = new_anim;
					this.animChangeCooldown = 300;
				}
			}

			// Update position
			var landing_x = this.x + this.velocity.x * timeElapsed * 0.0005;
			var landing_y = this.y + this.velocity.y * timeElapsed * 0.0005;

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
			this.y = landing_y

			// Handle hero's interaction
			var boss_hitbox = {
				x: this.x - 10,
				y: this.y - 20,
				width: 20,
				height: 20
			};
			var hero_hitbox = {
				x: Studio.hero.x - 5,
				y: Studio.hero.y - 8,
				width: 10,
				height: 8
			};
			if (Studio.rectanglesOverlap(hero_hitbox, boss_hitbox)) {
				Studio.hero.x = 44;
				Studio.hero.y = 72;
			}

			if (Studio.sword !== null && Studio.rectanglesOverlap(Studio.sword.getHitbox(), boss_hitbox)) {
				Level6.gameover();
			}
		};
	},
};
