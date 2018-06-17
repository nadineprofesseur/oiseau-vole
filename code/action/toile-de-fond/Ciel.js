define([	'createjs'],
function(	createjs) {

	'use strict';

	var imageCiel = document.getElementById('ciel');
    var bitmap = new createjs.Bitmap(imageCiel);
	var ratioHauteurCanvasSurHauteurMediaCiel = ENVIRONEMENT.canvas.height/bitmap.getBounds().height;

	var Ciel = function() {
		this.matrix2d = new createjs.Matrix2D();
        this.matrix2d.scale(ratioHauteurCanvasSurHauteurMediaCiel, ratioHauteurCanvasSurHauteurMediaCiel);
        this.image = imageCiel;
        this.x=0;
		this.y=0;
    };

	Ciel.prototype = new createjs.Shape();


	Ciel.prototype.defiler = function (vitesse) {
		this.matrix2d.translate(-vitesse, 0);
		this.graphics.clear().beginBitmapFill(this.image, "repeat", this.matrix2d).rect(0, 0, ENVIRONEMENT.canvas.width, ENVIRONEMENT.canvas.height);
	}

	return Ciel;

});
