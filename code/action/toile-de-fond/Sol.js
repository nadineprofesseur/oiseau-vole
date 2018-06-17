define([	'createjs'],
function(	createjs) {

	'use strict';
    var hauteurSol = 96;
    var imageSol = document.getElementById('sol');
    var bitmap = new createjs.Bitmap(imageSol);
    var ratioHauteurSolSurHauteurMediaSol = hauteurSol/bitmap.getBounds().height;

	var Sol = function() {
		this.matrix2d = new createjs.Matrix2D();
        this.matrix2d.scale(ratioHauteurSolSurHauteurMediaSol, ratioHauteurSolSurHauteurMediaSol);
        this.image = imageSol;
		this.x=0;
        this.y = (ENVIRONEMENT.canvas.height - hauteurSol);
	};

	Sol.prototype = new createjs.Shape();


	Sol.prototype.defiler = function (vitesse) {
		this.matrix2d.translate(-vitesse, 0);
        this.graphics.clear().beginBitmapFill(this.image, "repeat", this.matrix2d).rect(0, 0, ENVIRONEMENT.canvas.width, hauteurSol);
	}

	return Sol;

});
