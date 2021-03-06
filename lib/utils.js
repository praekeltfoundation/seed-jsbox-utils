/*jshint -W083 */
var assert = require('assert');
var libphonenumber = require('libphonenumber-js/max');
var moment = require('moment');
var vumigo = require('vumigo_v02');
var Choice = vumigo.states.Choice;
var _ = require('lodash');
var url_utils = require('url');

// JS-BOX SPECIFIC UTILS


// FIXTURES HELPERS

/**: check_fixtures_used(api, expected_used)
Checks expected fixtures used during testing against actual

:param object api: Vumigo sandbox API object
:param Array expected_used: an array of numbers representing the expected fixtures used
*/
check_fixtures_used = function(api, expected_used) {
    var fixts = api.http.fixtures.fixtures;
    var fixts_used = [];
    fixts.forEach(function(f, i) {
        f.uses > 0 ? fixts_used.push(i) : null;
    });
    assert.deepEqual(fixts_used, expected_used);
};

// TIMEOUT HELPERS

/**: timed_out(im)
Used to determine whether a time-out has occurred and redirection need to happen.
The current state should not be listed in the no_timeout_redirects property within
the config environment.

:param object im: Vumigo Interaction Machine object
*/
timed_out = function(im) {
    return im.msg.session_event === 'new'
        && im.user.state.name
        && im.config.no_timeout_redirects.indexOf(im.user.state.name) === -1;
};

/**: timeout_redirect(im)
Tests whether a state is listed in the timeout_redirects property within the
config environment.

:param object im: Vumigo Interaction Machine object
*/
timeout_redirect = function(im) {
    return im.config.timeout_redirects.indexOf(im.user.state.name) !== -1;
};

// REQUEST HELPERS

/**: get_paginated_response(service, url, params)
Gets all pages of a paginated request.

:param object service: The api for the service being queried.
:param string url: The url to send the request to.
:param object params: The query parameters for the request
*/
get_paginated_response = function(service, endpoint, params) {
    url = service.base_url + endpoint;
    // Get the current page and log the call
    return service.http_api.get(url, {params: params})
        .then(service.log_service_call('GET', url, null, params))
        .then(function(response) {
            var results = response.data.results;
            if (response.data.next === null) {
                return {results: results, count: results.length};
            }
            var next_url = url_utils.parse(response.data.next, true);
            // Recursively get next pages
            return get_paginated_response(service, endpoint, next_url.query).
                then(function(page) {
                    // Tack subsequent pages onto current page
                    var combined_results = results.concat(page.results);
                    return {results: combined_results,
                            count:combined_results.length};
                });
        });
};


// NUMBER HELPERS

/**: check_valid_number(number)
Checks the validity of a number (An attempt to solve the insanity of JavaScript numbers)

:param string number: number to check
*/
check_valid_number = function(number) {
    var numbers_only = new RegExp('^\\d+$');
    return number !== ''
        && numbers_only.test(number)
        && !Number.isNaN(Number(number));
};

/**: double_digit_number(input)
If a number is single-digit, convert to double, else return as is.

:param string input: number
*/
double_digit_number = function(input) {
    input_numeric = parseInt(input, 10);
    if (parseInt(input, 10) < 10) {
        return "0" + input_numeric.toString();
    } else {
        return input_numeric.toString();
    }
};

/**: check_number_in_range(input, start, end)
Checks whether a number is within a certain range.

:param string input: number to check
:param string start: lower bound of range
:param string end: upper bound of range
*/
check_number_in_range = function(input, start, end) {
    return this.check_valid_number(input) &&
        (parseInt(input, 10) >= start) &&
        (parseInt(input, 10) <= end);
};

/**: readable_msisdn(msisdn, country_code)
Returns msisdn as 'readable' (leading country code effectively replaced with '0')

:param string msisdn: 'normalized' msisdn to process
:param string country_code: specific country_code within given msisdn to replace
*/
readable_msisdn = function(msisdn, country_code) {
    if (country_code[0] !== '+') {
        country_code = '+' + country_code;
    }

    switch (['+','0'].indexOf(msisdn[0])) {
        case 0:  // msisdn starts with '+'
            readable_no = msisdn.replace(country_code, '0');
            break;
        case 1:  // msisdn starts with '0'
            return msisdn;  // assuming msisdn already readable
        default:  // msisdn starts with some other digit
            msisdn = '+' + msisdn;
            readable_no = msisdn.replace(country_code, '0');
    }

    return readable_no;
},

// MSISDN HELPERS

/**: is_valid_msisdn(number, country_code)
Check that number is a phone number

:param string number: number to check
:param string country_code: the country code, eg. ZA
*/
is_valid_msisdn = function (number, country_code) {
    var phoneNumber = libphonenumber.parsePhoneNumberFromString(number, country_code);
    return !!phoneNumber && phoneNumber.isValid();
};

/**: normalize_msisdn(raw, country_code)
Normalizes phone number based on specific country code.
Shortcodes are an exception and get preserved.

:param string raw: phone number
:param string country_code: country code for the number, eg. ZA
*/
normalize_msisdn = function(raw, country_code) {
    // don't touch shortcodes
    if (raw.length <= 5) {
        return raw;
    }
    // Add + if the number starts with the country code
    var country_number = libphonenumber.getCountryCallingCode(country_code);
    if(raw.substr(0, country_number.length) === country_number){
        raw = "+" + raw;
    }
    // Return formatted number
    return libphonenumber.parsePhoneNumberFromString(raw, country_code).number;
};

// DATE HELPERS

/**: get_timestamp(format)
Returns current timestamp.

:param string format: Optional. If specified, will return timestamp in preferred format.
*/
get_timestamp = function(format) {
    if (format) {
        return moment().format(format);
    } else {
        return moment().format("YYYYMMDDHHmmss");
    }
};

/**: get_moment_date(date, format)
Turns a passed in string date and that date's format into a moment object
If no date and format is passed in, it will return the current date as a moment object

:param string date: Optional.
:param string format: Optional. Specifies the format of the date passed in
    e.g. 'YYYY-MM-DD hh:mm:ss', "YYMMDD", etc.  Defaults to 'YYYY-MM-DD'
*/
get_moment_date = function(date, format) {
    if (date) {
        return new moment(date, format || 'YYYY-MM-DD');
    } else {
        return new moment();
    }
};

/**: get_january(date)
Returns the current year's january 1st moment date

:param string date: date
*/
get_january = function(date) {
    // returns current year january 1st moment date
    return this.get_moment_date(date).startOf('year');
};

/**: is_valid_date(date, format)
Checks date validity.

:param string date: date to check
:param string format: the format of the date (e.g. 'YYYY-MM-DD')
*/
is_valid_date = function(date, format) {
    // implements strict validation with 'true' below
    return moment(date, format, true).isValid();
};

/**: is_valid_edd(date, maximum_weeks)
Checks EDD validity.

:param string date: date to check
:param string format: the format of the date (e.g. 'YYYY-MM-DD')
:param object config: configuration object
:param string maximum_weeks: how far back the date can be
*/
is_valid_edd = function(date, format, config, maximum_weeks) {
    // implements strict validation with 'true' below
    today = get_moment_date(config.testing_today, format);
    edd_date = moment(date, format);
    weeks = parseInt(moment.duration(edd_date - today).asWeeks());
    return edd_date > today && weeks < maximum_weeks;
};

/**: is_valid_year(year, minYear, maxYear)
Checks that the number representing year is within the range determined by the
minYear & maxYear parameters

:param string year: year to be checked
:param string minYear: lower bound of check
:param string maxYear: upper bound of check
*/
is_valid_year = function(year, minYear, maxYear) {
    return this.check_valid_number(year)
        && parseInt(year, 10) >= parseInt(minYear, 10)
        && parseInt(year, 10) <= parseInt(maxYear, 10);
};

/**: is_valid_day_of_month(day)
Checks that the number representing the day of the month is within a valid range

:param string day: day to be validated
:param string month: Optional. Month to be validated.
:param string year: Optional. Year to be validated.
*/
is_valid_day_of_month = function(day, month, year) {
    if (month && year) {
        return this.is_valid_date(year + "-" + month + "-" + day, "YYYY-M-D");
    } else if (month) {
        return this.is_valid_date("2000-" + month + "-" + day, "YYYY-M-D");
    } else {
        // check that it is a number and between 1 and 31
        return this.check_valid_number(day)
            && parseInt(day, 10) >= 1
            && parseInt(day, 10) <= 31;
    }
};

/**: get_entered_birth_date(year, month, day, separator_char)
Concatenates year, month and day strings.

:param string year: year
:param string month: month
:param string day: day
:param string separator_char: separator character
*/
// simply concatenates year, month and day (optional: separator specified)
get_entered_birth_date = function(year, month, day, separator_char) {
  var sc = separator_char || '-';
  return year + sc + month + sc + this.double_digit_number(day);
};

// TEXT HELPERS

/**: check_valid_alpha(input)
Checks whether all characters in input string are in standard alphabet

:param string input: string to check
*/
check_valid_alpha = function(input) {
    //
    var alpha_only = new RegExp('^[A-Za-z]+$');
    return input !== '' && alpha_only.test(input);
};

/**: is_alpha_numeric_only(input)
Checks whether input string consist of alpha-numberics

:param object input: string to check
*/
is_alpha_numeric_only = function(input) {
    alpha_numeric = new RegExp('^[A-Za-z0-9]+$');
    return alpha_numeric.test(input);
};

/**: is_valid_name(input, min, max)
Check that the input string does not include characters normally not found in
names. Also includes a length check; input string length needs to be within
min-max range

:param string input: string to check
:param string min: minimum length
:param string max: maximum length
*/
is_valid_name = function(input, min, max) {
    var name_check = new RegExp(
        '(^[^±!@£$%^&*_+§¡€#¢§¶•ªº«\\/<>?:;|=.,0123456789]{min,max}$)'
        .replace('min', min.toString())
        .replace('max', max.toString())
    );
    return input !== '' && name_check.test(input);
};

/**: get_clean_first_word(user_message)
Extracts first word from a message.

:param string user_message: message to extract first word from
*/
get_clean_first_word = function(user_message) {
    return user_message
        .trim()                 // remove whitespace from start and end
        .split(" ")[0]          // split off first word
        .replace(/\W/g, '')     // remove non letters
        .toUpperCase();         // capitalise
};

// ID HELPERS

/**: extract_za_id_dob(id)
Extracts the date of birth from a South African identification number

:param string id: id number
*/
extract_za_id_dob = function(id) {
    var id_dob = moment(id.slice(0,6), 'YYMMDD').format('YYYY-MM-DD');
    var dob_century = id_dob.slice(0,2);
    var dob_two_digit_year = id_dob.slice(2,4);

    // override moment default century switch at '68 with '49
    if (dob_two_digit_year > 49) {
        id_dob = id_dob.replace(dob_century, '19');
    }

    return id_dob;
};

/**: validate_id_za(id)
Validates South African identification number

:param string id: id number
*/
validate_id_za = function(id) {
    var i, c,
        even = '',
        sum = 0,
        check = id.slice(-1);

    if (id.length != 13 || id.match(/\D/)) {
        return false;
    }
    if (!moment(id.slice(0,6), 'YYMMDD', true).isValid()) {
        return false;
    }
    id = id.substr(0, id.length - 1);
    for (i = 0; id.charAt(i); i += 2) {
        c = id.charAt(i);
        sum += +c;
        even += id.charAt(i + 1);
    }
    even = '' + even * 2;
    for (i = 0; even.charAt(i); i++) {
        c = even.charAt(i);
        sum += +c;
    }
    sum = 10 - ('' + sum).charAt(1);
    return ('' + sum).slice(-1) == check;
};

// BOOLEAN HELPERS

/**: is_true(bool)
Checks whether parameter given is not undefined and true

:param string/boolean bool: parameter to check
*/
is_true = function(bool) {
    //If is is not undefined and boolean is true
    return (!_.isUndefined(bool) && (bool==='true' || bool===true));
};


// CHOICE HELPERS

/**: make_month_choices($, startDate, limit, increment, valueFormat, labelFormat)
Works in conjunction with vumigo Choice-/PaginatedChoiceState providing month choices
according to number required in listing. Listing can go forward/backward in increments,
and be displayed in the necessary value/label format.
Returns an array of Choice objects.

:param object $:
:param string startDate: the starting date of the Choice listing to be build.
:param string limit: the number of Choice objects required in listing
:param string increment: positive/negative incremental steps of month/Choice objects
:param string valueFormat:
    required value format (see valid format options on http://momentjs.com/docs/#/displaying/)
    - valueFormat affects value property of Choice object (choice.value)
:param string labelFormat:
    required label format (see valid format options on http://momentjs.com/docs/#/displaying/)
    - labelFormat affects label property of Choice object (choice.label)
*/
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
    check_number_in_range: check_number_in_range,
    readable_msisdn: readable_msisdn,
    is_valid_msisdn: is_valid_msisdn,
    normalize_msisdn: normalize_msisdn,
    get_january: get_january,
    get_timestamp: get_timestamp,
    get_moment_date: get_moment_date,
    is_valid_date: is_valid_date,
    is_valid_edd: is_valid_edd,
    is_valid_year: is_valid_year,
    is_valid_day_of_month: is_valid_day_of_month,
    get_entered_birth_date: get_entered_birth_date,
    check_valid_alpha: check_valid_alpha,
    is_alpha_numeric_only: is_alpha_numeric_only,
    is_valid_name: is_valid_name,
    get_clean_first_word: get_clean_first_word,
    extract_za_id_dob: extract_za_id_dob,
    validate_id_za: validate_id_za,
    is_true: is_true,
    make_month_choices: make_month_choices,
    get_paginated_response: get_paginated_response
};
