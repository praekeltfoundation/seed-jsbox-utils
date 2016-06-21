var Utils = require("../lib");
var assert = require('assert');
var moment = require('moment');
var vumigo = require('vumigo_v02');

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

    beforeEach(function() {
        app = new App("state_start");

        var interrupt = true;
        // override normal state adding
        app.add = function(name, creator) {
            app.states.add(name, function(name, opts) {
                if (!interrupt || !Utils.timed_out(app.im))
                    return creator(name, opts);

                interrupt = false;
                opts = opts || {};
                opts.name = name;

                if (Utils.timeout_redirect(app.im)) {
                    return app.states.create("state_start");
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
                        return "state_start";
                    } else {
                        return "state_end";
                    }
                }
            });
        });

        app.add("state_start", function(name) {
            return new FreeText(name, {
                question: "This is the start state.",
                next: "state_one"
            });
        });

        // a HTTP GET request is made going from this state to the next
        app.add("state_one", function(name) {
            return new FreeText(name, {
                question: "This is the first state.",
                next: function(content) {
                    return Utils
                        .service_api_call("identities", "get", null, null, "identity/"+app.im.user.addr+"/", app.im)
                        .then(function(response) {
                            return "state_two";
                        });
                }
            });
        });

        app.add("state_two", function(name) {
            return new FreeText(name, {
                question: "This is the second state.",
                next: "state_three"
            });
        });

        // a HTTP POST request is made going from this state to the next/last
        app.add("state_three", function(name) {
            return new FreeText(name, {
                question: "This is the third state.",
                next: function(content) {
                    return Utils
                        .service_api_call("identities", "post", null, { "msisdn": app.im.user.addr }, "", app.im)
                        .then(function(response) {
                            return "state_end";
                        });
                }
            });
        });

        app.add("state_end", function(name) {
            return new EndState(name, {
                text: "This is the end state.",
                next: "state_start"
            });
        });

        tester = new AppTester(app);

        tester
            .setup.config.app({
                name: "JS-box-utils-tester",
                testing_today: "2016-05-23",
                services: {
                    identities: {
                        api_token: 'test_token_identities',
                        url: "http://localhost:8001/api/v1/"
                    }
                },
                no_timeout_redirects: [
                    'state_start',
                    'state_two',
                    'state_end'
                ],
                timeout_redirects: [
                    'state_three'
                ]
            })
            .setup(function(api) {
                fixtures().forEach(api.http.fixtures.add);
            })
            ;
    });

    describe("check_fixtures_used (& service_api_call)", function() {
        it("to state_one (no fixtures used)", function() {
            return tester
                .setup.user.addr('08212345678')
                .input(
                    "blah"  // state_start
                )
                .check.interaction({
                    state: "state_one"
                })
                .check(function(api) {
                    Utils.check_fixtures_used(api, []);
                })
                .run();
        });
        it("to state_two (GET request performed; corresponding fixture used)", function() {
            return tester
                .setup.user.addr('08212345678')
                .setup.user.state('state_one')
                .input(
                    "blah"  // state_one
                )
                .check.interaction({
                    state: "state_two"
                })
                .check(function(api) {
                    Utils.check_fixtures_used(api, [0]);
                })
                .run();
        });
        it("to state_end (entire flow, GET and POST fixtures used)", function() {
            return tester
                .setup.user.addr('08212345678')
                .inputs(
                    "blah"  // state_start
                    , "blah"  // state_one
                    , "blah"  // state_two
                    , "blah"  // state_three
                )
                .check.interaction({
                    state: "state_end"
                })
                .check(function(api) {
                    Utils.check_fixtures_used(api, [0,1]);
                })
                .run();
        });
    });

    describe("timed_out", function() {
        it("to state_two (no time-out redirect)", function() {
            return tester
                .setup.user.addr('08212345678')
                .setup.user.state('state_one')
                .inputs(
                    "blah"  // state_one
                    , {session_event: "close"}
                    , {session_event: "new"}
                )
                .check.interaction({
                    state: "state_two"
                })
                .run();
        });
        it("to state_timed_out", function() {
            return tester
                .setup.user.addr('08212345678')
                .inputs(
                    "blah"  // state_start
                    , {session_event: "close"}
                    , {session_event: "new"}
                )
                .check.interaction({
                    state: "state_timed_out"
                })
                .run();
        });
        it("to state_end (choice made to 'Continue' after time out occured)", function() {
            return tester
                .setup.user.addr('08212345678')
                .setup.user.state('state_one')
                .inputs(
                    {session_event: "close"}
                    , {session_event: "new"}
                    , "1"
                )
                .check.interaction({
                    state: "state_one"
                })
                .run();
        });
        it("to state_end (choice made to 'Restart' after time out occured)", function() {
            return tester
                .setup.user.addr('08212345678')
                .inputs(
                    "blah"  // state_start
                    , {session_event: "close"}
                    , {session_event: "new"}
                    , "2"
                )
                .check.interaction({
                    state: "state_start"
                })
                .run();
        });
        it("to state_end (choice made to 'Exit' after time out occured)", function() {
            return tester
                .setup.user.addr('08212345678')
                .inputs(
                    "blah"  // state_start
                    , {session_event: "close"}
                    , {session_event: "new"}
                    , "3"
                )
                .check.interaction({
                    state: "state_end"
                })
                .run();
        });
    });

    describe("timeout_redirect", function() {
        it("to state_start (time-out redirect from state_three)", function() {
            return tester
                .setup.user.addr('08212345678')
                .setup.user.state('state_two')
                .inputs(
                    "blah"  // state_two
                    , {session_event: "close"}
                    , {session_event: "new"}
                )
                .check.interaction({
                    state: "state_start"
                })
                .run();
        });
    });

    describe("service_api_call (& check_fixtures_used)", function() {
        it("GET request", function() {
            return tester
                .setup.user.addr('08212345678')
                .check(function(api) {
                    return Utils
                        .service_api_call("identities", "get", null, null, "identity/"+app.im.user.addr+"/", app.im)
                        .then(function(response) {
                            assert.equal(response.code, "200");
                        });
                })
                .check(function(api) {
                    Utils.check_fixtures_used(api, [0]);
                })
                .run();
        });
        it("POST request", function() {
            return tester
                .setup.user.addr('08212345678')
                .check(function(api) {
                    return Utils
                        .service_api_call("identities", "post", null, { "msisdn": app.im.user.addr }, "", app.im)
                        .then(function(response) {
                            assert.equal(response.code, "201");
                        });
                })
                .check(function(api) {
                    Utils.check_fixtures_used(api, [1]);
                })
                .run();
        });
        it("PATCH request", function() {
            return tester
                .setup.user.addr('08212345678')
                .check(function(api) {
                    var endpoint = "identity/"+app.im.user.addr+"/completed";
                    return Utils
                        .service_api_call("identities", "patch", null, { "completed": true }, endpoint, app.im)
                        .then(function(response) {
                            assert.equal(response.code, "200");
                        });
                })
                .check(function(api) {
                    Utils.check_fixtures_used(api, [2]);
                })
                .run();
        });
    });

    describe("log_service_api_call", function() {
        it("to state_two (checking logging of http get request)", function() {
            return tester
                .setup.user.addr('08212345678')
                .setup.user.state('state_one')
                .input(
                    "blah"  // state_one
                )
                .check.interaction({
                    state: "state_two"
                })
                .check(function(api) {
                    var expected_log_entry = [
                        'Request: get http://localhost:8001/api/v1/identity/08212345678/',
                        'Payload: null',
                        'Params: null',
                        'Response: {"code":200,'+
                                    '"request":{"url":"http://localhost:8001/api/v1/identity/08212345678/",'+
                                    '"method":"GET"},'+
                                    '"body":"{\\"count\\":0,\\"next\\":null,\\"previous\\":null,\\"results\\":[]}"}'
                    ].join('\n');

                    var log_string_array = api.log.store["20"];
                    var last_entry_index = log_string_array.length;

                    assert.equal(log_string_array[last_entry_index-1], expected_log_entry);
                })
                .run();
        });
        it("to state_end (checking logging of http post request)", function() {
            return tester
                .setup.user.addr('08212345678')
                .setup.user.state('state_three')
                .input(
                    "blah"  // state_three
                )
                .check.interaction({
                    state: "state_end"
                })
                .check(function(api) {
                    var expected_log_entry = [
                        'Request: post http://localhost:8001/api/v1/',
                        'Payload: {"msisdn":"08212345678"}',
                        'Params: null',
                        'Response: {"code":201,'+
                            '"request":{"url":"http://localhost:8001/api/v1/",'+
                            '"method":"POST",'+
                            '"body":"{\\"msisdn\\":\\"08212345678\\"}"},'+
                            '"body":"{}"}'
                    ].join('\n');

                    var log_string_array = api.log.store["20"];
                    var last_entry_index = log_string_array.length;

                    assert.equal(log_string_array[last_entry_index-1], expected_log_entry);
                })
                .run();
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
