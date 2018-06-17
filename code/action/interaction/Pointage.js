define([	'createjs',
			'radio'],
function(	createjs,
			radio) {

	'use strict';

	var Pointage = function() {
		this.width = this.getMeasuredWidth();
		this.height = this.getMeasuredHeight();
		this.x = 10;
		this.y = 5;

		this.pointage = 0;

		this.text = this.pointage;

		this.initialiser();
	};

	Pointage.prototype = new createjs.Text(' ', 'bold 24px Helvetica', '#FFFFFF');

	Pointage.prototype.initialiser = function() {
        // Écouter l'événement 'joueur-gagne-point' pour y réagir
        radio('joueur-gagne-point').subscribe([this.augmenterPointage, this]);
	};

    // TODO: calculer le temps écoulé depuis que le monstre a franchi certains points
	Pointage.prototype.augmenterPointage = function() {
		this.pointage += 1;

		this.text = this.pointage;

		// TODO: Émettre l'événement stage update?
	};

	return Pointage;

});
