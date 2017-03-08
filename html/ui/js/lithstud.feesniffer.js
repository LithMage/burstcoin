/**
 * FeeSniffer v1.0
 * Made by Rimvydas (LithStud) lithstud@gmail.com
 * GitHub: https://github.com/LithMage
 * 2017.03.01
 * License: MIT
 */
/**
 * @depends {nrs.js}
 */
var NRS = (function (NRS, $, undefined) {

    NRS.LithStud = NRS.LithStud || {}; // all my mods is in this Object
    NRS.LithStud.FS = {}; // Fee Sniffer scope
    NRS.LithStud.FS.maxPayload = 44880 - 1000; // should get from getConstants api call
    NRS.LithStud.FS.maxTx = 255 - 10;
    NRS.LithStud.FS.currentBlock = 0;
    NRS.LithStud.FS.suggestedFee = 1; // Default
    NRS.LithStud.FS.disable = true;
    NRS.LithStud.FS.ignoreEmptyBlock = true;
    NRS.LithStud.FS.takeOver = true;

    // --- CSS Ruleset for loading indicator ---
    // prevent duplicates
    var cssId = 'lithstud_feesniffer_css';
    if (!document.getElementById(cssId)) {
        var head = document.getElementsByTagName('head')[0];
        var link = document.createElement('link');
        link.id = cssId;
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = 'css/lithstud-feesniffer.css';
        link.media = 'all';
        head.appendChild(link);
    }
    // --- END OF CSS RULESET ---

    // --- TEMPLATE INJECTION ---
    // Template for dashboard (index.html)
    var template = '<div class="sniffer-box">' +
        '<div class="sniffer-info">' +
        '<div>Suggested Fee:</div>' +
        '<div class="fee"><span id="feesniffer_fee">2</span><span class="fee-burst"> BURST</span></div>' +
        '<div class="settings">' +
        '<p>Tx Load:</p>' +
        '<div class="progress">' +
        '<div id="sniff-tx-bar" class="progress-bar" role="progressbar" style="width: 0%">' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="settings">' +
        '<p>Payload:</p>' +
        '<div class="progress">' +
        '<div id="sniff-payload-bar" class="progress-bar" role="progressbar" style="width: 0%">' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div>' +
        '<label class="checkbox-inline"><input id="feesniffer_disable" type="checkbox" value="">Disable Smart Fee</label>' +
        '<div class="sniff-btn">' +
        '<i class="fa fa-cog" aria-hidden="true"></i>Settings' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="sniff-content">' +
        '<div>Last Sniffed Block: <span id="feesniffer_block">#333666</span></div>' +
        '<div>Block Tx Load: <span id="feesniffer_tx_count">0</span> / 255</div>' +
        '<div>Block Payload: <span id="feesniffer_payload">0 KB</span> / 44 KB</div>' +
        '<div><label class="checkbox-inline"><input id="feesniffer-takeover" type="checkbox" value="">Autochange Fees</label></div>' +
        '<div><label class="checkbox-inline"><input id="feesniffer-ignore-empty" type="checkbox" value="">Ignore Empty Blocks</label></div>' +
        '</div>' +
        '</div>';

    // prevent duplicates
    if ($('.sniffer-box').length === 0) {
        $('#dashboard_blocks_footer').parent().prepend(template);
    }
    // --- END OF TEMPLATE INJECTION ---

    NRS.LithStud.FS.init = function () {
        var snifferDisabled = JSON.parse(localStorage.getItem("snifferDisabled"));
        var takeoverEnabled = JSON.parse(localStorage.getItem("takeoverEnabled"));        
        var ignoreEmptyBlock = JSON.parse(localStorage.getItem("ignoreEmptyBlock"));

        // Read / Set settings
        if (snifferDisabled != null) { NRS.LithStud.FS.disable = snifferDisabled; }
        if (takeoverEnabled != null) { NRS.LithStud.FS.takeOver = takeoverEnabled; }
        if (ignoreEmptyBlock != null) { NRS.LithStud.FS.ignoreEmptyBlock = ignoreEmptyBlock; }

        // Apply settings
        $("#feesniffer_disable").prop("checked", NRS.LithStud.FS.disable).trigger('change');
        $("#feesniffer-takeover").prop("checked", NRS.LithStud.FS.takeOver).trigger('change');
        $("#feesniffer-ignore-empty").prop("checked", NRS.LithStud.FS.ignoreEmptyBlock).trigger('change');
    }

    // Settings button styling
    $('.sniff-btn').on('click', function () {
        $('.sniff-content').toggleClass('sniff-open');
        $('.sniff-btn i').toggleClass('sniff-rotate');
    });

    // Disable feeSniffer
    $("#feesniffer_disable").on("change", function () {
        NRS.LithStud.FS.disable = $("#feesniffer_disable").is(":checked");
        // save settings
        localStorage.setItem("snifferDisabled", JSON.stringify(NRS.LithStud.FS.disable));
        if (NRS.LithStud.FS.disable) { // sniffer disabled
            $('#feesniffer_fee').html('<span class="glyphicon glyphicon-eye-close" aria-hidden="true"></span>');
            $("#feesniffer-takeover").prop('disabled', true);
            $("#feesniffer-ignore-empty").prop('disabled', true);
            NRS.LithStud.FS.suggestedFee = 1; // set back to default
            takeOver(1); // reset all fees
        } else { // start sniffer
            $("#feesniffer-takeover").prop('disabled', false);
            $("#feesniffer-ignore-empty").prop('disabled', false);
            if (NRS.lastBlockHeight == NRS.LithStud.FS.currentBlock) {
                $('#feesniffer_fee').html(NRS.LithStud.FS.suggestedFee);
            }
            NRS.LithStud.FS.sniff();
        }
    });

    // Enable fee autochanger
    $("#feesniffer-takeover").on("change", function () {
        NRS.LithStud.FS.takeOver = $("#feesniffer-takeover").is(":checked");
        // save settings
        localStorage.setItem("takeoverEnabled", JSON.stringify(NRS.LithStud.FS.takeOver));
        if (NRS.LithStud.FS.takeOver) { // takeOver enabled
            takeOver(NRS.LithStud.FS.suggestedFee);
        } else {
            takeOver(1); // reset to default fee and the rest leave to NRS
        }
    });

    $("#feesniffer-ignore-empty").on("change", function () {
        NRS.LithStud.FS.ignoreEmptyBlock = $("#feesniffer-ignore-empty").is(":checked");
        // save settings
        localStorage.setItem("ignoreEmptyBlock", JSON.stringify(NRS.LithStud.FS.ignoreEmptyBlock));
    });

    // Taken out of nrs.recipient.js:47 
    // unregister original handler and register our own modified
    $("#send_money_amount").off("input");
    $("#send_money_amount").on("input", function (e) {
        //e.stopPropagation();
        if (NRS.LithStud.FS.disable || !NRS.LithStud.FS.takeOver) {
            var amount = parseInt($(this).val(), 10);
            var fee = isNaN(amount) ? 1 : (amount < 10000 ? 1 : Math.round(amount / 10000));

            $("#send_money_fee").val(fee);
            $(this).closest(".modal").find(".advanced_fee")
                .html(NRS.formatAmount(NRS.convertToNQT(fee)) + " BURST");
        } else {
            $(this).closest(".modal").find(".advanced_fee")
                .html(NRS.formatAmount(NRS.convertToNQT(NRS.LithStud.FS.suggestedFee)) + " BURST");
        }
    });

    // Responsible for overwriting original fee in all modals and AE buy/sell orders
    function takeOver(fee) {
        // Buy/Sell Orders needs custom targeting
        $('#buy_asset_fee, #sell_asset_fee').val(fee);
        // All modals has this, need to exclude some with non standart fees
        $('input[name=feeNXT]')
            .not('#issue_asset_fee, #nsv_div_send_fee, #send_div_ad_fee')
            .val(fee);
        $('input[name=feeNXT]').data('default', fee);
        // trigger NRS event handler for these elements to update html
        $("input[name=feeNXT]").trigger('change');
    }

    // Algorith to determine priority fee
    function determineFee(block) {
        var txTotal = block.transactions.length;
        // If ignoring empty blocks keep on using last fee
        if (NRS.LithStud.FS.ignoreEmptyBlock && txTotal === 0) {
            return NRS.LithStud.FS.suggestedFee;
        }
        // check if block is near full (leaving 10 tx as reserve) or its payload is at max
        if (txTotal < NRS.LithStud.FS.maxTx && block.payloadLength < NRS.LithStud.FS.maxPayload) {
            return 1; // seems there is no heavy load on network and free space for more tx
        }
        // time to determine what fee to suggest (using Boyer-Moore Vote Algorithm)
        // with additional determined minimum fee per block
        var count = 0;
        var txFee = 0;
        var minBlockFee = NRS.convertToNXT(block.transactions[0].feeNQT);
        var blockTxFee = 0; // placeholder for parsed fee so we dont need multiple convertToNXT();
        // Step 1: Find majority element
        for (var i = 0; i < txTotal; i++) {
            blockTxFee = NRS.convertToNXT(block.transactions[i].feeNQT);
            if (count == 0) {
                txFee = blockTxFee;
                count = 1;
            } else {
                if (txFee == blockTxFee) { count++; }
                else { count--; }
            }
            // look for minimum fee in a block
            if (blockTxFee < minBlockFee) {
                minBlockFee = blockTxFee;
            }
        }

        // couldnt determine majority fee, at this point block is full so better return smallest fee found
        if (count === 0) { return minBlockFee; }

        // Step 2: Check if fee is really majority element
        count = 0;
        for (var i = 0; i < txTotal; i++) {
            if (txFee == NRS.convertToNXT(block.transactions[i].feeNQT)) { count++; }
        }

        // if there is majority fee amount increase by 1 burst to get priority, otherwise advice minBlockFee
        return (count > txTotal / 2) ? parseFloat(txFee) + 1 : minBlockFee;
    }

    // Retrieves last blocks transactions information for determineFee()
    // in case of error should set lastBlockHeight to lastBlockHeight - 1 so it gets requested again
    function sniffLastBlock(height) {
        $('#feesniffer_fee').html('<div class="spinner spinner-1"></div>');
        NRS.sendRequest("getBlock", {
            "height": height,
            "includeTransactions": "true"
        }, function (response) {
            if (response === undefined) {
                console.log('FeeSniffer! Something went wrong during API call! No worries it will recover');
                NRS.LithStud.FS.currentBlock--; // forces to call sniffer again
                return;
            }
            if (response.errorCode) {
                console.log('FeeSniffer! Error calling block #' + height + ' information');
                NRS.LithStud.FS.currentBlock--; // forces to call sniffer again
                return;
            }
            if (NRS.LithStud.FS.currentBlock > response.height) {
                console.log('FeeSniffer! Block information came too late, there is new one requested');
                return;
            }
            NRS.LithStud.FS.suggestedFee = determineFee(response);

            setBarColor('#sniff-tx-bar', 200, 245, 255, response.numberOfTransactions);
            setBarColor('#sniff-payload-bar', 40880, 43880, 44880, response.payloadLength);

            $('#feesniffer_block').text('#' + response.height);
            $('#feesniffer_tx_count').text(response.numberOfTransactions);
            $('#feesniffer_fee').html(NRS.LithStud.FS.suggestedFee);
            $('#feesniffer_payload').text(NRS.formatVolume(response.payloadLength));
            if (NRS.LithStud.FS.takeOver) {
                takeOver(NRS.LithStud.FS.suggestedFee);
            }
        });
    }

    // controls progressbars for network load information
    function setBarColor(target, green, yellow, max, value) {
        // clean style first
        $(target).removeClass('progress-bar-success progress-bar-warning progress-bar-danger');
        var percent = Math.floor((value * 100) / max);
        var color = (value < green) ? 'progress-bar-success' :
            (value < yellow) ? 'progress-bar-warning' : 'progress-bar-danger';
        $(target).toggleClass(color).css({ 'width': percent + '%' });
    }

    // Timer checking every 1 second for changes in block height
    NRS.LithStud.FS.sniff = function () {
        if (NRS.LithStud.FS.disable) {
            return;
        }
        // only call sniffer if blocks changed and client isnt downloading chain
        if (NRS.LithStud.FS.currentBlock < NRS.lastBlockHeight && !NRS.downloadingBlockchain) {
            sniffLastBlock(NRS.lastBlockHeight);
            NRS.LithStud.FS.currentBlock = NRS.lastBlockHeight;
        }
        // self invoke
        setTimeout(NRS.LithStud.FS.sniff, 1000);
    }

    NRS.LithStud.FS.init(); // load preferences and defaults

    NRS.LithStud.FS.sniff(); // lauch sniffer

    return NRS;
}(NRS || {}, jQuery));
