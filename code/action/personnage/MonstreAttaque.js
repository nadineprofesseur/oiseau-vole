 define([	'underscore',
			'createjs',
			'radio'],
function(	_,
			createjs,
			radio) {

	'use strict';

	var imageMonstreAttaque = document.getElementById('monstre-attaque');

	var spriteSheet = new createjs.SpriteSheet({
		'images': [imageMonstreAttaque],
		'frames': {
			'width': 192,
			'height': 138,
			'regX': 0,
			'regY': 0,
			'count': 4
		},
		'animations': {
			'attaque': [1,'saute']
		}
	});

	var MonstreAttaque = function() {
		this.width = this.getBounds().width;
		this.height = this.getBounds().height;

        // nous n'avons pas vraiment besoin de positionner le monstre en attaque, car il sera positionné quand
        // le joueur meurt et il est affiché sur la scène

		this.framerate = 1;

		this.initialiser();
	};

	MonstreAttaque.prototype = new createjs.Sprite(spriteSheet, 'attaque');

	MonstreAttaque.prototype.initialiser = function() {
        // Écouter l'événement 'joueur-mort-en-vol-debut' pour y réagir
        radio('joueur-mort-en-vol-debut').subscribe([this.tomber, this]);
	};

	MonstreAttaque.prototype.tomber = _.once(function() {
		if (!createjs.Ticker.getPaused()) {

			createjs.Tween.get(this, { override: true })
				.to({ y: (this.y - 40) }, 300, createjs.Ease.getPowIn(2.2))
				.wait(300)
				.to({ y: FLAPPYSONIC.canvas.height }, 800, createjs.Ease.cubicInOut)
				.wait(500)
				.call(function() {
                    ENVIRONEMENT.son.jouer('die');

                    radio('joueur-mort-fin').broadcast();
				});
		}
	});

	return MonstreAttaque;

});
