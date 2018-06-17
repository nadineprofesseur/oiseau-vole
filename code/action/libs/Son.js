var Son = function ()
{
    // http://www.storiesinflight.com/html5/audio.html
    var channel_max = 10;										// number of channels
    audiochannels = new Array();

    var initialiser = function()
    {
        for (a=0;a<channel_max;a++) {									// prepare the channels
            audiochannels[a] = new Array();
            audiochannels[a]['channel'] = new Audio();						// create a new audio object
            audiochannels[a]['finished'] = -1;							// expected end time for this channel
        }
    }

    this.jouer = function(idSon) {
        for (a=0;a<audiochannels.length;a++) {
            thistime = new Date();
            // is this channel finished?

            if(document.getElementById(idSon).loop)
            {
                setInterval(function(){jouerSon(idSon)}, document.getElementById(idSon).duration*1000);
            }
            if (audiochannels[a]['finished'] < thistime.getTime())
            {
                audiochannels[a]['finished'] = thistime.getTime() + document.getElementById(idSon).duration*1000;
                audiochannels[a]['channel'].src = document.getElementById(idSon).src;
                audiochannels[a]['channel'].load();
                audiochannels[a]['channel'].play();
                break;
            }

        }
    }

    initialiser();
}
