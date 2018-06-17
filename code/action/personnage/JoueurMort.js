define([	'underscore',
			'createjs',
			'radio'],
function(	_,
			createjs,
			radio) {

	'use strict';

	var imageJoueurMort = document.getElementById('joueur-mort');

	var spriteSheet = new createjs.SpriteSheet({
		'images': [imageJoueurMort],
		'frames': {
			'width': 75,
			'height': 87,
			'regX': 0,
			'regY': 0,
			'count': 4
		},
		'animations': {
			'saute': [2, 1, 'saute'],
		   	'tombe': [1, 1, 'tombe']
		}
	});

	var JoueurMort = function() {
		this.width = this.getBounds().width;
		this.height = this.getBounds().height;

        // nous n'avons pas vraiment besoin de positionner le joueur mort, car il sera positionné quand
        // le joueur meurt et il est affiché sur la scène

		this.framerate = 1;

		this.initialiser();
	};

	JoueurMort.prototype = new createjs.Sprite(spriteSheet, 'saute');

	JoueurMort.prototype.initialiser = function() {
        // Écouter les événements 'joueur-mort-en-vol-debut' et 'joueur-mort-au-sol-debut' pour y réagir
        radio('joueur-mort-en-vol-debut').subscribe([this.tomber, this]);
        radio('joueur-mort-au-sol-debut').subscribe([this.ecraser, this]);
    };

	JoueurMort.prototype.tomber = _.once(function() {
		if (!createjs.Ticker.getPaused()) {

			createjs.Tween.get(this, { override: true })
				.to({ y: (this.y - 40) }, 300, createjs.Ease.getPowIn(2.2))
				.wait(300)
				.to({ y: ENVIRONEMENT.canvas.height }, 800, createjs.Ease.cubicInOut)
				.wait(500)
				.call(function() {
                    ENVIRONEMENT.son.jouer('die');

                    radio('joueur-mort-fin').broadcast();
				});
		}
	});

    JoueurMort.prototype.ecraser = _.once(function() {
        if (!createjs.Ticker.getPaused()) {
            ENVIRONEMENT.son.jouer('die');
            radio('joueur-mort-fin').broadcast();
        }
    });

	return JoueurMort;

});
