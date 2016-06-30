var base_url = require("./conf").hub.prefix;

var create = function(reg_info) {
    var endpoint = 'registrations/';

    return http.post(base_url + endpoint, {data: reg_info})
        .then(function(result) {
            return result.data.id;
        });
};

module.exports = {
    create: create
};
