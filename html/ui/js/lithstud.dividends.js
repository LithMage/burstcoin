/**
 * Asset Exchange Logs v1.0
 * Made by Rimvydas (LithStud) lithstud@gmail.com
 * License: MIT 
 */
var BETA_DIV = (function ($, undefined) {

    var assetID;
    var totalShares;
    var totalShareHolders = 0;
    var ignoreIssuer = true; // dont calculate divs for issuer account
    var issuerAcc;
    var assetAccounts;
    var burstForDividends = 0;
    var autopayInProgress = false;
    var secretPhrase = '';
    var autoPayArray = [];
    var autoPayCursor = 0;

    $('#load_asset').on('click', function () {
        if ($(this).hasClass('disabled')) { return; }
        assetID = $('#asset_id').val() || null;

        $('#asset_id').val(assetID);

        if (assetID === null) {
            alert('Asset ID must be provided!');
        } else {
            $(this).addClass('disabled');
            init();
        }
    });

    $('#calculate').on('click', function () {
        burstForDividends = parseFloat($('#net_burst').val()) || 0;
        var perShare = Math.floor(burstForDividends / totalShares * 100000000) / 100000000;
        if (burstForDividends === 0) {
            alert('Incorrect BURST amount');
            return;
        }

        $('#asset_info span').empty().append(
            '=================================<br/>' +
            'BURST to issue: ' + burstForDividends + '<br/>' +
            'Per Share: ' + perShare + '<br/>'
        );

        $('#dividends_table').removeClass('hidden');

        var rows = '';
        var divs = 0;
        var tot = 0;
        assetAccounts.forEach(function (acc) {
            if (ignoreIssuer && acc.accountRS === issuerAcc) {
                // do nothing cause we ignore issuer
            } else {
                divs = (acc.quantityQNT * perShare).toFixed(8);
                tot += parseFloat(divs);
                rows += '<tr><td>' + acc.accountRS + '</td>' +
                    '<td>' + acc.quantityQNT + '</td>' +
                    '<td>' + divs + '</td>' +
                    '<td><button data-acc-id="' + acc.accountRS + '" data-dividends="' + divs + '" type="button" class="btn btn-default">Send!</button></td>' +
                    '</tr>';
            }
        }, this);

        $('#asset_info span').append(
            'Total to pay: ' + tot + ' + ' + totalShareHolders + ' fees'
        );

        $('#holders_table tbody').empty().append(rows);
    });

    $("body").on("click", "button[data-acc-id]", function (e) {
        e.preventDefault();
        var caller = $(this);
        var recipient = caller.data('acc-id');
        var dividends = convertToNQT(caller.data('dividends'));
        secretPhrase = $('#passphrase').val() || '';
        if (secretPhrase == '') { 
            alert('No passphrase entered!');
            return;
        }
        console.log('Try: ' + recipient + ' > ' + dividends);
        if (dividends <= 1) { // no point sending 0 amounts
            if (!autopayInProgress) { return; }
            autoPay(); // call next one
        }
        callAPI({
            requestType: "sendMoney",
            recipient: recipient,
            amountNQT: dividends,
            feeNQT: 100000000,
            secretPhrase: secretPhrase,
            message: $('#message').val() || '',
            deadline: 24
        }, function (response) {
            if (response.errorCode) {
                console.log('crashed during trying to sendMoney');
                console.log(response);
                return null;
            }
            //response.transaction = 'asdjbsifgsadf';
            caller.parent().empty().append(response.transaction);
            var msg = (dividends / 100000000).toFixed(8) + ' | ' + recipient + ' | ' + response.transaction;
            $('#easy_copy').append(msg + '<br/>');
            //console.log(caller.data('acc-id') + ' > ' + ($('#message').val() || ''));
            //console.log(caller.data('acc-id') + ' > ' + msg);
        }, function (xhr) {
            if (!autopayInProgress) { return; }
            autoPay(); // call next one
        });
    });

    $('#autopay').on('click', function () {
        secretPhrase = $('#passphrase').val() || '';
        if (secretPhrase == '') { 
            alert('No passphrase entered!');
            return;
        }
        if (autopayInProgress) { // bad idea to start second process
            return;
        }
        autopayInProgress = true;
        $(this).addClass('disabled');
        autoPayArray = $('button[data-acc-id]'); // get all buttons
        // init first click
        autoPay();
    });

    function autoPay() {
        // reached end of array or somehow got to this function without triggering autopay
        if (autoPayArray.length === autoPayCursor || !autopayInProgress) {
            autopayInProgress = false; // turn off autopay
            autoPayCursor = 0; // reset cursor
            console.log('Done autoPay()');
            return;
        }
        autoPayArray[autoPayCursor].click();
        autoPayCursor++; // allways increase so same button is never pressed again
    }

    function init() {
        // load asset information from api
        callAPI({
            requestType: "getAsset",
            asset: assetID
        }, loadAsset);
    }

    function loadAsset(response) {
        if (response.errorCode) {
            console.log('crashed during loadAsset()');
            console.log(response);
            return null;
        }
        $('#proccessor').removeClass('hidden');

        issuerAcc = response.accountRS;
        totalShareHolders = (ignoreIssuer) ? (response.numberOfAccounts - 1) : numberOfAccounts;

        $('#asset_info').empty().append(
            'Asset: ' + response.name + '<br/>' +
            'Issuer Account: ' + issuerAcc + '<br/>' +
            'Total Amount of Shares: ' + response.quantityQNT + '<br/>' +
            'Total Share Holders: ' + totalShareHolders + '<br/>'
        );

        // continue gathering information for dividends
        callAPI({
            requestType: "getAssetAccounts",
            asset: assetID
        }, calcShares);

    }

    function calcShares(response) {
        if (response.errorCode) {
            console.log('crashed during shares()');
            console.log(response);
            return null;
        }

        assetAccounts = response.accountAssets;
        totalShares = getTotalShares();

        $('#asset_info').append(
            'Total Shares: ' + totalShares + '<br/><span></span>'
        );

        $('#pre_calculate').removeClass('hidden');
    }

    function getTotalShares() {
        var total = 0;
        assetAccounts.forEach(function (acc) {
            if (ignoreIssuer && acc.accountRS === issuerAcc) {
                // do nothing cause we ignore issuer
            } else {
                total += parseInt(acc.quantityQNT);
            }
        }, this);
        return total;
    }

    function callAPI(jsonRequest, callbackSuccess, callbackComplete = null) {
        if (!jsonRequest.requestType) {
            return;
        }
        $.ajax({
            url: 'http://' + window.location.hostname.toLowerCase() + ':' + window.location.port + '/burst',
            type: 'POST',
            dataType: "json",
            data: jsonRequest,
            success: callbackSuccess,
            complete: callbackComplete
        });
    }

    function convertToNQT(currency) {
        currency = String(currency);

        var parts = currency.split(".");

        var amount = parts[0];

        //no fractional part
        if (parts.length == 1) {
            var fraction = "00000000";
        } else if (parts.length == 2) {
            if (parts[1].length <= 8) {
                var fraction = parts[1];
            } else {
                var fraction = parts[1].substring(0, 8);
            }
        } else {
            throw "Invalid input";
        }

        for (var i = fraction.length; i < 8; i++) {
            fraction += "0";
        }

        var result = amount + "" + fraction;

        //in case there's a comma or something else in there.. at this point there should only be numbers
        if (!/^\d+$/.test(result)) {
            throw "Invalid input.";
        }

        //remove leading zeroes
        result = result.replace(/^0+/, "");

        if (result === "") {
            result = "0";
        }

        return result;
    }


}(jQuery));