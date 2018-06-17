define([	'when',
			'createjs'],
function(	when,
			createjs) {

	'use strict';


	var PageChargement = function() {
		this.nombreFichierCharge = 0;

		this.initialiser();
	};

    // ne pas avoir à remplacer le prototype car ce n'est pas un réel
    // constructeur createjs avec un initialiser par défaut ()
    PageChargement.prototype.initialiser = function() {
		this.messageChargement = new createjs.Text('Chargement', 'bold 24px Helvetica', '#FFFFFF');

		this.messageChargement.textAlign = 'center';
		this.messageChargement.x = ENVIRONEMENT.canvas.width / 2;
		this.messageChargement.y = ENVIRONEMENT.canvas.height / 2;
	};

	PageChargement.prototype.afficher = function() {
		var deferred = when.defer();

		ENVIRONEMENT.stage.addChild(this.messageChargement);

		ENVIRONEMENT.stage.update();

		deferred.resolve();

		return deferred.promise;
	};


    PageChargement.prototype.chargerMedia = function() {
        var deferred = when.defer();
        var that = this;

        var mediaListe = document.getElementById("media").childNodes;
        var mediaListeEtatChargement = {};
        var indiceMediaListe;
        var media;
        var intervaleValiderChargement;
        var nombreMedia = 0;

        for (indiceMediaListe = 0; indiceMediaListe < mediaListe.length; indiceMediaListe++) {
            media = mediaListe[indiceMediaListe];
            if(media.nodeType == Node.ELEMENT_NODE)
            {
                mediaListeEtatChargement[media.id] = media;
            }
            nombreMedia = Object.keys(mediaListeEtatChargement).length;

        }

        var estCharge = function(element)
        {
            if(element.tagName.toLowerCase() == "img")
            {
                // https://www.w3schools.com/jsref/prop_img_complete.asp
                return element.complete;
            }
            if(element.tagName.toLowerCase() == "audio")
            {
                // https://stackoverflow.com/questions/8059434/how-do-you-check-if-a-html5-audio-element-is-loaded
                return element.readyState == 4;
            }
        }

        var validerChargement = function()
        {
            var nombreFichierCharge;
            for (var cle in mediaListeEtatChargement)
            {
                if(estCharge(mediaListeEtatChargement[cle]))
                {
                    delete mediaListeEtatChargement[cle];
                }
            }
            nombreFichierCharge = nombreMedia - Object.keys(mediaListeEtatChargement).length;

            that.messageChargement.text = nombreFichierCharge + ' de ' + nombreMedia + ' fichiers chargés';

            ENVIRONEMENT.stage.update();

            if(nombreFichierCharge == nombreMedia)
            {
                clearInterval(intervaleValiderChargement);
                that.messageChargement.text = 'Cliquer pour commencer';

                ENVIRONEMENT.stage.update();

                deferred.resolve();
            }

        }

        intervaleValiderChargement = setInterval(validerChargement, 250);

        return deferred.promise;
    };


	return PageChargement;

});
