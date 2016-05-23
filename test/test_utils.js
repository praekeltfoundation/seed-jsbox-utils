var Utils = require("../lib");
var assert = require('assert');
var moment = require('moment');
var vumigo = require('vumigo_v02');
//var AppTester = vumigo.AppTester;
var App = vumigo.App;
App.call(App);
var $ = App.$;

describe("Testing Utils Functions", function() {

    var testing_config = {
        "testing_today": "2016-05-23"
    };

    var live_config = {};

    /*var app;
    var tester;
    var go = {};
    go;
    go.init = function() {
        var vumigo = require('vumigo_v02');
        var InteractionMachine = vumigo.InteractionMachine;
        var GoApp = go.app.GoApp;

        return {
            im: new InteractionMachine(api, new GoApp())
        };
    }();

    beforeEach(function() {
        app = new go.app.GoApp();
        tester = new AppTester(app);

        tester
            .setup.char_limit(182)
            .setup.config.app({
                name: 'seed-jsbox-utils-test',
                testing_today: '2015-04-03 06:07:08.999',
                no_timeout_redirects: [
                    'state_start',
                    'state_end_sms'
                ]
            })
            .setup(function(api) {
                fixtures().forEach(api.http.fixtures.add);
            })
            ;
    });*/

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
