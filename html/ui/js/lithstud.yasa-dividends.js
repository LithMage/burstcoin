/**
 * Asset Exchange Logs v1.0
 * Made by Rimvydas (LithStud) lithstud@gmail.com
 * License: MIT 
 */
var ALPHA_DIV = (function ($, undefined) {

    var totalShares = 46838;
    var totalBonus = 8614;
    var BURST = 6593.839;
    secretPhrase = "";
    var bonuses = [
        {
            'acc': 'BURST-BRUQ-MY7L-UTL3-FH3AX',
            'bonus': 14
        },
        {
            'acc': 'BURST-44FY-YB7W-BDCJ-32ECU',
            'bonus': 5000
        },
        {
            'acc': 'BURST-S94A-Z3T5-TDZT-AK6NB',
            'bonus': 630
        },
        {
            'acc': 'BURST-X7JB-G8M6-YKKC-CEG2M',
            'bonus': 200
        },
        {
            'acc': 'BURST-GAJL-VWKN-2XPB-H39R9',
            'bonus': 1050
        },
        {
            'acc': 'BURST-ESRB-Y6LK-43ND-CX2TZ',
            'bonus': 1000
        },
        {
            'acc': 'BURST-HPRW-9UJL-UC7E-H7ANS',
            'bonus': 500
        },
        {
            'acc': 'BURST-E9PL-YHJ8-B288-FP92H',
            'bonus': 100
        },
        {
            'acc': 'BURST-VPER-97FN-LWLD-5LVSL',
            'bonus': 80
        },
        {
            'acc': 'BURST-2XLE-PNGZ-SZY3-6BSLC',
            'bonus': 20
        },
        {
            'acc': 'BURST-9JWJ-8CHK-652U-9J2FL',
            'bonus': 10
        },
        {
            'acc': 'BURST-KAX7-CGMU-2X7B-CMFBH',
            'bonus': 10
        }
    ];

    $('#load_holders').on('click', function () {
        BURST = $('#net_burst').val() || 0;
        jsonRequest = {
            requestType: "getAssetAccounts",
            asset: '12143106865567593139'
            //recipient: atId,
            //amountNQT: totalAmount,
            //feeNQT: fee,
            //secretPhrase: pass,
            //deadline: 100
        }
        $.ajax({
            url: 'http://' + window.location.hostname.toLowerCase() + ':' + window.location.port + '/burst',
            type: 'POST',
            dataType: "json",
            data: jsonRequest,
            success: function (response, textStatus, jqXHR) {
                handle_response(response)
            }
        });
    });

    function handle_response(response) {
        if (response.errorCode) {
            console.log('Well Fuck This.');
            return null;
        }

        // calculate per share and all others neccesary things
        var forShares = (BURST * 0.7).toFixed(8);
        var forBonus = (BURST * 0.03).toFixed(8);
        var reinvest = (BURST * 0.2).toFixed(8);
        var forSafety = (BURST * 0.07).toFixed(8);

        var perShare = Math.floor(forShares / totalShares * 100000000) / 100000000;
        var perBonusShare = Math.floor(forBonus / totalBonus * 100000000) / 100000000;

        $('#burst_spread').empty().append('Total BURST: ' + BURST + '<br/>' +
            'For Shares: ' + forShares + '<br/>' +
            'For Bonus Shares: ' + forBonus + '<br/>' +
            'For Reinvesting: ' + reinvest + '<br/>' +
            'For Safety Net: ' + forSafety + '<br/>' +
            '=================================<br/>' +
            'Per Share: ' + perShare + '<br/>' +
            'Per Bonus Share: ' + perBonusShare + '<br/>'
        );

        var bonusShares = 0;
        var rows = '';
        var divs = 0;
        response.accountAssets.forEach(function (acc) {
            if (acc.accountRS != 'BURST-73VC-7KDZ-PJWY-D4PGV') {
                bonusShares = getBonus(acc.accountRS);
                divs = ((acc.quantityQNT * perShare) + (bonusShares * perBonusShare)).toFixed(8);
                rows += '<tr><td>' + acc.accountRS + '</td>' +
                    '<td>' + acc.quantityQNT + '</td>' +
                    '<td>' + bonusShares + '</td>' +
                    '<td>' + divs + '</td>' +
                    '<td><button data-acc-id="' + acc.accountRS + '" data-dividends="' + divs + '" type="button" class="btn btn-default">Send!</button></td>' +
                    '</tr>';
                /*console.log(acc.accountRS + ': ' + (acc.quantityQNT) + ' shares of them ' +
                    bonusShares + ' bonus shares');*/

            }
        }, this);

        $('#holders_table tbody').empty().append(rows);
    }

    $("body").on("click", "button[data-acc-id]", function (e) {
        e.preventDefault();
        //$(this).parent().empty().append('3546fdg0f4d6sd435f4s3g54h');
        sendMoney($(this));
    });

    function getBonus(acc) {
        for (var i = 0; i < bonuses.length; i++) {
            if (bonuses[i].acc == acc) return bonuses[i].bonus;
        }
        return 0;
    }

    function sendMoney(caller) {                
        var recipient =  caller.data('acc-id');
        var dividends =  convertToNQT(caller.data('dividends'));
        console.log(recipient + ' > ' + dividends);
        jsonRequest = {
            requestType: "sendMoney",
            recipient: recipient,
            amountNQT: dividends,
            feeNQT: 100000000,
            secretPhrase: secretPhrase,
            message: 'Dividends for Month 1. Have a nice day!',
            deadline: 24
        }
        $.ajax({
            url: 'http://' + window.location.hostname.toLowerCase() + ':' + window.location.port + '/burst',
            type: 'POST',
            dataType: "json",
            data: jsonRequest,
            success: function (response, textStatus, jqXHR) {
                if (response.errorCode) {
                    console.log('Well Fuck This.');
                    return null;
                }
                
                caller.parent().empty().append(response.transaction);
                var msg = (dividends / 100000000).toFixed(8) + ' | ' + recipient  + ' | ' + response.transaction;
                $('#easy_copy').append(msg + '<br/>');
                //console.log(caller.data('acc-id') + ' > ' + msg);
            }
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


} (jQuery));