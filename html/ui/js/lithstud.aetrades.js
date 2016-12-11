/**
 * Asset Exchange Logs v1.0
 * Made by Rimvydas (LithStud) lithstud@gmail.com
 * License: MIT
 */
/**
 * @depends {nrs.js}
 */
var NRS = (function (NRS, $, undefined) {

    // --- TEMPLATE INJECTION ---
    // Template for dashboard (index.html)
    var template = '<div class="row">' +
        '<div class="col-md-12">' +
        '<div class="box box-primary">' +
        '<div class="box-header">' +
        '<h3 class="box-title" data-i18n="asset_exchange_transactions">Asset Exchange Transactions</h3>' +
        '</div>' +
        '<div class="box-body no-padding">' +
        '<div class="data-container data-loading" data-no-padding="true" data-extra="#dashboard_trades_footer">' +
        '<table class="table table-striped" id="dashboard_trades_table">' +
        '<thead>' +
        '<tr>' +
        '<th data-i18n="date">Date</th>' +
        '<th data-i18n="asset">Asset</th>' +
        '<th colspan="2" data-i18n="quantity">Quantity</th>' +
        '<th data-i18n="price">Price</th>' +
        '<th colspan="2" data-i18n="total">Total</th>' +
        '<th><span data-i18n="buyer">Buyer</span>/<span data-i18n="seller">Seller</span></th>' +
        '</tr>' +
        '</thead>' +
        '<tbody>' +
        '</tbody>' +
        '</table>' +
        '<div class="data-loading-container"><img src="img/loading_indicator.gif" alt="Loading..." width="32" height="32" /></div>' +
        '<div class="data-empty-container">' +
        '<p data-i18n="no_trades_yet">No trades yet.</p>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<!--' +
        '<div class="box-footer" id="dashboard_trades_footer" style="display: none"><button class="btn btn-primary goto-page" data-page="trades"><i class="fa fa-caret-right"></i> <span data-i18n="view_more">View More</span></button></div>' +
        '-->' +
        '</div>' +
        '</div>' +
        '</div>';

    // prevent duplicates
    if ($('#dashboard_trades_table').length === 0) {
        $('#dashboard_page .content').append(template);
    }
    // --- END OF TEMPLATE INJECTION ---

    //console.log(NRS); // for dev only

    NRS.LithStud = {}; // all my mods is in this Object 

    var started = false;
    var stateInterval;
    var stateIntervalSeconds = 30; // default interval to check for changes

    NRS.LithStud.getTradeLogs = function () {
        //$.growl(NRS.account);
        NRS.sendRequest("getTrades+", {
            "account": NRS.account,
            "firstIndex": 0,
            "lastIndex": 9
        }, function (response, input) {
            if (response.trades && response.trades.length) {
                var trades = response.trades;

                var rows = "";

                for (var i = 0; i < trades.length; i++) {
                    trades[i].priceNQT = new BigInteger(trades[i].priceNQT);
                    trades[i].quantityQNT = new BigInteger(trades[i].quantityQNT);
                    trades[i].totalNQT = new BigInteger(NRS.calculateOrderTotalNQT(trades[i].priceNQT, trades[i].quantityQNT));

                    rows += "<tr><td>" + NRS.formatTimestamp(trades[i].timestamp) + "</td><td><a href='#' data-goto-asset='" +
                        String(trades[i].asset).escapeHTML() + "'>" + String(trades[i].name).escapeHTML() + "</a></td><td style='width:5px;padding-right:0;'>" + // asset
                        ((trades[i].buyerRS === NRS.accountRS) ? "<i class='fa fa-plus-circle' style='color:#65C62E'></i>" : "<i class='fa fa-minus-circle' style='color:#E04434'></i>") + "</td><td " +
                        ((trades[i].buyerRS === NRS.accountRS) ? " style='color:#006400;'" : " style='color:red'") + ">" +
                        NRS.formatQuantity(trades[i].quantityQNT, trades[i].decimals) + "</td><td class='asset_price'>" + // quantity 
                        NRS.formatOrderPricePerWholeQNT(trades[i].priceNQT, trades[i].decimals) + "</td><td style='width:5px;padding-right:0;'>" + // price
                        ((trades[i].buyerRS === NRS.accountRS) ? "<i class='fa fa-minus-circle' style='color:#E04434'></i>" : "<i class='fa fa-plus-circle' style='color:#65C62E'></i>") + "</td><td " +
                        ((trades[i].buyerRS === NRS.accountRS) ? " style='color:red'" : " style='color:#006400;'") + ">" +
                        NRS.formatAmount(trades[i].totalNQT) + "</td><td>" + // total 
                        "<a href='#' data-user='" + ((trades[i].buyerRS === NRS.accountRS) ? String(trades[i].sellerRS).escapeHTML() : String(trades[i].buyerRS).escapeHTML()) +
                        "' class='user-info'>" + ((trades[i].buyerRS === NRS.accountRS) ? String(trades[i].sellerRS).escapeHTML() : String(trades[i].buyerRS).escapeHTML()) + "</a></td></tr>"; // buyer/seller
                }
                $("#dashboard_trades_table tbody").empty().append(rows);
                NRS.dataLoadFinished($("#dashboard_trades_table")/*, !refresh*/);
            } else {
                $("#dashboard_trades_table tbody").empty();
                NRS.dataLoadFinished($("#dashboard_trades_table")/*, !refresh*/);
            }
        });
    }

    NRS.LithStud.init = function () {
        if (NRS.account === '') { // probably not loged in 
            started = false;
            if (stateInterval) {
                //console.log('Waiting for login');
                return;
            } // interval is running
            //console.log('Not Loged in');
            // check every 5 seconds for changes in account
            stateInterval = setInterval(function () {
                NRS.LithStud.init();
            }, 1000 * 5);
        } else {
            if (stateInterval) {
                clearInterval(stateInterval);
            }
            //console.log('Starting Mod');
            NRS.LithStud.getTradeLogs();
            NRS.LithStud.setStateInterval(stateIntervalSeconds); // start tracking logs 
        }
    }

    NRS.LithStud.setStateInterval = function (seconds) {
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
            NRS.LithStud.getTradeLogs();
        }, 1000 * seconds);
        started = true;
    }

    NRS.LithStud.init(); // start this mod
    return NRS;
} (NRS || {}, jQuery));
