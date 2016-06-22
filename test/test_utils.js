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
                channel: '2341234',
                transport_name: 'aggregator_sms',
                transport_type: 'sms',
                testing_message_id: '0170b7bb-978e-4b8a-35d2-662af5b6daee',  // testing only
                services: {
                    identities: {
                        api_token: 'test_token_identities',
                        url: "http://localhost:8001/api/v1/"
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

    describe("Tests check_fixtures_used (& service_api_call) function", function() {
        it("no fixtures used", function() {
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
        it("one fixture used; GET request performed", function() {
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
        it("multiple fixtures used; GET and POST requests", function() {
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

    describe("Tests timed_out function", function() {
        it("no time-out redirect; move on to next state", function() {
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
        it("timed out; to state_timed_out", function() {
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
        it("choice made to 'Continue' after time out occured; go on to next state", function() {
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
        it("choice made to 'Restart' after time out occured; go to start state", function() {
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
        it("choice made to 'Exit' after time out occured; go to end state", function() {
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

    describe("Tests timeout_redirect function", function() {
        it("time-out redirect; from state_three to state_start)", function() {
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

    describe("Tests service_api_call (& check_fixtures_used) function", function() {
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

    describe("Tests log_service_api_call function", function() {
        it("logging of http GET request", function() {
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
        it("logging of http POST request", function() {
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

    describe("Tests is_valid_msisdn function", function() {
        it("should not validate if passed a number that doesn't start with '0'", function() {
            assert.equal(Utils.is_valid_msisdn("12345"), false);
        });
        it("should not validate if number starts with '0' but of incorrect length", function() {
            assert.equal(Utils.is_valid_msisdn("012345"), false);  // < 10
            assert.equal(Utils.is_valid_msisdn("01234567890123"), false);  // > 13
        });
        it("validate if number starts with '0' and of correct length", function() {
            assert(Utils.is_valid_msisdn("01234567890"));
            assert(Utils.is_valid_msisdn("0123456789012"));
        });
    });

    describe("Tests get_today function", function() {
        it("when date passed in, return the same as moment object", function() {
            assert.deepEqual(Utils.get_today(testing_config).format("YYYY-MM-DD"),
                moment("2016-05-23").format("YYYY-MM-DD"));
        });
        it("no date passed, return current moment object", function() {
            assert.deepEqual(Utils.get_today(live_config).format("YYYY-MM-DD"),
                new moment().format("YYYY-MM-DD"));
        });
    });

    describe("Tests get_january function", function() {
        it("get 1st jan moment date of current year", function() {
            assert.deepEqual(Utils.get_january(testing_config).format("YYYY-MM-DD"),
                moment("2016-01-01").format("YYYY-MM-DD"));
        });
    });

    describe("Tests make_month_choices function", function() {
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

    describe("IDENTITY-specfic util functions", function() {
        describe("Testing get_identity_by_address function", function() {
            it("returns corresponding identity to msisdn passed in", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return Utils
                            .get_identity_by_address({"msisdn": "08212345678"}, app.im)
                            .then(function(identity) {
                                assert.equal(identity.id, "cb245673-aa41-4302-ac47-00000000001");
                            });
                    })
                    .check(function(api) {
                        Utils.check_fixtures_used(api, [3]);
                    })
                    .run();
            });
        });
        describe("Testing get_identity function", function() {
            it("returns corresponding identity by identity id passed in", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return Utils
                            .get_identity("cb245673-aa41-4302-ac47-00000000001", app.im)
                            .then(function(identity) {
                                assert.equal(identity.id, "cb245673-aa41-4302-ac47-00000000001");
                                assert.equal(Object.keys(identity.details.addresses.msisdn)[0], "+8212345678");
                            });
                    })
                    .check(function(api) {
                        Utils.check_fixtures_used(api, [4]);
                    })
                    .run();
            });
        });
        describe("Testing create_identity function", function() {
            it("returns identity object; no communicate_through or operator_id provided", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return Utils
                            .create_identity(app.im, {"msisdn": "08212345678"}, null, null)
                            .then(function(identity) {
                                assert.equal(identity.id, "cb245673-aa41-4302-ac47-00000000001");
                            });
                    })
                    .check(function(api) {
                        Utils.check_fixtures_used(api, [5]);
                    })
                    .run();
            });
            it("returns identity object; operator_id provided", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return Utils
                            .create_identity(app.im, {"msisdn": "08212345678"}, null, "cb245673-aa41-4302-ac47-00000000002")
                            .then(function(identity) {
                                assert.equal(identity.id, "cb245673-aa41-4302-ac47-00000000001");
                            });
                    })
                    .check(function(api) {
                        Utils.check_fixtures_used(api, [6]);
                    })
                    .run();
            });
            it("returns identity object; communicate_through_id provided", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return Utils
                            .create_identity(app.im, {"msisdn": "08212345678"}, "cb245673-aa41-4302-ac47-00000000003", null)
                            .then(function(identity) {
                                assert.equal(identity.id, "cb245673-aa41-4302-ac47-00000000001");
                            });
                    })
                    .check(function(api) {
                        Utils.check_fixtures_used(api, [7]);
                    })
                    .run();
            });
            it("returns identity object; communicate_through and operator_id provided", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return Utils
                            .create_identity(app.im, {"msisdn": "08212345678"}, "cb245673-aa41-4302-ac47-00000000003", "cb245673-aa41-4302-ac47-00000000002")
                            .then(function(identity) {
                                assert.equal(identity.id, "cb245673-aa41-4302-ac47-00000000001");
                            });
                    })
                    .check(function(api) {
                        Utils.check_fixtures_used(api, [8]);
                    })
                    .run();
            });
        });
        describe("Testing get_or_create_identity function", function() {
            it("gets existing identity", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return Utils
                            .get_or_create_identity({"msisdn": "08212345678"}, app.im, null)
                            .then(function(identity) {
                                assert.equal(identity.id, "cb245673-aa41-4302-ac47-00000000001");
                            });
                    })
                    .check(function(api) {
                        Utils.check_fixtures_used(api, [3]);
                    })
                    .run();
            });
            it("creates new identity", function() {
                return tester
                    .setup.user.addr('08211111111')
                    .check(function(api) {
                        return Utils
                            .get_or_create_identity({"msisdn": "08211111111"}, app.im, null)
                            .then(function(identity) {
                                assert.equal(identity.id, "cb245673-aa41-4302-ac47-00011111111");
                            });
                    })
                    .check(function(api) {
                        Utils.check_fixtures_used(api, [9,10]);
                    })
                    .run();
            });
        });
        describe("Testing update_identity function", function() {
            it("return identity id on update of identity", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return Utils
                            .update_identity(app.im, {
                                "id": "cb245673-aa41-4302-ac47-00000000001",
                                "details": {
                                    "addresses": {
                                        "msisdn": {
                                            "08212345679": {}
                                        }
                                    }
                                }
                            })
                            .then(function(identity_id) {
                                assert.equal(identity_id, "cb245673-aa41-4302-ac47-00000000001");
                            });
                    })
                    .check(function(api) {
                        Utils.check_fixtures_used(api, [11]);
                    })
                    .run();
            });
        });
    });

    describe("SUBSCRIPTION-specfic util functions", function() {
        describe("Testing get_subscription function", function() {
            it("returns subscription object", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return Utils
                            .get_subscription(app.im, "51fcca25-2e85-4c44-subscription-1112")
                            .then(function(subscription) {
                                assert.equal(subscription.id, "51fcca25-2e85-4c44-subscription-1112");
                                assert.equal(subscription.identity, "cb245673-aa41-4302-ac47-00000000001");
                            });
                    })
                    .check(function(api) {
                        Utils.check_fixtures_used(api, [15]);
                    })
                    .run();
            });
        });
        describe("Testing get_active_subscriptions_by_identity function", function() {
            it("returns subscriptions for identity", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return Utils
                            .get_active_subscriptions_by_identity(app.im, "cb245673-aa41-4302-ac47-00000000001")
                            .then(function(subscriptions) {
                                assert.equal(subscriptions[0].id, "51fcca25-2e85-4c44-subscription-1111");
                                assert.equal(subscriptions[1].id, "51fcca25-2e85-4c44-subscription-1112");
                                assert.equal(subscriptions.length, "2");
                            });
                    })
                    .check(function(api) {
                        Utils.check_fixtures_used(api, [12]);
                    })
                    .run();
            });
        });
        describe("Testing get_active_subscription_by_identity function", function() {
            it("returns subscription for identity", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return Utils
                            .get_active_subscription_by_identity(app.im, "cb245673-aa41-4302-ac47-00000000001")
                            .then(function(subscription) {
                                assert.equal(subscription.id, "51fcca25-2e85-4c44-subscription-1111");
                            });
                    })
                    .check(function(api) {
                        Utils.check_fixtures_used(api, [12]);
                    })
                    .run();
            });
        });
        describe("Testing has_active_subscription function", function() {
            it("returns true for active subscription", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return Utils
                            .has_active_subscription("cb245673-aa41-4302-ac47-00000000001", app.im)
                            .then(function(subscription) {
                                assert(subscription);
                            });
                    })
                    .check(function(api) {
                        Utils.check_fixtures_used(api, [12]);
                    })
                    .run();
            });
            it("returns false for no active subscription", function() {
                return tester
                    .setup.user.addr('08287654321')
                    .check(function(api) {
                        return Utils
                            .has_active_subscription("cb245673-aa41-4302-ac47-00000000002", app.im)
                            .then(function(subscription) {
                                assert.ifError(subscription);
                            });
                    })
                    .check(function(api) {
                        Utils.check_fixtures_used(api, [13]);
                    })
                    .run();
            });
        });
        describe("Testing update_subscription function", function() {
            it("returns same subscription id as passed in", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return Utils
                            .update_subscription(app.im, {
                                'id': "51fcca25-2e85-4c44-subscription-1111",
                                'identity': 'cb245673-aa41-4302-ac47-00000000001',
                                'messageset': 1,
                                'next_sequence_number': 2,
                                'lang': "ibo_NG",
                                'active': true,
                                'completed': true
                            })
                            .then(function(subscription_id) {
                                assert.equal(subscription_id, "51fcca25-2e85-4c44-subscription-1111");
                            });
                    })
                    .check(function(api) {
                        Utils.check_fixtures_used(api, [14]);
                    })
                    .run();
            });
        });
    });

    describe("MESSAGESET-specfic util functions", function() {
        describe("Testing get_messageset function", function() {
            it("returns messageset object", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return Utils
                            .get_messageset(app.im, 2)
                            .then(function(messageset) {
                                assert.equal(messageset.id, 2);
                                assert.equal(messageset.next_set, 3);
                            });
                    })
                    .check(function(api) {
                        Utils.check_fixtures_used(api, [16]);
                    })
                    .run();
            });
        });
    });

    describe("MESSAGE-SENDER-specfic util functions", function() {
        describe("Testing save_inbound_message function", function() {
            it("returns inbound id", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return Utils
                            .save_inbound_message(app.im, "08212345678", "Testing... 1,2,3")
                            .then(function(inbound_id) {
                                assert.equal(inbound_id, "1");
                            });
                    })
                    .check(function(api) {
                        Utils.check_fixtures_used(api, [17]);
                    })
                    .run();
            });
        });
    });

    describe("OPTOUT-specfic util functions", function() {
        describe("Testing optout function", function() {
            it("returns perform optout", function() {
                return tester
                    .setup.user.addr('08212345678')
                    .check(function(api) {
                        return Utils
                            .optout(app.im,
                                "cb245673-aa41-4302-ac47-00000000001",
                                "miscarriage",
                                null,
                                "08212345678",
                                "seed-jsbox-utils",
                                app.im.config.testing_message_id
                            )
                            .then(function(response) {
                                assert.equal(response.code, "201");
                            });
                    })
                    .check(function(api) {
                        Utils.check_fixtures_used(api, [18]);
                    })
                    .run();
            });
        });
    });
});
