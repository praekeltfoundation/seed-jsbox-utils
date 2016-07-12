/*jshint -W083 */
var assert = require('assert');
var moment = require('moment');
var vumigo = require('vumigo_v02');
var Choice = vumigo.states.Choice;
var _ = require('lodash');

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

double_digit_number = function(input) {
    input_numeric = parseInt(input, 10);
    if (parseInt(input, 10) < 10) {
        return "0" + input_numeric.toString();
    } else {
        return input_numeric.toString();
    }
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

normalize_msisdn = function(raw, country_code) {
    // don't touch shortcodes
    if (raw.length <= 5) {
        return raw;
    }
    // remove chars that are not numbers or +
    raw = raw.replace(/[^0-9+]/g);
    if (raw.substr(0,2) === '00') {
        return '+' + raw.substr(2);
    }
    if (raw.substr(0,1) === '0') {
        return '+' + country_code + raw.substr(1);
    }
    if (raw.substr(0,1) === '+') {
        return raw;
    }
    if (raw.substr(0, country_code.length) === country_code) {
        return '+' + raw;
    }
    return raw;
};

// DATE HELPERS

get_timestamp = function(format) {
    if (format) {
        return moment().format(format);
    } else {
        return moment().format("YYYYMMDDHHmmss");
    }
};

// returns today's date if a date not passed in (e.g. format: 'YYYY-MM-DD')
get_today = function(date, format) {
    if (date) {
        return new moment(date, format); // maybe try-catch invalid formats..? or will moment do it..?
    } else {
        return new moment();
    }
};

// returns current/other year's january 1st moment date
// if date passed in, should be of format 'YYYY-MM-DD'
get_january = function(date, format) {
    return this.get_today(date, format).startOf('year');
};

is_valid_date = function(date, format) {
    // implements strict validation with 'true' below
    return moment(date, format, true).isValid();
};

is_valid_year = function(year, minYear, maxYear) {
    // expects string parameters
    // checks that the number is within the range determined by the
    // minYear & maxYear parameters
    return this.check_valid_number(year)
        && parseInt(year, 10) >= parseInt(minYear, 10)
        && parseInt(year, 10) <= parseInt(maxYear, 10);
};

is_valid_day_of_month = function(input) {
    // check that it is a number and between 1 and 31
    return this.check_valid_number(input)
        && parseInt(input, 10) >= 1
        && parseInt(input, 10) <= 31;
};

// TEXT HELPERS

check_valid_alpha = function(input) {
    // check that all chars are in standard alphabet
    var alpha_only = new RegExp('^[A-Za-z]+$');
    return input !== '' && alpha_only.test(input);
};

is_alpha_numeric_only = function(input) {
    alpha_numeric = new RegExp('^[A-Za-z0-9]+$');
    return alpha_numeric.test(input);
};

is_valid_name = function(input, min, max) {
    // check that the string does not include the characters listed in the
    // regex, and min <= input string length <= max
    var name_check = new RegExp(
        '(^[^±!@£$%^&*_+§¡€#¢§¶•ªº«\\/<>?:;|=.,0123456789]{min,max}$)'
        .replace('min', min.toString())
        .replace('max', max.toString())
    );
    return input !== '' && name_check.test(input);
};

get_clean_first_word = function(user_message) {
    return user_message
        .split(" ")[0]          // split off first word
        .replace(/\W/g, '')     // remove non letters
        .toUpperCase();         // capitalise
};

// BOOLEAN HELPERS

is_true = function(bool) {
    //If is is not undefined and boolean is true
    return (!_.isUndefined(bool) && (bool==='true' || bool===true));
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
    double_digit_number: double_digit_number,
    is_valid_msisdn: is_valid_msisdn,
    normalize_msisdn: normalize_msisdn,
    get_january: get_january,
    get_timestamp: get_timestamp,
    get_today: get_today,
    is_valid_date: is_valid_date,
    is_valid_year: is_valid_year,
    is_valid_day_of_month: is_valid_day_of_month,
    check_valid_alpha: check_valid_alpha,
    is_alpha_numeric_only: is_alpha_numeric_only,
    is_valid_name: is_valid_name,
    get_clean_first_word: get_clean_first_word,
    is_true: is_true,
    make_month_choices: make_month_choices
};
