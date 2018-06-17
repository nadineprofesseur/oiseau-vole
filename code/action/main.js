require([	'when',
			'createjs',
			'page/PageChargement',
			'page/PageJeu'],
function(	when,
			createjs,
			PageChargement,
			PageJeu) {

	'use strict';


	// récupérer le canvas avec le javascript vanille
	var canvasJeu;
    var pageJeu;
    var pageChargement;


    var initialiser = function() {
        if(document.readyState == "interactive" || document.readyState == "complete")
        {
            document.removeEventListener('readystatechange', initialiser);
            redimensionnerCanavas();
            canvasJeu = document.getElementById('canvas-jeu');

            // créer le canevas et mettre en cache des références à ses métriques
            ENVIRONEMENT.canvas = {
                element: canvasJeu,
                width: canvasJeu.offsetWidth,
                height: canvasJeu.offsetHeight
            };

            // créer le stage de createjs
            ENVIRONEMENT.stage = new createjs.Stage(ENVIRONEMENT.canvas.element);

            // créer le gestionnaire de son
            ENVIRONEMENT.son = new Son();

            // instancier la première scène de chargement
            pageChargement = new PageChargement();

            // la scène de chargement est rendue en premier parce que nous voulons montrer la progression du chargement à
            // utilisateur; Une fois les ressources chargées, attachez un gestionnaire de clic pour lancer le jeu
            pageChargement.afficher().then(function() {
                return pageChargement.chargerMedia();
            }).then(function() {
                ENVIRONEMENT.canvas.element.addEventListener('click', initialiserJeu);
            }, function(errorMsg) {
                console.log('error loading assets: ', errorMsg);
            });
        }
        else
        {
            document.addEventListener('readystatechange', initialiser);

        }
    }


	var viderScene = function() {
		ENVIRONEMENT.stage.removeAllChildren();

		ENVIRONEMENT.stage.update();
	};

    var redimensionnerCanavas = function(){
        var content = document.getElementById("content");
        var canvasJeu = document.getElementById("canvas-jeu");
        if (canvasJeu.width  < content.offsetWidth)
        {
            canvasJeu.width  = content.offsetWidth;
        }

        if (canvasJeu.height < content.offsetHeight)
        {
            canvasJeu.height = content.offsetHeight;
        }
    }



	var initialiserJeu = function() {
		viderScene();

        // définit la scène de chargement sur null afin de faciliter la récupération de mémoire
		pageChargement = null;

        // supprime les écouteurs d'événement actuellement attachés au canevas; normalement, ces événements
        // serait attaché à un élément dans la scène, et serait supprimé dans le cadre du
        // processus de nettoyage de la scène
        ENVIRONEMENT.canvas.element.removeEventListener('click', initialiserJeu);

        // instancier la deuxième scène: l'écran de jeu réel
		pageJeu = new PageJeu();
        pageJeu.chargerElementVisuel().then(function() {
			return pageJeu.attachListeners();
		}).then(function() {
			return pageJeu.startTicker();
		}).then(function() {
			pageJeu.afficher();
		}, function() {
			console.log('failed to instantiate game scene');
		});
	};
    initialiser();

});
