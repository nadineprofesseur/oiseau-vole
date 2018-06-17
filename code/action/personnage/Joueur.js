define([	'underscore',
			'createjs',
			'radio'],
function(	_,
			createjs,
			radio) {

	'use strict';

	var imageJoueur = document.getElementById('joueur');

	var spriteSheet = new createjs.SpriteSheet({
		'images': [imageJoueur],
		'frames': {
			'width': 89,
			'height': 79,
			'regX': 0,
			'regY': 0,
			'count': 4
		},
		'animations': {
			'haut': [1, 2, 3, 2, 1, 'haut'],
			'tout-droit': [1, 'tout-droit'],
			'bas': [2, 'bas'],
			'vide': [1, 'vide']
		}
	});


    // TODO: stocker plus de propriétés du joueur sur le constructeur, plutôt que de s'appuyer sur des singletons?

	var Joueur = function() {
		this.width = this.getBounds().width;
		this.height = this.getBounds().height;
		this.x = 50;
		this.y = 50;

        // TODO: Framerate à l'échelle basé sur le framerate du ticker

		this.framerate = 2;

		this.initialiser();
	};

	Joueur.prototype = new createjs.Sprite(spriteSheet, 'tout-droit');

	Joueur.prototype.initialiser = function() {
        // Écouter les événements 'joueur-collision-sol', 'monstre-collision-joueur' et 'joueur-clic' pour y réagir
        radio('joueur-collision-sol').subscribe([this.mourir, this]);
        radio('monstre-collision-joueur').subscribe([this.mourir, this]);

        radio('joueur-clic').subscribe([this.volerVersLeHaut, this]);
	};

	Joueur.prototype.planerVersLeBas = function(pixelsPerDelta) {
		this.y += pixelsPerDelta;
	};

	Joueur.prototype.volerVersLeHaut = function() {
		var nouvellePositionY = (this.y <= 90) ? 0 : (this.y - 90);

		if (!createjs.Ticker.getPaused()) {
			this.gotoAndPlay('haut');

            ENVIRONEMENT.son.jouer("flap");

			createjs.Tween.get(this, { override: true })
				.to({ y: nouvellePositionY }, 500, createjs.Ease.cubicInOut)
				.call(function() {
					if (this.currentAnimation !== 'vide') {
						this.gotoAndPlay('bas');
					}
				});
		}
	};

    // Le joueur peut mourir qu'une seule fois, alors utilisons la méthode mourir() comme singleton
	Joueur.prototype.mourir = _.once(function() {
        ENVIRONEMENT.son.jouer("crash");
		this.gotoAndPlay('vide');
	});

	Joueur.prototype.tick = function(evenement, deltaInSeconds) {
		this.planerVersLeBas(deltaInSeconds * 80);

        // ralentit intentionnellement la vitesse à laquelle le joueur diffuse ses mouvements; encore une fois, pour
        // raisons de performance
        // (temps) divisé par (changement dans le temps) est divisible par un facteur de 5
        if (Math.floor((evenement.time / evenement.delta) % 4) === 0) {
            radio('jeu-tick').broadcast(this.x, this.y, this.width, this.height);
		}
	};

	return Joueur;

});
