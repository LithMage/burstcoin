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
        '<label for="reward_recipient" data-i18n="recipient">Recipient</label>' +
        '<input type="text" class="form-control" name="recipient" id="reward_recipient" placeholder="Pool numeric ID" autofocus="" tabindex="1">' +
        '</div>' +
        '<div class="form-group secret_phrase">' +
        '<label for="reward_assigment_password" data-i18n="passphrase">Passphrase</label>' +
        '<input type="password" name="secretPhrase" id="reward_assigment_password" class="form-control" placeholder="Passphrase" data-i18n="[placeholder]Passphrase" tabindex="8">' +
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
        '<button type="button" id="set_reward_recipient" class="btn btn-primary" data-i18n="set_pool">Set Pool</button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';

    // prevent duplicates
    if ($('#mining-box').length === 0) {
        var miningBox = $('#goto_forged_blocks').parent()[0];
        miningBox.id = 'mining-box';
        //var parent = miningBox.parent();
        var newBoxHtml = '<div id="" class="inner">' +
            '<h3><div id="mining_spinner" class="spinner spinner-1"></div>' +
            '<span id="mining_place" class="overflow-hidden" data-i18n="solo">Solo</span>' +
            '<span id="account_forged_balance" class="overflow" style="display: none">0</span></h3>' +
            '<p id="reward_status">&nbsp;</p></div>' +
            '<div class="icon"><i class="ion ion-hammer"></i></div>' +
            '<div class="mining-box-footer small-custom-footer">' +
            '<a href="#" data-toggle="modal" data-target="#reward_assigment_modal">' +
            '<span data-i18n="change_pool">Change Pool</span> <i class="fa fa-arrow-circle-right"></i></a>' +
            '<a href="#" id="goto_forged_blocks" class="small-box-footer"><span data-i18n="more_info">More Info</span> <i class="fa fa-arrow-circle-right"></i></a>' +
            '</div>';

        $('#mining-box').html(newBoxHtml);
        // since we broke the link to click event copy/paste handler from nrs.blocks.js
        $("#goto_forged_blocks").click(function (e) {
            e.preventDefault();

            $("#blocks_page_type").find(".btn:last").button("toggle");
            NRS.blocksPageType = "forged_blocks";
            NRS.goToPage("blocks");
        });
    }
    if ($('#reward_assigment_modal').length === 0) {
        $(template).insertBefore('#decrypt_note_form_container');
    }
    // --- END OF TEMPLATE INJECTION ---


    var started = false;
    var stateInterval;
    var stateIntervalSeconds = 30; // default interval to check for changes

    var rewardAccount = 'Solo';

    function hideMiningPlace() {
        $('#mining_place').removeClass('overflow').addClass('overflow-hidden');
    }

    function showMiningPlace() {
        $('#mining_place').removeClass('overflow-hidden').addClass('overflow');
    }

    NRS.LithStud.RA.getRewardAccount = function () {
        // show we are working
        $('#mining_spinner').show();
        hideMiningPlace();
        //console.log('Getting recipient');
        NRS.sendRequest("getRewardRecipient", {
            "account": NRS.account
        }, function (response, input) {
            //console.log(response);
            if (response.errorCode) { // Some kind off error
                rewardAccount = 'None';
                //$('#reward_assigment_toolbar').show();
                $.growl(response.errorDescription, { "type": "danger" });
                $('#mining_spinner').hide();
                $('#mining_place').html(rewardAccount);
                $('#reward_status').html('Pool set');
                showMiningPlace();
            } else if (NRS.account == response.rewardRecipient) {
                $('#mining_spinner').hide();
                $('#mining_place').html(rewardAccount);
                $('#reward_status').html('Pool set');
                showMiningPlace();
            } else {
                NRS.sendRequest("getAccount", {
                    "account": response.rewardRecipient
                }, function (response, input) {
                    //console.log(response);
                    rewardAccount = response.name || response.accountRS;
                    var linkToRecipient = '<a href="#" data-user="' +
                        String(response.accountRS).escapeHTML() +
                        '" class="user-info">' + rewardAccount + '</a>';
                    //$('#reward_assigment_toolbar .reward-account').html(linkToRecipient);
                    $('#mining_spinner').hide();
                    $('#mining_place').html(linkToRecipient);
                    $('#reward_status').html('Pool set');
                    showMiningPlace();
                });
            }
        });
    }

    function startCheckinRewardStatus() {
        $('#reward_status').html('Changing pool <span id="reward_status_confirmations">0</span> of 4 conf.');
        NRS.sendRequest("getUnconfirmedTransactions", { // first check if there is unsent tx
            "account": NRS.account
        }, function (response) {
            var total = response.unconfirmedTransactions.length;
            if (total > 0) {
                for (var i = 0; i < total; i++) {
                    if (response.unconfirmedTransactions[i].type == 20 &&
                        response.unconfirmedTransactions[i].sender == NRS.account) {
                        // repeat after 30s
                        setTimeout(startCheckinRewardStatus, stateIntervalSeconds * 1000);
                        return;
                    }
                }
                // didnt find assigment in unconfirmed ones
                checkBlockchain();
            } else { // now check blockchain
                checkBlockchain();
            }
        });
    }

    function checkBlockchain() {
        NRS.sendRequest("getAccountTransactions", {
            "account": NRS.account,
            "type": 20, // reward assigment type
            "lastIndex": 0 // fetch just latest assignment
        }, function (response, input) {
            //console.log(response);
            if (response.errorCode) { // some kind of error (might not be such tx)
                // let this handle the rest
                //console.log('Forward to getRA from error');
                NRS.LithStud.RA.getRewardAccount();
            } else {
                if (response.transactions.length > 0) {
                    if (response.transactions[0].sender == NRS.account) {
                        NRS.LithStud.RA.getRewardAccount();
                        return;
                    }
                    var confirmations = response.transactions[0].confirmations;
                    //console.log(confirmations);
                    if (confirmations > 3) { // 4+ conf. means recipient is set
                        NRS.LithStud.RA.getRewardAccount();
                    } else {
                        $('#reward_status_confirmations').text(confirmations);
                        // repeat after 30s
                        setTimeout(startCheckinRewardStatus, stateIntervalSeconds * 1000);
                    }
                } else {
                    //console.log('Forward to getRA since no better idea');
                    NRS.LithStud.RA.getRewardAccount();
                }
            }
        });
    }

    $("#reward_assigment_modal").on("hide.bs.modal", function (e) {
        //console.log('Set recipient reward modal closed');
        // clean up inputs
        cleanButton();
        $('#reward_assigment_fee').val('1');
        $('#reward_recipient').val('');
        $('#reward_assigment_password').val('');
        $('#reward_assigment_deadline').val('24');
    });

    function cleanButton() {
        $("#set_reward_recipient").text('Set Pool').removeClass('disabled');
    }

    $("#set_reward_recipient").on('click', function (e) {
        e.preventDefault();
        $('#reward_assigment_modal .callout-danger').hide();
        $("#set_reward_recipient").text('Submiting...').addClass('disabled');
        var feeBURST = parseFloat($('#reward_assigment_fee').val());
        if (feeBURST < 1) {
            setWarning('Fee cant be smaller than 1 BURST!');
            cleanButton();
            return;
        }
        var feeNQT = NRS.convertToNQT(feeBURST);
        var recipient = $('#reward_recipient').val() || '';
        if (recipient == '') {
            setWarning('Please provide pool account numeric ID! If mining solo - your account ID: ' +
                NRS.account);
            cleanButton();
            return;
        }
        var passphrase = $('#reward_assigment_password').val() || '';
        if (passphrase == '') {
            setWarning('Passphrase not entered!');
            cleanButton();
            return;
        }
        var deadline = parseInt($('#reward_assigment_deadline').val()) * 60 || 1440; // default 24h        
        NRS.sendRequest("setRewardRecipient", {
            "recipient": recipient,
            "secretPhrase": passphrase,
            "feeNQT": feeNQT,
            "deadline": deadline
        }, function (response, input) {
            if (response.errorCode) {
                setWarning(response.errorDescription);
                cleanButton();
                return;
            }
            // setting up new recipient, lets track it
            //$('#reward_status').html('Changing pool <span id="reward_status_confirmations">0</span> of 4 conf.');
            startCheckinRewardStatus();
            $("#reward_assigment_modal").modal('hide');
        });
    });

    function setWarning(msg) {
        $('#reward_assigment_modal .callout-danger').empty().text(msg).show();
    }

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
            //NRS.LithStud.RA.getRewardAccount();
            startCheckinRewardStatus();
            //NRS.LithStud.RA.setStateInterval(stateIntervalSeconds); // start tracking assigment 
        }
    }

    NRS.LithStud.RA.setStateInterval = function (seconds, runThis) {
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
            runThis();
        }, 1000 * seconds);
        started = true;
    }

    NRS.LithStud.RA.init(); // start this mod
    return NRS;
}(NRS || {}, jQuery));



/* setRewardRecipient response */
/*
{
    "signatureHash":"384645ab55c11026dc6d36cae07f7b1c12ac4a8b8d7e7199449e307952686c65", "unsignedTransactionBytes":"14101f2abf04a005d9a600411df3e5d025e1f070de347c0a0e218035ae459a038efc4aa3d211d44a97b0e5d5c8bc5c10000000000000000000e1f5050000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fd050500752d07f462ce501101",
        "transactionJSON": {
            "senderPublicKey":"d9a600411df3e5d025e1f070de347c0a0e218035ae459a038efc4aa3d211d44a",
            "signature":"cf4b00ca362743b352413a6d8440b68a3b2e0ba36fb6a79ea40f1ef31bc5300290fe5af32d2b3d0b4c590980a0cc2185e88b95a29a505d6b02bd89991fc6c7be",
            "feeNQT":"100000000",
            "type":20,
            "fullHash":"9df4821e914236981c5f112dfe76c6b1bae3c9e8b5f3d506b470e4df41f3a1b6",
            "version":1,
            "ecBlockId":"1247724021177855349",
            "signatureHash":"384645ab55c11026dc6d36cae07f7b1c12ac4a8b8d7e7199449e307952686c65",
            "attachment": {
                "version.RewardRecipientAssignment":1
            },
            "senderRS":"BURST-DE6R-T5CY-VVXG-3W7R2",
            "subtype":0,
            "amountNQT":"0",
            "sender":"1179024773232308375",
            "recipientRS":"BURST-DE6R-T5CY-VVXG-3W7R2",
            "recipient":"1179024773232308375",
            "ecBlockHeight":329213,
            "deadline":1440,
            "transaction":"10968027133557011613",
            "timestamp":79637023,
            "height":2147483647
        },
        "broadcasted":true,
        "requestProcessingTime":9248,
        "transactionBytes":"14101f2abf04a005d9a600411df3e5d025e1f070de347c0a0e218035ae459a038efc4aa3d211d44a97b0e5d5c8bc5c10000000000000000000e1f505000000000000000000000000000000000000000000000000000000000000000000000000cf4b00ca362743b352413a6d8440b68a3b2e0ba36fb6a79ea40f1ef31bc5300290fe5af32d2b3d0b4c590980a0cc2185e88b95a29a505d6b02bd89991fc6c7be00000000fd050500752d07f462ce501101",
        "fullHash":"9df4821e914236981c5f112dfe76c6b1bae3c9e8b5f3d506b470e4df41f3a1b6",
        "transaction":"10968027133557011613"
}
*/