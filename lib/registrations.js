var base_url = require("./conf").hub.prefix;

var create_registration = function(reg_info) {
    var endpoint = 'registrations/';

    return http.post(base_url + endpoint, {data: reg_info})
        .then(function(result) {
            return result.data.id;
        });
};

var create_change = function(reg_info) {
    var endpoint = 'registrations/';

    return http.patch(base_url + endpoint, {data: reg_info})
        .then(function(result) {
            return result.data.id;
        });
};

module.exports = {
    create_registration: create_registration,
    create_change: create_change
};
