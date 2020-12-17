var assert = require('assert');
var moment = require('moment');
var vumigo = require('vumigo_v02');

var Choice = vumigo.states.Choice;
var ChoiceState = vumigo.states.ChoiceState;
var EndState = vumigo.states.EndState;
var FreeText = vumigo.states.FreeText;

var AppTester = vumigo.AppTester;
var App = vumigo.App;
App.call(App);
var $ = App.$;
var utils = require('../lib/utils');

describe("Testing utils functions", function() {

    describe("check_valid_number", function() {
        it("only numbers is valid", function() {
            assert(utils.check_valid_number("012345"), true);
        });
        it("any letters invalidates check", function() {
            assert.equal(utils.check_valid_number("012abc345"), false);
        });
        it("any other characters invalidates check", function() {
            assert.equal(utils.check_valid_number("-123456"), false);
            assert.equal(utils.check_valid_number("123-456"), false);
            assert.equal(utils.check_valid_number("1234&56"), false);
            assert.equal(utils.check_valid_number("1%234#56"), false);
        });
    });

    describe("double_digit_number", function() {
        it("single digit numbers should be prepended with '0'", function() {
            assert.deepEqual(utils.double_digit_number(1), '01');
            assert.deepEqual(utils.double_digit_number(4), '04');
        });
        it("double digits number should stay unchanged", function() {
            assert.deepEqual(utils.double_digit_number(10), '10');
            assert.deepEqual(utils.double_digit_number(95), '95');
        });
        it("doens't handle negative numbers; scrambled output", function() {
            assert.deepEqual(utils.double_digit_number(-1), '0-1');
        });
    });

    describe("check_number_in_range", function() {
        it("should return true", function() {
            assert(utils.check_number_in_range(5, 1, 10));
            assert(utils.check_number_in_range(72, 1, 100));
        });
        it("should return true for min/max boundaries ", function() {
            assert(utils.check_number_in_range(1, 1, 10));
            assert(utils.check_number_in_range(10, 1, 10));
        });
        it("should return false", function() {
            assert.equal(utils.check_number_in_range(11, 1, 10), false);
            assert.equal(utils.check_number_in_range(77, 7, 17), false);
        });
    });

    describe("readable_msisdn", function() {
        it("should return readable msisdn", function() {
            assert.equal(utils.readable_msisdn("+27821234567", "+27"), "0821234567");
            assert.equal(utils.readable_msisdn("+264821234567", "+264"), "0821234567");
            assert.equal(utils.readable_msisdn("0821234567", "+27"), "0821234567");
            assert.equal(utils.readable_msisdn("+27821234567", "27"), "0821234567");
        });
        it("should return readable msisdn if it contains no leading '+' or '0'", function() {
            assert.equal(utils.readable_msisdn("27821234567", "+27"), "0821234567");
            assert.equal(utils.readable_msisdn("27821234567", "27"), "0821234567");
        });
    });

    describe("is_valid_msisdn function", function() {
        it("invalid phone number", function() {
            assert.equal(utils.is_valid_msisdn("12345", "ZA"), false);
        });
        it("unparseable phone number", function() {
            assert.equal(utils.is_valid_msisdn("abc", "ZA"), false);
        });
        it("valid phone number", function() {
            assert.equal(utils.is_valid_msisdn("0820001001", "ZA"), true);
        });
    });

    describe("normalize_msisdn(raw, country_code)", function() {
        it("return raw number unchanged if shortcode", function() {
            assert.deepEqual(utils.normalize_msisdn("0123", "ZA"), "0123");
        });
        it("starts with '00'; replace with '+', don't prepend country_code", function() {
            assert.deepEqual(utils.normalize_msisdn("0012345", "ZA"), "+12345");
        });
        it("starts with '0'; replace with '+' + country_code", function() {
            assert.deepEqual(utils.normalize_msisdn("012345", "ZA"), "+2712345");
        });
        it("starts with '+'; return raw number as is", function() {
            assert.deepEqual(utils.normalize_msisdn("+2712345", "ZA"), "+2712345");
        });
        it("starts with country code; add + to beginning", function() {
            assert.deepEqual(utils.normalize_msisdn("2712345", "ZA"), "+2712345");
        });
    });

    describe("get_timestamp", function() {
        it("when date passed in, return the same as moment object", function() {
            assert.deepEqual(utils.get_timestamp("YYYY-MM-DD-HH-mm-ss"),
                new moment().format("YYYY-MM-DD-HH-mm-ss"));
        });
        it("no date passed, return current moment object", function() {
            assert.deepEqual(utils.get_timestamp(),
                new moment().format("YYYYMMDDHHmmss"));
        });
    });

    describe("get_moment_date", function() {
        it("no date passed, return current moment object", function() {
            assert.deepEqual(utils.get_moment_date(null, null).format(), new moment().format());
        });
        it("when date passed in that matches default date format, return corresponding moment object", function() {
            assert.deepEqual(utils.get_moment_date("1970-08-23", null).format("YYYY-MM-DD hh:mm:ss"), "1970-08-23 12:00:00");
        });
        it("when date passed in that doesn't match default date format, return corresponding moment object", function() {
            assert.deepEqual(utils.get_moment_date("2016-05-23 12:30:15", null).format("YYYY-MM-DD hh:mm:ss"), "2016-05-23 12:00:00");
        });
        it("when date & format passed in, return corresponding moment object 1", function() {
            assert.deepEqual(utils.get_moment_date("2016-05-23 12:30:15", "YYYY-MM-DD").format("YYYY-MM-DD hh:mm:ss"), "2016-05-23 12:00:00");
        });
        it("when date & format passed in, return corresponding moment object 2", function() {
            assert.deepEqual(utils.get_moment_date("2016-05-23 12:30:15", "YYYY-MM-DD hh:mm:ss").format("YYYY-MM-DD hh:mm:ss"),
                "2016-05-23 12:30:15");
        });
        it("when date & format passed in, evaluates to false because of difference in time", function() {
            assert.notEqual(utils.get_moment_date("2016-05-23 12:30:15", "YYYY-MM-DD hh:mm:ss").format("YYYY-MM-DD hh:mm:ss"),
                "2016-05-23 12:30:16");
        });
    });

    describe("get_january", function() {
        it("get 1st jan moment date of any given year (test date)", function() {
            assert.deepEqual(utils.get_january("2016-05-23 12:30:15").format("YYYY-MM-DD"), "2016-01-01");
        });
        it("get 1st jan moment date of current year", function() {
            assert.deepEqual(utils.get_january().format("YYYY-MM-DD"),
                new moment().format("YYYY-01-01"));
        });
    });

    describe("is_valid_date", function() {
        it("returns true for valid YYYY-MM-DD dates", function() {
            assert(utils.is_valid_date("2016-05-19", "YYYY-MM-DD"));
        });
        it("returns true for valid YYYY/MM/DD dates", function() {
            assert(utils.is_valid_date("2016/05/19", "YYYY/MM/DD"));
        });
        it("returns true for valid YYYY/DD/MM dates", function() {
            assert(utils.is_valid_date("2016/19/05", "YYYY/DD/MM"));
        });
        it("returns true for valid DD MMMM 'YY dates", function() {
            assert(utils.is_valid_date("05 May '16", "DD MMMM 'YY"));
        });
        it("returns false for valid date specified with unmatching format", function() {
            assert.equal(utils.is_valid_date("2016-05-19", "YYYY/MM/DD"), false);
        });
        it("returns false for invalid date", function() {
            // invalid day
            assert.equal(utils.is_valid_date("2015-05-32", "YYYY-MM-DD"), false);
            // invalid day - leap year example
            assert.equal(utils.is_valid_date("2015-02-29", "YYYY-MM-DD"), false);
            // invalid month
            assert.equal(utils.is_valid_date("2015-13-19", "YYYY-MM-DD"), false);
            // invalid year
            assert.equal(utils.is_valid_date("20151-05-19", "YYYY-MM-DD"), false);
        });
    });

    describe("is_valid_edd", function() {
        beforeEach(function() {
            config = {testing_today: "2016-05-23"};
        });

        it("return false for edd dates before today", function() {
            assert.equal(utils.is_valid_edd("2016-05-19", "YYYY-MM-DD", config, 43), false);
        });

        it("return false for edd dates to far ahead", function() {
            assert.equal(utils.is_valid_edd("2017-03-23", "YYYY-MM-DD", config, 43), false);
        });

        it("return true for a value edd date", function() {
            assert(utils.is_valid_edd("2017-02-23", "YYYY-MM-DD", config, 43));
        });

        it("return false and doesn't fail when testing_today not in config", function() {
            assert.equal(utils.is_valid_edd("2012-02-23", "YYYY-MM-DD", {}, 43), false);
        });
    });

    describe("is_valid_year", function() {
        it("valid; year within bounds", function() {
            assert(utils.is_valid_year("2016", "1990", "2030"));
            assert(utils.is_valid_year("2016", "2015", "2017"));
            assert(utils.is_valid_year("2016", "2016", "2017"));
            assert(utils.is_valid_year("2016", "2015", "2016"));
            assert(utils.is_valid_year("2016", "2016", "2016"));
        });
        it("invalid; year outside bounds", function() {
            assert.equal(utils.is_valid_year("2016", "2010", "2015"), false);
            assert.equal(utils.is_valid_year("2016", "2017", "2020"), false);
        });
    });

    describe("is_valid_day_of_month", function() {
        it("only day is provided", function() {
            // only 1-31 should be valid
            assert.equal(utils.is_valid_day_of_month("0"), false);
            assert.equal(utils.is_valid_day_of_month("01"), true);
            assert.equal(utils.is_valid_day_of_month("31"), true);
            assert.equal(utils.is_valid_day_of_month("32"), false);

            // check different formatting
            // . valid
            assert.equal(utils.is_valid_day_of_month(1), true);
            assert.equal(utils.is_valid_day_of_month("1"), true);
            assert.equal(utils.is_valid_day_of_month("001"), true);
            // . invalid
            assert.equal(utils.is_valid_day_of_month("1.5"), false);
            assert.equal(utils.is_valid_day_of_month("Monday"), false);
        });
        it("day and month is provided", function() {
            // 31st should only be valid in certain months
            assert.equal(utils.is_valid_day_of_month("31", "01"), true);  // jan 31
            assert.equal(utils.is_valid_day_of_month("30", "04"), true);  // apr 30
            assert.equal(utils.is_valid_day_of_month("31", "04"), false);  // apr 31
            // feb 29 should be valid, not feb 30
            assert.equal(utils.is_valid_day_of_month("29", "02"), true);  // feb 29
            assert.equal(utils.is_valid_day_of_month("30", "02"), false);  // feb 30

            // check different formatting
            // . valid
            assert.equal(utils.is_valid_day_of_month("1", "1"), true);  // jan 1
            assert.equal(utils.is_valid_day_of_month(1, 1), true);  // jan 1
            // . invalid
            assert.equal(utils.is_valid_day_of_month(1, "January"), false);
        });
        it("day, month and year is provided", function() {
            // 31st should only be valid in certain months
            assert.equal(utils.is_valid_day_of_month("31", "01", "2016"), true);  // jan 31
            assert.equal(utils.is_valid_day_of_month("30", "04", "2016"), true);  // apr 30
            assert.equal(utils.is_valid_day_of_month("31", "04", "2016"), false);  // apr 31
            // feb 29 should be valid only in leap year
            assert.equal(utils.is_valid_day_of_month("29", "02", "2000"), true);  // leap year
            assert.equal(utils.is_valid_day_of_month("28", "02", "2001"), true);  // normal year
            assert.equal(utils.is_valid_day_of_month("29", "02", "2001"), false);  // normal year

            // check different formatting
            // . valid
            assert.equal(utils.is_valid_day_of_month("1", "1", "1901"), true);  // jan 1 1901
            assert.equal(utils.is_valid_day_of_month(1, 1, 1901), true);  // jan 1 1901
            // . invalid
            assert.equal(utils.is_valid_day_of_month(1, 1, "two thousand"), false);  // jan 1 2000
        });
    });

    describe("get_entered_birth_date", function() {
        it("without date separators specified", function() {
            assert(utils.get_entered_birth_date("1982", "2", "1"), "1982-02-01");
        });
        it("with date separators specified", function() {
            assert(utils.get_entered_birth_date("1982", "2", "1", "/"), "1982/02/01");
        });
    });

    describe("check_valid_alpha", function() {
        it("valid alphabetical", function() {
            assert(utils.check_valid_alpha("abc"));
            assert(utils.check_valid_alpha("JohnDeere"));
        });
        it("invalid alphabetical", function() {
            assert.equal(utils.check_valid_alpha(""), false);
            assert.equal(utils.check_valid_alpha(" "), false);
            assert.equal(utils.check_valid_alpha("John Deere"), false);
            assert.equal(utils.check_valid_alpha("A123"), false);
            assert.equal(utils.check_valid_alpha("A#1"), false);
        });
    });

    describe("is_alpha_numeric_only", function() {
        it("valid alpha-numerics", function() {
            assert(utils.is_alpha_numeric_only("John"));
            assert(utils.is_alpha_numeric_only("John123"));
            assert(utils.is_alpha_numeric_only("J1o2h3n"));
        });
        it("invalid alpha-numerics", function() {
            assert.equal(utils.is_alpha_numeric_only(" 123"), false);
            assert.equal(utils.is_alpha_numeric_only("Jo h n"), false);
            assert.equal(utils.is_alpha_numeric_only("J1o#hn?"), false);
        });
    });

    describe("is_valid_name", function() {
        it("valid name", function() {
            assert(utils.is_valid_name("John", 1, 5));
            assert(utils.is_valid_name("Ba Ki-moon", 1, 15));
            assert(utils.is_valid_name("-Jo-hn", 1, 10));
        });
        it("invalid name", function() {
            assert.equal(utils.is_valid_name("123", 1, 5), false);
            assert.equal(utils.is_valid_name("John", 1, 3), false);
            assert.equal(utils.is_valid_name("John?", 1, 5), false);
        });
    });

    describe("get_clean_first_word", function() {
        it("should get and capitalise first word", function() {
            assert.deepEqual(utils.get_clean_first_word("Only"), "ONLY");
            assert.deepEqual(utils.get_clean_first_word("Once there was..."), "ONCE");
            assert.deepEqual(utils.get_clean_first_word("Stop the noise"), "STOP");
        });
        it("should get clean first word if contains non-letters/numbers", function() {
            assert.deepEqual(utils.get_clean_first_word("O$ne Two T3ree"), "ONE");
            assert.deepEqual(utils.get_clean_first_word("O$1ne T2wo Th3ree"), "O1NE");
        });
        it("should get clean first word if starts with whitespace", function() {
            assert.deepEqual(utils.get_clean_first_word(" Only"), "ONLY");
            assert.deepEqual(utils.get_clean_first_word("    Once"), "ONCE");
        });
    });

    describe("extract_za_id_dob", function() {
        it("valid dates extracted", function() {
            assert.deepEqual(utils.extract_za_id_dob("8104267805280"),
                moment("1981-04-26").format("YYYY-MM-DD"));
            assert.deepEqual(utils.extract_za_id_dob("8202017805280"),
                moment("1982-02-01").format("YYYY-MM-DD"));
        });
        it("invalid dates extracted", function() {
            // 31 of Feb
            assert.deepEqual(utils.extract_za_id_dob("8102317805280"), "Invalid date");
        });
        it("invalid - id number length < 6", function() {
            // fifth digit intepreted as single-digit day
            assert.deepEqual(utils.extract_za_id_dob("81042"),
                moment("1981-04-02").format("YYYY-MM-DD"));

            // no day found in id number will default to '01'
            assert.deepEqual(utils.extract_za_id_dob("8104"),
                moment("1981-04-01").format("YYYY-MM-DD"));

            // 'Invalid date' when input length < 4
            assert.deepEqual(utils.extract_za_id_dob("810"), "Invalid date");
        });
        it("correct century extracted", function() {
            assert.deepEqual(utils.extract_za_id_dob("5202017805280"),
                moment("1952-02-01").format("YYYY-MM-DD"));
            // boundary case - first day > '49
            assert.deepEqual(utils.extract_za_id_dob("5001017805280"),
                moment("1950-01-01").format("YYYY-MM-DD"));
            // boundary case - last day < '49
            assert.deepEqual(utils.extract_za_id_dob("4812317805280"),
                moment("2048-12-31").format("YYYY-MM-DD"));
            // boundary case (default moment.two_digit_year) - first day > '68
            assert.deepEqual(utils.extract_za_id_dob("6901017805280"),
                moment("1969-01-01").format("YYYY-MM-DD"));
            // boundary case (default moment.two_digit_year) - last day < '68
            assert.deepEqual(utils.extract_za_id_dob("6712317805280"),
                moment("1967-12-31").format("YYYY-MM-DD"));
            // year 2000
            assert.deepEqual(utils.extract_za_id_dob("0012317805280"),
                moment("2000-12-31").format("YYYY-MM-DD"));
        });
    });

    describe("validate_id_za", function() {
        it("valid sa id's", function() {
            assert(utils.validate_id_za("8104265087082"));
            assert(utils.validate_id_za("8202010057085"));
            assert(utils.validate_id_za("5405295094086"));
            assert(utils.validate_id_za("0309130230084"));
        });
        it("invalid sa id's (of length 13)", function() {
            assert.equal(utils.validate_id_za("8104267805280"), false);
            assert.equal(utils.validate_id_za("1234015009087"), false);
        });
        it("invalid sa id's (length not 13)", function() {
            assert.equal(utils.validate_id_za("123"), false);  // length 3
            assert.equal(utils.validate_id_za("81042650870820"), false);  // length 14
        });
    });

    describe("is_true", function() {
        it("valid", function() {
            assert(utils.is_true(true));
            assert(utils.is_true("true"));
        });
        it("invalid", function() {
            assert.equal(utils.is_true(undefined), false);
            assert.equal(utils.is_true("True"), false);
            assert.equal(utils.is_true(false), false);
        });
    });

    describe("make_month_choices function", function() {
        it('should return a Choice array of correct size - forward in same year', function() {
            // test data
            var testDate = moment("2015-04-26");
            var limit = 6;     // should determine the size of the returned array
            var increment = 1; // should determine subsequent direction of array elements

            // function call
            var expectedChoiceArray = utils
                .make_month_choices($, testDate, limit, increment, "YYYYMM", "MMMM YY");

            // expected results
            assert.equal(expectedChoiceArray.length, limit);
            assert.equal(expectedChoiceArray[0].value, "201504");
            assert.equal(expectedChoiceArray[1].value, "201505");
            assert.equal(expectedChoiceArray[2].value, "201506");
            assert.equal(expectedChoiceArray[3].value, "201507");
            assert.equal(expectedChoiceArray[4].value, "201508");
            assert.equal(expectedChoiceArray[5].value, "201509");
        });
        it('should return a Choice array of correct size - backwards in same year', function() {
            // test data
            var testDate = moment("2015-07-26");
            var limit = 7;     // should determine the size of the returned array
            var increment = -1; // should determine subsequent direction of array elements

            // function call
            var expectedChoiceArray = utils
                .make_month_choices($, testDate, limit, increment, "YYYYMM", "MMMM YY");

            // expected results
            assert.equal(expectedChoiceArray.length, limit);
            assert.equal(expectedChoiceArray[0].value, "201507");
            assert.equal(expectedChoiceArray[1].value, "201506");
            assert.equal(expectedChoiceArray[2].value, "201505");
            assert.equal(expectedChoiceArray[3].value, "201504");
            assert.equal(expectedChoiceArray[4].value, "201503");
            assert.equal(expectedChoiceArray[5].value, "201502");
            assert.equal(expectedChoiceArray[6].value, "201501");
        });
        it('should return a Choice array of correct size - forward across years', function() {
            // test data
            var testDate = moment("2015-12-26");
            var limit = 4;     // should determine the size of the returned array
            var increment = 1; // should determine subsequent direction of array elements

            // function call
            var expectedChoiceArray = utils
                .make_month_choices($, testDate, limit, increment, "YYYYMM", "MMMM YY");

            // expected results
            assert.equal(expectedChoiceArray.length, limit);
            assert.equal(expectedChoiceArray[0].value, "201512");
            assert.equal(expectedChoiceArray[1].value, "201601");
            assert.equal(expectedChoiceArray[2].value, "201602");
            assert.equal(expectedChoiceArray[3].value, "201603");
        });
        it('should return an array of choices - backwards across years', function() {
            // test data
            var testDate = moment("2015-01-26");
            var limit = 3;     // should determine the size of the returned array
            var increment = -1; // should determine subsequent direction of array elements

            // function call
            var expectedChoiceArray = utils
                .make_month_choices($, testDate, limit, increment, "YYYYMM", "MMMM YY");

            // expected results
            assert.equal(expectedChoiceArray.length, limit);
            assert.equal(expectedChoiceArray[0].value, "201501");
            assert.equal(expectedChoiceArray[1].value, "201412");
            assert.equal(expectedChoiceArray[2].value, "201411");
        });
        it('should return an array of choices - forwards, with elements separated by 3 months', function() {
            // test data
            var testDate = moment("2015-01-26");
            var limit = 3;     // should determine the size of the returned array
            var increment = 3; // should determine subsequent direction of array elements

            // function call
            var expectedChoiceArray = utils
                .make_month_choices($, testDate, limit, increment, "YYYYMM", "MMMM YY");

            // expected results
            assert.equal(expectedChoiceArray.length, limit);
            assert.equal(expectedChoiceArray[0].value, "201501");
            assert.equal(expectedChoiceArray[1].value, "201504");
            assert.equal(expectedChoiceArray[2].value, "201507");
        });
    });
});

describe("Testing app- and service call functions", function() {
    var app;
    var tester;

    beforeEach(function() {
        app = new App("state_one");

        var interrupt = true;

        // override normal state adding
        app.add = function(name, creator) {
            app.states.add(name, function(name, opts) {
                if (!interrupt || !utils.timed_out(app.im))
                    return creator(name, opts);

                interrupt = false;
                opts = opts || {};
                opts.name = name;

                if (utils.timeout_redirect(app.im)) {
                    return app.states.create(name, opts);
                    // return app.states.create("state_one"); if you want to redirect to the start state
                } else {
                    return app.states.create("state_timed_out", opts);
                }
            });
        };

        // timeout
        app.states.add("state_timed_out", function(name, creator_opts) {
            return new ChoiceState(name, {
                question: "You timed out. What now?",
                choices: [
                    new Choice("continue", $("Continue")),
                    new Choice("restart", $("Restart")),
                    new Choice("exit", $("Exit"))
                ],
                next: function(choice) {
                    if (choice.value === "continue") {
                        return {
                            name: creator_opts.name,
                            creator_opts: creator_opts
                        };
                    } else if (choice.value === "restart") {
                        return "state_one";
                    } else {
                        return "state_end";
                    }
                }
            });
        });

        app.add("state_one", function(name) {
            return new FreeText(name, {
                question: "This is the first state.",
                next: "state_two"
            });
        });

        app.add("state_two", function(name) {
            return new FreeText(name, {
                question: "This is the second state.",
                next: "state_three"
            });
        });

        app.add("state_three", function(name) {
            return new FreeText(name, {
                question: "This is the third state.",
                next: "state_four"
            });
        });

        // a HTTP POST request is made going from this state to the next/last
        app.add("state_four", function(name) {
            return new FreeText(name, {
                question: "This is the forth state.",
                next: "state_end"
            });
        });

        app.add("state_end", function(name) {
            return new EndState(name, {
                text: "This is the end state.",
                next: "state_one"
            });
        });

        tester = new AppTester(app);

        tester
            .setup.config.app({
                name: "JS-box-utils-tester",
                testing_today: "2016-05-23",
                channel: '2341234',
                transport_name: 'aggregator_sms',
                transport_type: 'sms',
                testing_message_id: '0170b7bb-978e-4b8a-35d2-662af5b6daee',  // testing only
                logging: 'off',  // 'off' is default; 'test' outputs to console.log, 'prod' to im.log
                no_timeout_redirects: [
                    'state_one',
                    'state_three',
                    'state_end'
                ],
                timeout_redirects: [
                    'state_four'
                ]
            })
            ;
    });

    describe("check_fixtures_used function", function() {
        it("no fixtures used", function() {
            return tester
                .setup.user.addr('08212345678')
                .input(
                    "blah"  // state_one
                )
                .check.interaction({
                    state: "state_two"
                })
                .check(function(api) {
                    utils.check_fixtures_used(api, []);
                })
                .run();
        });
        it("no fixtures used", function() {
            return tester
                .setup.user.addr('08212345678')
                .setup.user.state('state_two')
                .input(
                    "blah"  // state_two
                )
                .check.interaction({
                    state: "state_three"
                })
                .run();
        });
        it("no fixtures used", function() {
            return tester
                .setup.user.addr('08212345678')
                .inputs(
                    "blah"  // state_one
                    , "blah"  // state_two
                    , "blah"  // state_three
                    , "blah"  // state_four
                )
                .check.interaction({
                    state: "state_end"
                })
                .run();
        });
    });

    describe("timed_out function", function() {
        it("no time-out redirect; move on to next state", function() {
            return tester
                .setup.user.addr('08212345678')
                .setup.user.state('state_two')
                .inputs(
                    "blah"  // state_two
                    , {session_event: "close"}
                    , {session_event: "new"}
                )
                .check.interaction({
                    state: "state_three"
                })
                .run();
        });
        it("timed out; to state_timed_out", function() {
            return tester
                .setup.user.addr('08212345678')
                .setup.user.state('state_two')
                .inputs(
                    {session_event: "close"}
                    , {session_event: "new"}
                )
                .check.interaction({
                    state: "state_timed_out"
                })
                .run();
        });
        // use same setup initially
        it("choice made to 'Continue' after time out occurred; go on to next state", function() {
            return tester
                .setup.user.addr('08212345678')
                .setup.user.state('state_two')
                .inputs(
                    {session_event: "close"}
                    , {session_event: "new"}
                    , "1"  // state_two
                )
                .check.interaction({
                    state: "state_two"
                })
                .run();
        });
        it("choice made to 'Restart' after time out occured; go to start state", function() {
            return tester
                .setup.user.addr('08212345678')
                .setup.user.state('state_two')
                .inputs(
                    {session_event: "close"}
                    , {session_event: "new"}
                    , "2"
                )
                .check.interaction({
                    state: "state_one"
                })
                .run();
        });
        it("choice made to 'Exit' after time out occured; go to end state", function() {
            return tester
                .setup.user.addr('08212345678')
                .setup.user.state('state_two')
                .inputs(
                    {session_event: "close"}
                    , {session_event: "new"}
                    , "3"
                )
                .check.interaction({
                    state: "state_end"
                })
                .run();
        });
    });

    describe("timeout_redirect function", function() {
        it("time-out redirect; from state_four to state_one)", function() {
            return tester
                .setup.user.addr('08212345678')
                .setup.user.state('state_three')
                .inputs(
                    "blah"  // state_three
                    , {session_event: "close"}
                    , {session_event: "new"}
                )
                .check.interaction({
                    state: "state_four"
                })
                .run();
        });
    });

});
