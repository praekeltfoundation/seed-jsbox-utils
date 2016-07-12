/*jshint -W083 */
var assert = require('assert');
var moment = require('moment');
var vumigo = require('vumigo_v02');
var Choice = vumigo.states.Choice;


// JS-BOX SPECIFIC UTILS


// FIXTURES HELPERS

check_fixtures_used = function(api, expected_used) {
    var fixts = api.http.fixtures.fixtures;
    var fixts_used = [];
    fixts.forEach(function(f, i) {
        f.uses > 0 ? fixts_used.push(i) : null;
    });
    assert.deepEqual(fixts_used, expected_used);
};

// TIMEOUT HELPERS

timed_out = function(im) {
    return im.msg.session_event === 'new'
        && im.user.state.name
        && im.config.no_timeout_redirects.indexOf(im.user.state.name) === -1;
};

timeout_redirect = function(im) {
    return im.config.timeout_redirects.indexOf(im.user.state.name) !== -1;
};

// NUMBER HELPERS

// An attempt to solve the insanity of JavaScript numbers
check_valid_number = function(content) {
    var numbers_only = new RegExp('^\\d+$');
    return content !== ''
        && numbers_only.test(content)
        && !Number.isNaN(Number(content));
};

// MSISDN HELPERS

// Check that it's a number and starts with 0 and approximate length
// TODO: refactor to take length, explicitly deal with '+'
is_valid_msisdn = function(content) {
    return check_valid_number(content)
        && content[0] === '0'
        && content.length >= 10
        && content.length <= 13;
};

// DATE HELPERS

get_today = function(config) {
    if (config.testing_today) {
        return new moment(config.testing_today, 'YYYY-MM-DD');
    } else {
        return new moment();
    }
};

get_january = function(config) {
    // returns current year january 1st moment date
    return get_today(config).startOf('year');
};

// CHOICE HELPERS

make_month_choices = function($, startDate, limit, increment, valueFormat, labelFormat) {
// Currently supports month translation in formats MMMM and MM
    var choices = [];
    var monthIterator = startDate;
    for (var i=0; i<limit; i++) {
        var raw_label = monthIterator.format(labelFormat);
        var prefix, suffix, month, translation;

        var quad_month_index = labelFormat.indexOf("MMMM");
        var trip_month_index = labelFormat.indexOf("MMM");

        if (quad_month_index > -1) {
            month = monthIterator.format("MMMM");
            prefix = raw_label.substring(0, quad_month_index);
            suffix = raw_label.substring(quad_month_index+month.length, raw_label.length);
            translation = {
                January: $("{{pre}}January{{post}}"),
                February: $("{{pre}}February{{post}}"),
                March: $("{{pre}}March{{post}}"),
                April: $("{{pre}}April{{post}}"),
                May: $("{{pre}}May{{post}}"),
                June: $("{{pre}}June{{post}}"),
                July: $("{{pre}}July{{post}}"),
                August: $("{{pre}}August{{post}}"),
                September: $("{{pre}}September{{post}}"),
                October: $("{{pre}}October{{post}}"),
                November: $("{{pre}}November{{post}}"),
                December: $("{{pre}}December{{post}}"),
        };
        translated_label = translation[month].context({
            pre: prefix,
            post: suffix
        });
        } else if (trip_month_index > -1) {
            month = monthIterator.format("MMM");
            prefix = raw_label.substring(0, trip_month_index);
            suffix = raw_label.substring(trip_month_index+month.length, raw_label.length);
            translation = {
                Jan: $("{{pre}}Jan{{post}}"),
                Feb: $("{{pre}}Feb{{post}}"),
                Mar: $("{{pre}}Mar{{post}}"),
                Apr: $("{{pre}}Apr{{post}}"),
                May: $("{{pre}}May{{post}}"),
                Jun: $("{{pre}}Jun{{post}}"),
                Jul: $("{{pre}}Jul{{post}}"),
                Aug: $("{{pre}}Aug{{post}}"),
                Sep: $("{{pre}}Sep{{post}}"),
                Oct: $("{{pre}}Oct{{post}}"),
                Nov: $("{{pre}}Nov{{post}}"),
                Dec: $("{{pre}}Dec{{post}}"),
            };
            translated_label = translation[month].context({
                pre: prefix,
                post: suffix
            });
        } else {
                // assume numbers don't need translation
                translated_label = raw_label;
        }

        choices.push(new Choice(monthIterator.format(valueFormat),
            translated_label));
        monthIterator.add(increment, 'months');
    }

    return choices;
};

module.exports = {
    check_fixtures_used: check_fixtures_used,
    timed_out: timed_out,
    timeout_redirect: timeout_redirect,
    check_valid_number: check_valid_number,
    is_valid_msisdn: is_valid_msisdn,
    get_today: get_today,
    get_january: get_january,
    make_month_choices: make_month_choices
};
