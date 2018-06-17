define([	'underscore',
			'when',
			'createjs',
			'radio'],
function(	_,
			when,
			createjs,
			radio) {

	'use strict';
	var lenteur = 300;

	// Définition de fonctions utilisées comme fonctions d'écouteurs d'événements en callback

	var emettreClicJoueur = function() {
		radio('joueur-clic').broadcast();
	};

	var emettrePauseJoueur = function() {
		radio('joueur-en-pause').broadcast();
	};

	// constructeur de la scène

	var PageJeu = function() {
		// définir un tableau hash vide pour les objets de présentation comme les boutons et les messages
		this.ui = {};

		this.initialiser();
	};

    // ne pas avoir à remplacer le prototype car ce n'est pas un réel
    // constructeur createjs avec un initialiser par défaut ()

	PageJeu.prototype.initialiser = function() {

        // joue la musique de fond dès que le jeu est instancié; l'utilisateur a besoin de
        // quelque chose à écouter pendant que le reste de l'installation continue!
        ENVIRONEMENT.son.jouer("marbleZoneSong");

        // Écouter les événements 'jeu-tick', 'joueur-collision-sol', 'monstre-collision-joueur' et 'joueur-mort-fin' pour y réagir
		radio('jeu-tick').subscribe([this.testerCollisionSol, this]);
        radio('joueur-collision-sol').subscribe([this.gererMortJoueurAuSol, this]);
        radio('monstre-collision-joueur').subscribe([this.gererMortJoueurEnVol, this]);
        radio('joueur-mort-fin').subscribe([this.acheverPartie, this]);
	};

	PageJeu.prototype.chargerElementVisuel = function() {
		var deferred = when.defer(),
			that = this;

            // TODO: serait cool de ne pas avoir à charger les ressources séparément comme ça
            require(['toile-de-fond/Ciel' ,
                    'toile-de-fond/Sol'  ,
                    'personnage/Joueur' ,
                    'personnage/JoueurMort',
                    'personnage/MonstreAttaque',
                    'personnage/Monstre',
                    'interaction/BoutonPause',
                    'interaction/Pointage'  ]  ,
		function(	Ciel ,
                    Sol ,
                    Joueur ,
					JoueurMort,
					MonstreAttaque,
					Monstre,
					BoutonPause,
					Pointage ) {


			that.ciel = new Ciel();
			that.sol = new Sol();

            // note que le joueur et le joueur mort sont deux entités séparées; c'est
            // parce qu'ils utilisent deux feuilles de sprites et des ensembles de métriques différents
			that.joueur = new Joueur();
			that.joueurMort = new JoueurMort();

            // place le premier monstre directement hors écran lors de l'instanciation, et place le second
            // derrière, sur la base des calculs du premier
			that.monstre1 = new Monstre(ENVIRONEMENT.canvas.width, false);
			that.monstre2 = new Monstre((that.monstre1.x + that.monstre1.width), true);
			that.monstreAttaque = new MonstreAttaque();

			that.ui.boutonPause = new BoutonPause();

			that.ui.pointage = new Pointage();

			deferred.resolve();
		});

		return deferred.promise;
	};

	PageJeu.prototype.attachListeners = function() {
		var deferred = when.defer();

		ENVIRONEMENT.canvas.element.addEventListener('click', emettreClicJoueur);

		this.ui.boutonPause.addEventListener('click', emettrePauseJoueur);

		deferred.resolve();

		return deferred.promise;
	};

	PageJeu.prototype.removeListeners = function() {
		ENVIRONEMENT.canvas.element.removeEventListener('click', emettreClicJoueur);

		this.ui.boutonPause.removeEventListener('click', emettrePauseJoueur);

		ENVIRONEMENT.stage.removeChild(this.ui.boutonPause);

		ENVIRONEMENT.stage.update();
	};

	PageJeu.prototype.startTicker = function() {
		var deferred = when.defer(),
			tickProxy;

        // si aucun écouteur d'événement n'existe pour l'événement 'tick', créez-en un
		if (!createjs.Ticker.hasEventListener('tick')) {
			// proxy le callback, pour que 'this' dans le callback se réfère au 'this' de cette page
			tickProxy = createjs.proxy(this.tick, this);

		    createjs.Ticker.addEventListener('tick', tickProxy);
		    createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
			createjs.Ticker.setFPS(30);

			deferred.resolve();
		}
		// sinon l'écouteur existe déjà
		else {
			deferred.resolve();
		}

		return deferred.promise;
	};

	PageJeu.prototype.afficher = function() {
		ENVIRONEMENT.stage.addChild(	this.ciel,
									this.sol,
									this.monstre1,
									this.monstre2,
									this.joueur,
									this.ui.boutonPause,
									this.ui.pointage);

		ENVIRONEMENT.stage.update();
	};

	// le joueur mort est affiché une seule fois alors on utilise un singleton
	PageJeu.prototype.mettreEnSceneMortJoueurAuSol = _.once(function() {
		var deferred = when.defer();

        // manipuler légèrement la position du joueur mort donc il apparaît dans le centre du joueur vivant
		this.joueurMort.x = this.joueur.x + 10;
		this.joueurMort.y = this.joueur.y - 10;

        // ajouter le joueur mort à la scène directement après le joueur vivant, pour le faire apparaître sur le dessus
		ENVIRONEMENT.stage.addChildAt(this.joueurMort, (ENVIRONEMENT.stage.getChildIndex(this.joueur) + 1));

		ENVIRONEMENT.stage.update();

		deferred.resolve();

		return deferred.promise;
	});

    // le joueur mort est affiché une seule fois alors on utilise un singleton
    PageJeu.prototype.mettreEnSceneMortJoueurEnVol = _.once(function() {
        var deferred = when.defer();

        // manipuler légèrement la position du joueur mort donc il apparaît dans le centre du joueur vivant
        this.joueurMort.x = this.joueur.x + 10;
        this.joueurMort.y = this.joueur.y - 10;

        // ajouter le joueur mort à la scène directement après le joueur vivant, pour le faire apparaître sur le dessus
        ENVIRONEMENT.stage.addChildAt(this.joueurMort, (ENVIRONEMENT.stage.getChildIndex(this.joueur) + 1));


        this.monstreAttaque.x = this.joueur.x + this.joueur.width;
        this.monstreAttaque.y = this.joueur.y;

        // ajouter le monstre attaquant à la scène directement après le monstre, pour le faire apparaître sur le dessus
        ENVIRONEMENT.stage.addChildAt(this.monstreAttaque, (ENVIRONEMENT.stage.getChildIndex(this.joueur) + 1));

        ENVIRONEMENT.stage.removeChild(this.joueur);

        ENVIRONEMENT.stage.update();

        deferred.resolve();

        return deferred.promise;
    });

	PageJeu.prototype.tick = function(evenement) {
        // convertir delta de millisecondes en secondes
		var deltaInSeconds = evenement.delta / lenteur;

		if (!createjs.Ticker.getPaused()) {
            // chaque delta (ou 'change event'), déplace une fraction du nombre total de pixels par seconde
            // (33,999 / 1000) * 20
            // = 0.0339 * 20
            // = 0,639 pixels par delta
            this.activerDefilementCiel(deltaInSeconds * 20);
			this.activerDefilementSol(deltaInSeconds * 60);

			this.joueur.tick(evenement, deltaInSeconds);

			this.monstre1.tick(evenement, deltaInSeconds, this.monstre2.x, this.monstre2.width, this.monstre2.xSpacing);
			this.monstre2.tick(evenement, deltaInSeconds, this.monstre1.x, this.monstre1.width, this.monstre1.xSpacing);

			ENVIRONEMENT.stage.update(evenement);
		}
	};

	PageJeu.prototype.activerDefilementCiel = function(pixelsPerDelta) {
		this.ciel.defiler(pixelsPerDelta);
	};

	PageJeu.prototype.activerDefilementSol = function(pixelsPerDelta) {
		this.sol.defiler(pixelsPerDelta);
	};

	// Définition des fonctions de callback

    // puisque les décors sont considérés comme des objets inanimés qui n'interagissent pas directement avec
    // le joueur, la scène gère les interactions avec eux
    PageJeu.prototype.testerCollisionSol = function(joueurPositionX, joueurPositionY, joueurLargeur, joueurHauteur) {
		if ((joueurPositionY + joueurHauteur) >= ENVIRONEMENT.canvas.height -96) {
            radio('joueur-collision-sol').broadcast();
		}
	};

    PageJeu.prototype.gererMortJoueurAuSol = _.once(function() {
        this.removeListeners();

        this.mettreEnSceneMortJoueurAuSol().then(function() {
            radio('joueur-mort-au-sol-debut').broadcast();
        });
    });

    PageJeu.prototype.gererMortJoueurEnVol = _.once(function() {
        this.removeListeners();

        this.mettreEnSceneMortJoueurEnVol().then(function() {
            radio('joueur-mort-en-vol-debut').broadcast();
        });
    });

	PageJeu.prototype.acheverPartie = _.once(function() {
		var deferreds = [];

		var faireDisparaitreElement = function(element) {
			var deferred = when.defer();

			createjs.Tween.get(element).to({alpha:0}, 1000).call(function() {
				deferred.resolve();
			});

			return deferred.promise;
		};

        // pour chaque élément de la scène, exécutez la fonction faireDisparaitreElement et publiez sa résultante
        // exécuté différé dans le tableau deferreds
		_.each(ENVIRONEMENT.stage.children, function(element) {
			deferreds.push(faireDisparaitreElement(element));
		});


        // quand chaque élément a été passé avec succès, rafraîchir le navigateur, efficacement
        // redémarrer le jeu
        when.all(deferreds).then(function() {
			window.location.reload(false);
		});
	});

	return PageJeu;

});
