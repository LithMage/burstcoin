/**
 * RewardAssigment v1.0
 * Made by Rimvydas (LithStud) lithstud@gmail.com
 * GitHub: https://github.com/LithMage
 * 2017.02.17
 * License: MIT
 */
/**
 * @depends {nrs.js}
 */
var NRS = (function (NRS, $, undefined) {

    NRS.LithStud = NRS.LithStud || {}; // all my mods is in this Object
    NRS.LithStud.RA = {}; // Reward Assigment scope
    //console.log(NRS); // for dev only

    // --- CSS Ruleset for loading indicator ---
    // prevent duplicates
    var cssId = 'lithstud-loading-css';
    if (!document.getElementById(cssId)) {
        var head = document.getElementsByTagName('head')[0];
        var link = document.createElement('link');
        link.id = cssId;
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = './css/lithstud-loader.css';
        link.media = 'all';
        head.appendChild(link);
    }
    // --- END OF CSS RULESET ---

    // --- TEMPLATE INJECTION ---
    // Template for modal (index.html)
    var template = '<div class="modal fade" id="reward_assigment_modal">' +
        '<div class="modal-dialog modal-dialog-700">' +
        '<div class="modal-content">' +
        '<div class="modal-header">' +
        '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>' +
        '<h4 class="modal-title">Set Reward Recipient</h4>' +
        '</div>' +
        '<div class="modal-body">' +
        '<form role="form" autocomplete="off">' +
        '<div class="callout callout-danger error_message" style="display:none"></div>' +
        '<div class="form-group">' +
        '<label for="send_money_recipient" data-i18n="recipient">Recipient</label>' +
        '<div class="input-group">' +
        '<input type="text" class="form-control" name="recipient" id="reward_recipient" placeholder="Recipient numeric ID" autofocus="" tabindex="1">' +
        '</div>' +
        '</div>' +
        '<div class="form-group secret_phrase">' +
        '<label for="reward_assigment_password" data-i18n="passphrase">Passphrase</label>' +
        '<input type="password" name="secretPhrase" id="reward_assigment_password" class="form-control" placeholder="" tabindex="8">' +
        '</div>' +
        '<div class="form-group recipient_public_key">' +
        '<label for="reward_recipient_public_key" data-i18n="recipient_public_key">Recipient Public Key</label>' +
        '<input type="text" class="form-control" name="recipientPublicKey" id="reward_recipient_public_key" placeholder="Public Key" data-i18n="[placeholder]public_key" tabindex="2" spellcheck="false">' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-xs-6 col-sm-6 col-md-6">' +
        '<div class="form-group">' +
        '<label for="reward_assigment_fee" data-i18n="fee">Fee</label>' +
        '<div class="input-group">' +
        '<input type="number" name="feeNXT" id="reward_assigment_fee" class="form-control" step="any" min="1" placeholder="Fee" data-i18n="[placeholder]fee" data-default="1" value="1" tabindex="4">' +
        '<span class="input-group-addon">BURST</span>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="col-xs-6 col-sm-6 col-md-6">' +
        '<div class="form-group">' +
        '<label for="reward_assigment_deadline" data-i18n="deadline_hours">Deadline (Hours)</label>' +
        '<input type="number" name="deadline" id="reward_assigment_deadline" class="form-control" placeholder="Deadline" data-i18n="deadline" min="1" data-default="24" value="24" tabindex="5"></input>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="callout account_info" style="display:none;margin-bottom: 0;"></div>' +
        '<input type="hidden" name="request_type" value="setRewardRecipient" data-default="setRewardRecipient">' +
        '</form>' +
        '</div>' +
        '<div class="modal-footer" style="margin-top:0;">' +
        '<button type="button" class="btn btn-default" data-dismiss="modal" data-i18n="cancel">Cancel</button>' +
        '<button type="button" class="btn btn-primary" data-loading-text="Submitting...">Set Recipient</button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';

    // Template for toolbar (index.html)
    var toolbarTemplate = '<div class="alert-success alert alert-no-icon" id="reward_assigment_toolbar" ' +
        'style="display:block;padding:5px;padding-left:5px;margin-bottom:15px;">' +
        'Mining Reward set to:<div class="spinner spinner-1"></div> <span class="reward-account"></span> ' +
        '<span>(<a href="#" data-toggle="modal" data-target="#reward_assigment_modal">Change RewardAssigment</a>)</span>' +
        '</div>';

    // prevent duplicates
    if ($('#reward_assigment_modal').length === 0) {
        $(template).insertBefore('#decrypt_note_form_container');
    }
    if ($('#reward_assigment_toolbar').length === 0) {
        $(toolbarTemplate).insertAfter('#secondary_dashboard_message');
    }
    // --- END OF TEMPLATE INJECTION ---


    var started = false;
    var stateInterval;
    var stateIntervalSeconds = 30; // default interval to check for changes

    var rewardAccount = 'Solo Mining';

    NRS.LithStud.RA.getRewardAccount = function () {
        // show we are working
        $('#reward_assigment_toolbar .spinner').show();
        NRS.sendRequest("getRewardRecipient", {
            "account": NRS.account
        }, function (response, input) {
            if (response.errorCode === 5) { // Unknown Account / account hasnt been activated
                $('#reward_assigment_toolbar')
                    .removeClass('alert-success').addClass('alert-danger')
                $('#reward_assigment_toolbar .reward-account')
                    .html('Your account needs to be activated first.');
                $('#reward_assigment_toolbar .spinner').hide();
            } else if (NRS.account === response.rewardRecipient) {
                $('#reward_assigment_toolbar .reward-account').html(rewardAccount);
                $('#reward_assigment_toolbar .spinner').hide();
            } else {
                NRS.sendRequest("getAccount", {
                    "account": response.rewardRecipient
                }, function (response, input) {
                    rewardAccount = response.name || response.accountRS;
                    var linkToRecipient = '<a href="#" data-user="' +
                        String(response.accountRS).escapeHTML() +
                        '" class="user-info">' + rewardAccount + '</a>';
                    $('#reward_assigment_toolbar .reward-account').html(linkToRecipient);
                    $('#reward_assigment_toolbar .spinner').hide();
                });
            }
        });
    }

    //$('#demo_award').on('click', function() { NRS.LithStud.RA.getRewardAccount(); });

    NRS.LithStud.RA.init = function () {
        if (NRS.account === '') { // probably not loged in 
            started = false;
            if (stateInterval) {
                //console.log('Waiting for login');
                return;
            } // interval is running
            //console.log('Not Loged in');
            // check every 5 seconds for changes in account
            stateInterval = setInterval(function () {
                NRS.LithStud.RA.init();
            }, 1000 * 5);
        } else {
            if (stateInterval) {
                clearInterval(stateInterval);
            }
            //console.log('Starting Mod');
            NRS.LithStud.RA.getRewardAccount();
            //NRS.LithStud.RA.setStateInterval(stateIntervalSeconds); // start tracking assigment 
        }
    }

    NRS.LithStud.RA.setStateInterval = function (seconds) {
        if (seconds == stateIntervalSeconds && stateInterval && started) {
            //console.log('Mod running at ' + stateIntervalSeconds + 's interval');
            return;
        }

        if (stateInterval) {
            clearInterval(stateInterval);
        }

        stateIntervalSeconds = seconds;

        //console.log('Starting mod interval');
        stateInterval = setInterval(function () {
            // here function to track confirmations count
        }, 1000 * seconds);
        started = true;
    }

    NRS.LithStud.RA.init(); // start this mod
    return NRS;
}(NRS || {}, jQuery));
