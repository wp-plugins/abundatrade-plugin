// ==ClosureCompiler==
// @compilation_level SIMPLE_OPTIMIZATIONS
// @output_file_name general.min.js
// ==/ClosureCompiler==

/*
*
* set_up_trade
* General JavaScript File By: Paul Grimes
*      Set Focus to main input
*      Set Accordion Handler for side menu
*      Set ajax handler for submission
*      Set Drop Down Handler for top menu
*      Set Modal class for submit, upload, etc...
*      Set Delete function for table items
*      Set Sum function for calculating totals
*
* set_up_thanks
*      Set up Drop Down handler for Top Menu
*      Set Validation Handler
*
*/

total = 0; // yay for globals
currency_for_total = '$';

/*
* set_up_trade
*
* JavaScript functions for calculator.php
*/
function set_up_trade() {
    window.addEvent('domready', function () {
        SetFocus();
        AccordionHandler();
        // DropDownHandler();
        AjaxHandler();
        Modal();
        add_delete();
        calcSum();
        show_referral_other();

        $('#popup_justspinner').css({ 'width': 100 }).prepend('<a href="#" class="close"><img src="../images/close_pop.png" class="btn_close" title="Close Window" alt="Close" /></a>');
        $('#popup_spinnermessage').css({ 'width': 400 }).prepend('<a href="#" class="close"><img src="../images/close_pop.png" class="btn_close" title="Close Window" alt="Close" /></a>');


        //Remove the "new" class from all response elements.
        //These elements (if any) have all been added to the page
        //and are no longer "new" elements. The "new" class is
        //to denote rows that have just been added.
        $$(".response.new").each(
            function (element) {
                element.removeClass("new");
            }
        );
    });
}

function set_up_view() {
    window.addEvent('domready', function () {
        // DropDownHandler();
        view_modal();
        view_slowness_modal();
        add_delete();
        calcSum();
    });
}

/*
* set_up_thanks
*
* JavaScript functions for thank-you.php
*/
function set_up_thanks() {
    window.addEvent('domready', function () {
        // DropDownHandler();
    });
}

/*
* AjaxHandler
*
* We need to add an event to utilize a
* ajax feed to push/get results of the
* calculator
*
*/
function AjaxHandler() {
    validation = new FormCheck("abundaInput");
    enableSubmitHandling();
}

/*
* Enable the submission handling for the "Add Item" submission
*/
function enableSubmitHandling() {
    /*if (document.id('abundaInput')) {
    document.id('abundaInput').removeEvent(
    'submit',
    killEvent
    );
    document.id('abundaInput').addEvent(
    'submit',
    handleAddedItem
    );
    }*/
}

/*
* Disable the submission handling for the "Add Item" submission
*/
function disableSubmitHandling() {
    /*document.id('abundaInput').removeEvent(
    'submit',
    handleAddedItem
    );
    document.id('abundaInput').addEvent(
    'submit',
    killEvent
    );*/
}

/*
* An event handler that simply stops the event from being further processed
*/
function killEvent(e) {
    e.stop();
}

function handleValid() {
    validation.reinitialize();

    validation.validations.each(function (el) {
        var valid = validation.manageError(el, 'submit');
        if (!valid)
            validation.form.isValid = false;
    }, validation);

    if (validation.form.isValid) {
        return true;
    } else {
        validation.focusOnError(validation.firstError)
        return false;
    }

    return true;
}

/*
* An event handler to add an item to the top of the list
*/
function handleAddedItem(e) {
    // Add spinner
    //$('#popup_justspinner').fadeIn();

    //While we are processing, we don't want to be handling competing
    //submissions (for instance, from the second click of a user's double click)
    //disableSubmitHandling();
    SetFocus();
    //enableSubmitHandling();
    //e.stop(); // Stop posting to "process/request.php

    if (!handleValid()) {
        return false;
    }

    var id = document.id('product_code').get('value');
    var qty = document.id('product_qty').get('value');

    if (valid_input(id, qty)) {
        addDuplicatesToQuantity(id);
        document.id('main_content').addClass('ajax-loading');
        var res = document.id('abundaCalcBody_request').empty();
        var itemTable = document.id("abundaCalcBody_process");
        document.id('product_code').value = '';
        document.id('product_qty').value = '1';

        var loading = '<tr class=new response"><td class="line_number">&nbsp;</td><td class="upc">' + id + '</td><td class="details"><div class="td_details"><strong>Calculating the Abunda Value</strong></div><div class="td_image"><img src="/trade/Style/Images/spinner.gif" alt="Calculating the Abunda value" /></div></td><td class="quantity">' + qty + '</td><td class="item"><div class="item"></div></td><td class="values"></td><td class="delete">Please wait</td><td class="id"></td></tr>';
        itemTable.set("html", loading + itemTable.innerHTML);


        $.ajax({
            url: 'process/request.php?product_code=' + id + '&product_qty=' + qty,
            success: function (data) {
                var json = JSON.parse(data);
                addDuplicatesToQuantity(json.product_code);
                window.total = json.total;
                window.currency_for_total = json.currency_for_total;

                disposeQueued();

                res.removeClass('ajax-loading');

                itemTable.set("html", (json.row_html + itemTable.innerHTML));

                var newElements = $$("tr.response.new");
                newElements.each(function (element) { fadeInNewElement(element) });

                add_delete();

                calcSum();
            }
        });

        return false;

        // Get the results back when completed
        /*this.set(
        'send',
        {   //Set on complete function
        onComplete : function(response) {
        console.log('We have a response');
        var jsonobj = eval('(' + response + ')');

        addDuplicatesToQuantity(jsonobj.product_code);
        window.total = jsonobj.total;
        window.currency_for_total = jsonobj.currency_for_total;

        //Remove any rows that are no longer needed
        //because they are expected to be updated
        //by the response
        disposeQueued();

        res.removeClass('ajax-loading');

        // Add the new response to the top of the existing table
        //var itemTable = document.id("abundaCalcBody_process");
        console.log(jsonobj.row_html);
        itemTable.set("html", (jsonobj.row_html + itemTable.innerHTML));//itemTable.innerHTML;

        // Fade in each new element
        var newElements = $$("tr.response.new");
        newElements.each(function(element){fadeInNewElement(element)});

        add_delete();

        calcSum();
        }
        }
        );
        this.send();
        }
        else{
        validation.reinitialize();
        enableSubmitHandling();
        }*/
        //$('#popup_justspinner').fadeOut();
    }
}

/*
* Fade a new element in graphically, removing the "new" class as well
*/
function fadeInNewElement(element) {
    // It isn't "new" anymore. We don't want it to get faded in
    // the next time an element is added...
    element.removeClass("new");

    var originalBGColor = element.getStyle("background-color");

    new Fx.Morph(element).set({
        'background-color': '#76B8FF'
    });

    new Fx.Morph(
    element,
    {
        duration: 800,
        transition: Fx.Transitions.Sine.easeOut
    }
    ).start({
        'background-color': originalBGColor
    });
}



/*
* add_delete
*
* We need a way to add the delete capabilities to table rows if applicable
*/
function add_delete() {
    $$('a.delete_this_row').each(function (el) {
        el.addEvent('click', function () {
            $upc = document.id(this).getParent().getParent().getElements('td.upc');
            $id = document.id(this).getParent().getParent().getElements('td.id');
            delete_item($upc[0].get('text'), $id[0].get('text'));
            document.id(this).getParent().getParent().dispose();
            calcSum();
            SetFocus();
        });
    });
}

/*
* Accordion Handler
*
* We need to add an event to handle
* the side menu accordion.
*
*/
function AccordionHandler() {
    var myAccordion = new Accordion(document.id('accordion'), $$('h3.toggler'), $$('div.element'), {
        display: 3,
        opacity: true,
        onActive: function (toggler, element) {
            toggler.removeClass('toggler');
            toggler.addClass('toggler_selected');
            SetFocus();
        },
        onBackground: function (toggler, element) {
            toggler.removeClass('toggler_selected');
            toggler.addClass('toggler');
        }
    });
}

/*
* DropDownHandler
*
* We need to set an event to handle the
* main menu drop down effects.
*/
function DropDownHandler() {
    if (document.id('drop_down_menu')) {
        document.id('drop_down_menu').getElements('li.menu').each(function (elem) {
            var list = elem.getElement('ul.links');
            var myFx = new Fx.Slide(list).hide();
            elem.addEvents({
                'mouseenter': function () {
                    myFx.cancel();
                    myFx.slideIn();
                },
                'mouseleave': function () {
                    myFx.cancel();
                    myFx.slideOut();
                    elem.addClass('');
                }
            });
        });

        $$('img.mo').each(function (el) {
            var src = el.getProperty('src');
            var extension = src.substring(src.lastIndexOf('.', src.length));
            el
                    .addEvent('mouseenter', function () {
                        el.setProperty('src', src
					   .replace(extension, '_hover' + extension));
                    });
            el.addEvent('mouseout', function () {
                el.setProperty('src', src);
            });
        });
    }
}

/*
* ValidationHandler
*
* We need to add an event to validate all form inputs.
*/
function ValidationHandler() {
    validation = new FormCheck("abundaInput", {
        submitByAjax: false,
        //onAjaxRequest : AjaxHandler(),
        display: {
            showErrors: 0,
            fixPngForIe: 1,
            scrollToFirst: false,
            checkValueIfEmpty: 0
        }
    });
}

/*
* Modal
*
* We need a way to show and hide the Modal form
* from the calculator page.
*
*/

function Modal() {

    /* Submit List form check anon function */
    if (document.id("submitList")) {
        document.id("submitList").addEvent("click", function () {
            valid_submit = new FormCheck('submit_valuation', {
                display: {
                    fixPngForIe: 1
                }
            });
            if (document.id('abundaCalcBody_process').getFirst()) {
                showModal("submitModal");
            } else {
                valid_submit.errors = 'Please enter a UPC or ISBN to continue.'; // find a way to pop up a message or tooltip.
                valid_submit.manageError(document.id('product_code'), '');
            }
        });
    }

    /* Report Slowness */
    /*document.id("submitSlow").addEvent("click", function() {
    valid_submit = new FormCheck('submit_slowness', {
    display  : {
    fixPngForIe : 1
    }
    });
    showModal("reportslownessModal");
    });*/

    if (document.id("submitCancel")) {
        document.id("submitCancel").addEvent("click", function () {
            hideModal("submitModal");
        });
    }

    if (document.id("slowCancel")) {
        document.id("slowCancel").addEvent("click", function () {
            hideModal("reportslownessModal");
        });
    }


    if (document.id("bulkCopy")) {
        document.id("bulkCopy").addEvent("click", function () {
            valid_submit = new FormCheck('bulkPasteForm', {
                display: {
                    fixPngForIe: 1
                }
            });

            showModal("bulkPasteContainer");
        });
        document.id("bulkCopyCancel").addEvent("click", function () {
            hideModal("bulkPasteContainer");
        });
        document.id("uploadCancel").addEvent("click", function () {
            hideModal("uploadModal");
        });
    }
}

function view_modal() {
    document.id("submitList").addEvent("click", function () {
        valid_submit = new FormCheck('submit_valuation', {
            display: {
                fixPngForIe: 1
            }
        });
        if (document.id('abundaCalcBody_process').getFirst()) {
            showModal("submitModal");
        } else {
            valid_submit.errors = 'Please enter a UPC or ISBN to continue.'; // find a way to pop up a message or tooltip.
            valid_submit.manageError(document.id('product_code'), '');
        }
    });



    document.id("submitCancel").addEvent("click", function () {
        hideModal("submitModal");
    });
}


function view_slow_modal() {
    document.id("submitSlow").addEvent("click", function () {
        valid_submit = new FormCheck('submit_slowness', {
            display: {
                fixPngForIe: 1
            }
        });
        showModal("reportslownessModal");
    });

    document.id("slowCancel").addEvent("click", function () {
        hideModal("reportslownessModal");
    });
}


/*
* showModal
*
* We need a generic function to add the events
* to show a modal box.
*/
function showModal(value) {
    var effect = new Fx.Morph(value, {
        duration: 'long',
        transition: Fx.Transitions.Sine.easeOut
    });

    effect.start({
        'display': 'block'
    });
}

/*
* hideModal
*
* We need a generic function to add the events
* to hide a modal box
*/
function hideModal(value) {
    var effect = new Fx.Morph(value, {
        duration: 'long',
        transition: Fx.Transitions.Sine.easeOut
    });

    effect.start({
        'display': 'none'
    });
}

/*
* Sets focus on product_code
*
* You can change the element to focus on by passing the element id
* --This is a string for that represents the element id
* --Defalut is currently product_code, yes hard coded.
*
*/
function SetFocus(value) {
    value = (value == undefined) ? 'product_code' : value;
    if (document.id(value))
        document.id(value).focus();
}

/*
* This function will find all duplicate UPC codes
* and add their quantities to the current request
* quantity. It will remove them from the table.
* It will also remove them from the database.
*
*/

function addDuplicatesToQuantity(inputUPC) {
    var upcs = $$('td.upc');
    var quantities = $$('td.quantity');
    var duplicateQuantity = 0;

    //Compare the new UPC to each UPC in the existing list
    for (var idx = 0; idx < upcs.length; idx++) {
        //Check for existing UPCs matching the new UPC
        if (inputUPC == document.id(upcs[idx]).get('text')) {
            //Add the found UPC's quantity to the new UPC's
            //quantity
            duplicateQuantity += parseInt(document.id(quantities[idx]).get('text'));
            queueForDisposal(upcs[idx].getParent());
        }
    }
}

//Rows waiting to be disposed
var rowsToDispose = [];

//Queue a row for disposal
function queueForDisposal(element) {
    rowsToDispose.push(element);
}

//Dispose of all queued rows
function disposeQueued() {
    Array.forEach(rowsToDispose, function (element) {
        element.dispose();
    });
    rowsToDispose = [];
}

/*
* calcSum
*
* Calculates the quantities and formats the grand total.
*
*/
function calcSum() {
    var lines = $$('td.line_number');
    var values = $$('td.values');
    var quantity = $$('td.quantity');
    var item = $$('div.item');
    var total_qty = 0;
    var idx;
    for (idx = 0; idx < values.length; idx++) {
        var qty = parseInt(document.id(quantity[idx]).get('text'));
        total_qty += qty;
        if (lines[idx]) {
            document.id(lines[idx].set('text', idx + 1));
        }
    }

    if (!window.total) {
        if (document.id('grand_total')) {
            window.total = document.id('grand_total').innerHTML;
        } else {
            window.total = 0;
        }
        if (document.id('total_prevaluation'))
            document.id('total_prevaluation').set('text', window.total);

    } else {
        var grandTotal = window.total;

        document.id('grand_total').set('text', window.currency_for_total + grandTotal);
        if (document.id('total_prevaluation'))
            document.id('total_prevaluation').set('text', window.currency_for_total + grandTotal);

    }


    if (document.id('total_item_count'))
        document.id('total_item_count').set('text', total_qty);

    if (document.id('item_count'))
        document.id('item_count').set('text', total_qty);

}

/*
* numberFormat
*
* Define number of decimals to format for
* Define the style of the decimal point
* Define the style of the seperator
*syb
* takes a number (980987.838)
* turns the number into ($980,987.84)
*
*/
function numberFormat(decimals, dec_point, thousands_sep, total) {
    decimals = Math.abs(decimals) + 1 ? decimals : 2;
    dec_point = dec_point || '.';
    thousands_sep = thousands_sep || ',';

    var matches = /(-)?(\d+)(\.\d+)?/.exec(total + ''); // returns matches[1] as
    // sign, matches[2] as
    // numbers and
    // matches[2] as
    // decimals
    var remainder = matches[2].length > 3 ? matches[2].length % 3 : 0;
    return window.currency_for_total + (matches[1] ? matches[1] : '') + (remainder ? matches[2]
						     .substr(0, remainder) + thousands_sep : '') + matches[2]
	.substr(remainder).replace(/(\d{3})(?=\d)/g, "$1" + thousands_sep) + (decimals ? dec_point + (+matches[3] || 0)
									      .toFixed(decimals).substr(2) : '');
}

/*
* Delete Item
*
* We need a method to delete items from the database.
*/
function delete_item(code, id) {
    var session = /info_id=(\w+)/.exec(window.location.href);

    var req = new Request({
        method: 'get',
        url: 'process/deleteItem.php',
        async: false,
        onRequest: function () {
        },
        onComplete: function (response) {

            var jsonobj = eval('(' + response + ')');

            window.total = jsonobj.total;
            window.currency_for_total = jsonobj.currency_for_total;

        }
    });

    if (session != null && session.length == 2)
        req.send('product=' + code + '&id=' + id + '&session_id=' + session[1]);
    else
        req.send('product=' + code + '&id=' + id);
}

/*
* Update Item Quantity
*
* We need a way to update the quantity in the database
*/
function update_item_qty(qty, product) {
    var req = new Request({
        method: 'get',
        url: 'process/updateItem.php',
        async: true
    });
    req.send('product=' + product + '&quantity=' + qty);
}

function valid_input(product, qty) {

    var alphanum = new RegExp("^\\w{3,25}$");
    var digit = new RegExp("^[0-9]*$");

    product = product.replace(" ", "");
    product = product.replace("-", "");

    if (alphanum.test(product) == false) {
        return false;
    }

    if (digit.test(qty) == false)
        return false;

    var num = qty;
    if (parseInt(num) == 0 || isNaN(parseInt(num)))
        return false;

    if (num < 0 && num > 25)
        return false;

    return true;
}

/*
* show_referral_other
*
* We need a way to show the other box and field
* when someone selects a referral option that
* has a value of 1.
*
*/
function show_referral_other() {

    if (document.id('txtOther')) {
        document.id('txtOther').setStyle('display', 'none');
        document.id('lblOther').setStyle('display', 'none');

        document.id("ddlReferrals").addEvent('change', function () {
            document.id('hvReferral').set('value', document.id('ddlReferrals').getSelected().get('text'));

            if (document.id('ddlReferrals').value == 1) {
                document.id('txtOther').setStyle('display', 'block');
                document.id('lblOther').setStyle('display', 'inline');
                document.id('modal').setStyle('height', '590px');
            } else {
                document.id('txtOther').setStyle('display', 'none');
                document.id('lblOther').setStyle('display', 'none');
                document.id('modal').setStyle('height', '550px');
            }

        });
    }
}

function get_ie_version() {
    var version = -1;
    if (navigator.appName == 'Microsoft Internet Explorer') {
        var agent = navigator.userAgent;
        var regex = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
        if (regex.exec(agent) != null)
            version = parseFloat(RegExp.$1);
    }

    return version;

}

function valid_browser() {
    var valid = true;
    var version = get_ie_version();
    if (version >= 8.0)
        valid = true;
    else
        valid = false;

    return valid;
}

function clean_product_code(element) {
    element.value = element.value.replace(/\W+/g, "");
}

function validate_email(form_id, email) {
    var reg = /^([A-Za-z0-9_\-\.\+])+\@([A-Za-z0-9_\-\.])/;
    var address = document.forms[form_id].elements[email].value;
    if (reg.test(address) == false) {
        alert('Valid Email Address Required. ');
        return false
    }
}
function validate_email_name(form_id, name) {

    var user = document.forms[form_id].elements[name].value.length;
    if (user < 2) {
        alert('Name must be more than 2 Characters');
        return false;
    } else {
        return true;
    }
}
function countLines(area) {
    var theLines = area.value.replace((new RegExp(".{" + area.cols + "}", "g")), "\n").split("\n");
    if (theLines[theLines.length - 1] == "") theLines.length--;
    return theLines.length;
}

function checkBulk(form) {
    if (countLines(form.bulkinput) > 250) {
        var email_test = validate_email_name('bulkPasteForm', 'bulk_name');
        var name_test = validate_email('bulkPasteForm', 'bulk_email');
        if (email_test != false && name_test != false) {
            return true;
        } else {
            return false;
        }
    } else {

        /* Add bulk spinner */
        document.id('bulkPasteModal').hide();
        $('#popup_spinnermessage').fadeIn();

        return true;
    }
}

function submit_validate(form_id, email) {

    validate_email(form_id, email);

    if (document.forms[form_id].elements['ddlReferrals'].value == -1) {
        alert('Please let us know how you heard about us.');
        return false;
    }
}
