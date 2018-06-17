define([	'createjs',
			'radio'],
function(	createjs,
			radio) {

	'use strict';

	var imageMonstre = document.getElementById('monstre');

	var spriteSheet = new createjs.SpriteSheet({
		'images': [imageMonstre],
		'frames': {
			'width': 150,
			'height': 170,
			'regX': 0,
			'regY': 0,
			'count': 8
		},
		'animations': {
			'constant': [0, 1, 2 ,3 ,4 ,5, 7, 8, 7, 5, 4 ,3, 2, 1, 'constant'],
			'arret': [6, 'arret']
		}
	});


	var Monstre = function(positionXinitiale, espacementEnXDePlus) {
		this.width = this.getBounds().width;
		this.height = this.getBounds().height;

		this.espacementEnX = 225;

		this.x = espacementEnXDePlus ? (positionXinitiale + this.espacementEnX) : positionXinitiale;
		this.y = this.genererPositionYHasard();


        // TODO: donner au monstre une sorte de hitbox plus précise?

		this.framerate = Math.floor((Math.random() * 8) + 1);

        // Puisque nous réutilisons les mêmes monstres, nous avons besoin d'un booléen pour savoir si
        // Le joueur a déjà passé chacun d'entre eux, donc nous pouvons réinitialiser le drapeau quand ils réapparaissent
        this.pointageIncrementable = true;

		this.initialiser();
	};

	Monstre.prototype = new createjs.Sprite(spriteSheet, 'constant');

	Monstre.prototype.initialiser = function() {
        // Écouter l'événement 'jeu-tick' pour y réagir
		radio('jeu-tick')
			.subscribe([this.testerCollisionJoueur, this])
			.subscribe([this.testerEsquiveJoueur, this]);
	};

	Monstre.prototype.genererPositionYHasard = function() {
		return Math.floor(Math.random() * (ENVIRONEMENT.canvas.height - this.height));
	};

	Monstre.prototype.avancer = function(pixelsPerDelta, autreMonstrePositionX, autreMonstreLargeur, autreMonstreEspacementEnX) {
		if (this.x <= -this.width){
            this.x = ENVIRONEMENT.canvas.width;

		    this.y = this.genererPositionYHasard();

		    this.pointageIncrementable = true;
		}
		else {
			this.x -= pixelsPerDelta;
		}
	};

	Monstre.prototype.testerCollisionJoueur = function(joueurPositionX, joueurPositionY, joueurLargeur, joueurHauteur) {
        // si le bord gauche du joueur n'est PAS au-delà du bord droit du monstre,
		if (!(joueurPositionX >= this.x + this.width) &&
            // ET le bord droit du joueur n'est pas passé le bord gauche du monstre,
			!(joueurPositionX + joueurLargeur <= this.x) &&
			// ET le bord supérieur du joueur n'est pas passé le bord inférieur du monstre,
			!(joueurPositionY >= this.y + this.height) &&
			// ET le bord inférieur du joueur n'est pas passé le bord supérieur du monstre
			!(joueurPositionY + joueurHauteur <= this.y))
        {
            radio('monstre-collision-joueur').broadcast();

            ENVIRONEMENT.stage.removeChild(this);
		}
	};

    // nous ignorons tous les paramètres sauf la position x du joueur ici, parce que nous n'avont pas
    // besoin de ses autres métriques
    Monstre.prototype.testerEsquiveJoueur = function(joueurPositionX) {
        // si le joueur est passé par l'ennemi courant (et ne l'a pas déjà fait),
        // émettre un événement 'joueur-gagne-point'
		if ((joueurPositionX >= (this.x + this.width)) && this.pointageIncrementable) {
			this.pointageIncrementable = false;

			radio('joueur-gagne-point').broadcast();
		}
	};

    Monstre.prototype.genererVitesseVariable = function() {
        return Math.floor(Math.random() * 180) + 120  ;
    };


	Monstre.prototype.tick = function(evt, deltaInSeconds, autreMonstrePositionX, autreMonstreLargeur, autreMonstreEspacementEnX) {
        this.avancer((deltaInSeconds * this.genererVitesseVariable()), autreMonstrePositionX, autreMonstreLargeur, autreMonstreEspacementEnX);
	};

	return Monstre;

});
