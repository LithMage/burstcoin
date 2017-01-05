/**
 * Asset Exchange Logs v1.0
 * Made by Rimvydas (LithStud) lithstud@gmail.com
 * License: MIT
 */
/**
 * @depends {nrs.js}
 */
var NRS = (function (NRS, $, undefined) {

    NRS.LithStud = NRS.LithStud || {}; // all my mods is in this Object 
    NRS.LithStud.Present = {}; // Present mod scope

    var eventStart = 1482624000000; // 12.25
    var eventEnd = 1483228800000; // 01.01
    var currTime = 0;

    var snowLight = false;
    var snowHard = false;

    var stateInterval;

    var annHtmlTemplate = '<div id="ann-present-box" class="panel-group">' +
        '<div class="panel panel-default ann-present-box">' +
        '<div class="panel-heading ann-present-header">' +
        '<h4 class="panel-title">' +
        '<a data-toggle="collapse" href="#ann-present-body">Festive Event 2016 by LithStud</a>' +
        '</h4>' +
        '</div>' +
        '<div id="ann-present-body" class="panel-collapse">' +
        '<div class="panel-body ann-present-body">' +
        '<p>Hi!</p>' +
        '<p>First of all - Thank you for using my mods. It is a great pleasure for a codder to know somebody likes his work.</p>' +
        '<p>And so because of that decided to make something special just for this upcoming festive time. While currently there is no changes except this announcement,' +
        ' be sure to open this wallet between 12.25 - 12.31 for a surprise!</p>' +
        '<p>Also at the same time i am organizing santa event for those who are using my mods. Here is how it goes. Anyone can send minimum 10 BURST to this address ' +
        '<b>BURST-DE6R-T5CY-VVXG-3W7R2</b> (add this account ID to your Contacts list as <b>BurstSanta</b>) or if he/she feels a giving spirint whatever amount, there is no' +
        'maximum. Also assets are wellcome as well. BUT! <b>Be sure to use Wallet that has been created BEFORE 2016.12.12 so there is no grinching.</b></p>' +
        '<p>On 2016.12.29 i will divide all that BURST between those wallets who sent a minimum of 10 BURST. If there is assets i will spread them randomly (but as even as possible,' +
        ' tho not taking those assets prices into account). I will add a bit of BURST from myself, as well as not taking any BURST or asset. You ask why? This event is a thank you for' +
        ' trusting me and my mods. I am not looking to make a profit from it.</p>' +
        '<p>Any further discussion about this event and mod can be done on the official BURST forums at <a href="https://forums.burst-team.us/topic/3027/holiday-mod">Festive Mod Thread</a></p>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';
    $(annHtmlTemplate).prependTo('#dashboard_page > .content');


    NRS.LithStud.Present.activate = function () {
        // prevent duplicates
        var cssId = 'lithstud-present-css';
        if (!document.getElementById(cssId)) {
            var head = document.getElementsByTagName('head')[0];
            var link = document.createElement('link');
            link.id = cssId;
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = './js/lithstud-present/lithstud-present.css';
            link.media = 'all';
            head.appendChild(link);
        }

        var jsId = 'lithstud-present-js';
        if (!document.getElementById(jsId)) {
            var body = document.getElementsByTagName('body')[0];
            var script = document.createElement('script');
            script.id = jsId;
            script.type = 'text/javascript';
            script.src = './js/lithstud-present/present-effects.js';
            //script.media = 'all';
            body.appendChild(script);
        }

        $('#ann-present-box, .small-box, .box, .btn-primary, .btn-default, .input-group, .modal-content, .form-group > .form-control, .nav-pills>li').addClass('festive-button');
        $('#asset_account:parent').removeAttr('style').addClass('asset-info-box festive-button');
        $('body, .right-side, .left-side, .content').addClass('bg-festive');

        var snowHtmlTemplate = '<div class="navbar-left">' +
            '<ul class="nav navbar-nav">' +
            '<li class="dropdown" id="light_snow"><a href="#">Light Snow</a></li>' +
            '<li class="dropdown" id="snowstorm"><a href="#">Snowstorm</a></li>' +
            '</ul>' +
            '</div>';
        $('body > header > nav').append(snowHtmlTemplate);

        // delay snowing
        setTimeout(function () {
            NRS.LithStud.Present.lightSnow();
        }, 3000);

        $('#light_snow').on('click', function () {
            NRS.LithStud.Present.lightSnow();
        });

        $('#snowstorm').on('click', function () {
            NRS.LithStud.Present.hardSnow();
        });
    }

    NRS.LithStud.Present.lightSnow = function () {
        if (snowHard) {
            $('body').removeClass('weather snow');
            snowHard = false;
        }
        if (!snowLight) {
            snowLight = true;
            $(document).snowfall();
        } else {
            snowLight = false;
            $(document).snowfall('clear');
        }
    }

    NRS.LithStud.Present.hardSnow = function () {
        if (snowLight) {
            snowLight = false;
            $(document).snowfall('clear');
        }
        if (!snowHard) {
            $('body').addClass('weather snow');
            snowHard = true;
        } else {
            snowHard = false;
            $('body').removeClass('weather snow');
        }
    }

    NRS.LithStud.Present.init = function () {
        currTime = Date.now();
        //console.log(eventStart + ' | ' + currTime + ' | ' + eventEnd);
        if (currTime < eventStart || currTime > eventEnd) { // lets wait 3:) 
            if (stateInterval) { // interval running
                //console.log('Waiting for event');
                return;
            }
            //console.log('Not Loged in');
            // check every 30 min if its time to party
            stateInterval = setInterval(function () {
                NRS.LithStud.Present.init();
            }, 1000 * 60 * 30);
        } else {
            if (stateInterval) {
                clearInterval(stateInterval);
            }
            //console.log('Starting Festive Mod');
            NRS.LithStud.Present.activate(); 
        }
    }

    NRS.LithStud.Present.init(); // start this mod

    //console.log(NRS); // for dev only

    return NRS;
} (NRS || {}, jQuery));
