define([	'createjs',
			'radio'],
function(	createjs,
			radio) {

	'use strict';

	var BoutonPause = function() {
		this.graphics.beginFill("#6D6D6D").drawRect(ENVIRONEMENT.canvas.width - 40, 10, 30, 30);

		this.initialiser();
	};

	BoutonPause.prototype = new createjs.Shape();

	BoutonPause.prototype.initialiser = function() {
        // Écouter l'événement 'joueur-en-pause' pour y réagir
        radio('joueur-en-pause').subscribe([this.inverserPause, this]);
	};

	BoutonPause.prototype.inverserPause = function() {
		createjs.Ticker.setPaused(!createjs.Ticker.getPaused());
	};

	return BoutonPause;

});
