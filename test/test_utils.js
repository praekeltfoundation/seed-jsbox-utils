var Utils = require("../lib");
var assert = require('assert');
var moment = require('moment');
var vumigo = require('vumigo_v02');
var _ = require('lodash');

var fixtures = require('./fixtures');

var Choice = vumigo.states.Choice;
var ChoiceState = vumigo.states.ChoiceState;
var EndState = vumigo.states.EndState;
var FreeText = vumigo.states.FreeText;

var AppTester = vumigo.AppTester;
var App = vumigo.App;
App.call(App);
var $ = App.$;

describe("Testing Utils Functions", function() {

    var testing_config = {
        "testing_today": "2016-05-23"
    };

    var live_config = {};

    var app;
    var tester;

    beforeEach(function(){
        app = new App("state_start");
        tester = new AppTester(app);

        tester
            .setup.config.app({
                name: "JS-box-utils-tester",
                testing_today: "2016-05-23",
                services: {
                    identities: {
                        api_token: 'test_token_identities',
                        url: "http://localhost:8001/api/v1/"
                    },
                    registrations: {
                        api_token: 'test_token_registrations',
                        url: "http://localhost:8002/api/v1/"
                    },
                    voice_content: {
                        api_token: "test_token_voice_content",
                        url: "http://localhost:8004/api/v1/"
                    },
                    subscriptions: {
                        api_token: 'test_token_subscriptions',
                        url: "http://localhost:8005/api/v1/"
                    },
                    message_sender: {
                        api_token: 'test_token_message_sender',
                        url: "http://localhost:8006/api/v1/"
                    }
                },
                no_timeout_redirects: [
                    'state_start',
                    'state_end'
                ]
            })
            .setup(function(api) {
                fixtures().forEach(api.http.fixtures.add);
            })
            ;

        tester.data.opts = {};

        // override normal state adding
        app.add = function(name, creator) {
            app.states.add(name, function(name, opts) {
                if (!interrupt || !Utils.timed_out(self.im))
                    return creator(name, opts);

                interrupt = false;
                opts = opts || {};
                opts.name = name;
                return self.states.create("state_timed_out", opts);
            });
        };

        // timeout
        app.states.add("state_timed_out", function(name, creator_opts) {
            return new ChoiceState(name, {
                question: "You timed out. What now?",
                choices: [
                    new Choice('continue', $("Continue")),
                    new Choice('restart', $("Restart"))
                ],
                next: function(choice) {
                    if (choice.value === 'continue') {
                        return {
                            name: creator_opts.name,
                            creator_opts: creator_opts
                        };
                    } else if (choice.value === 'restart') {
                        return 'state_start';
                    }
                }
            });
        });

        app.add("state_start", function(name) {
            _.defaults(tester.data.opts, {next:"state_one"});
            return new FreeText(name, tester.data.opts);
        });

        app.add("state_one", function(name) {
            _.defaults(tester.data.opts, {next:"state_two"});
            return new FreeText(name, tester.data.opts);
        });

        app.add("state_two", function(name) {
            _.defaults(tester.data.opts, {next:"state_three"});
            return new FreeText(name, tester.data.opts);
        });

        app.add("state_three", function(name) {
            _.defaults(tester.data.opts, {next:"state_end"});
            return new FreeText(name, tester.data.opts);
        });

        app.add("state_end", function(name) {
            return new EndState(name, {
                text: 'This is the end state.'
            });
        });
    });

    describe("is_valid_msisdn", function() {
        it("should not validate if passed a number that doesn't start with '0'", function() {
            assert.equal(Utils.is_valid_msisdn("12345"), false);
        });
        it("should not validate if number starts with '0' but of incorrect length", function() {
            assert.equal(Utils.is_valid_msisdn("012345"), false);  // < 10
            assert.equal(Utils.is_valid_msisdn("01234567890123"), false);  // > 13
        });
        it("validatea if number starts with '0' and of correct length", function() {
            assert(Utils.is_valid_msisdn("01234567890"));
            assert(Utils.is_valid_msisdn("0123456789012"));
        });
    });

    describe("get_today", function() {
        it("when date passed in, return the same as moment object", function() {
            assert.deepEqual(Utils.get_today(testing_config).format("YYYY-MM-DD"),
                moment("2016-05-23").format("YYYY-MM-DD"));
        });
        it("no date passed, return current moment object", function() {
            assert.deepEqual(Utils.get_today(live_config).format("YYYY-MM-DD"),
                new moment().format("YYYY-MM-DD"));
        });
    });

    describe("get_january", function() {
        it("get 1st jan moment date of current year", function() {
            assert.deepEqual(Utils.get_january(testing_config).format("YYYY-MM-DD"),
                moment("2016-01-01").format("YYYY-MM-DD"));
        });
    });

    describe("make_month_choices", function() {
        it('should return a Choice array of correct size - forward in same year', function() {
            // test data
            var testDate = moment("2015-04-26");
            var limit = 6;     // should determine the size of the returned array
            var increment = 1; // should determine subsequent direction of array elements

            // function call
            var expectedChoiceArray = Utils
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
            var expectedChoiceArray = Utils
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
            var expectedChoiceArray = Utils
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
            var expectedChoiceArray = Utils
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
            var expectedChoiceArray = Utils
                .make_month_choices($, testDate, limit, increment, "YYYYMM", "MMMM YY");

            // expected results
            assert.equal(expectedChoiceArray.length, limit);
            assert.equal(expectedChoiceArray[0].value, "201501");
            assert.equal(expectedChoiceArray[1].value, "201504");
            assert.equal(expectedChoiceArray[2].value, "201507");
        });
    });

});
