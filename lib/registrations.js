var base_url = require("./conf").registrations.prefix;

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
