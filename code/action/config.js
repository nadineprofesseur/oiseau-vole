require.config({
	baseUrl: 'action/',
    paths: {
    	// chemin des sous-répertoires
    	page: 'page',
        toileDeFond: 'toile-de-fond',
        personnage: 'personnage',

        underscore: 'libs/underscore',
        radio: 'libs/radio.min',
        when: 'libs/when',
        createjs: 'libs/createjs-2013.12.12.min'
    },
    urlArgs: 'bust=' +  (new Date()).getTime(),
    shim: {
        'underscore': {
            exports: '_'
        },
        'radio': {
        	exports: 'radio'
        },
        'when': {
        	exports: 'when'
        },
        'createjs': {
        	exports: 'createjs'
        }
    }
});
