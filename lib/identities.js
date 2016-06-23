var base_url = require("./conf").identities.prefix;

// get_identity equivalent
get = function(id) {
    var endpoint = 'identities/'+id+'/';

    return http.get(base_url+endpoint, {params: {}});
};

// get_identity_by_address equivalent  *** special endpoint..?!
search = function(address) {
    var endpoint = 'identities/search/';
    //requests.get.url += endpoint;

    // *** keep url in config

    return http.get(base_url+endpoint, {params: address});
};

// create_identity equivalent
create = function(data) {
    var endpoint = 'identities/';

    return http.post(base_url+endpoint, {data: data});
};

// get_or_create_identity equivalent
get_create = function(address, data) {
    return search(address)
        .then(function(identity) {
            if (identity !== null) {
                // If identity exists, return the id
                return identity;
            } else {
                // If identity doesn't exist, create it
                return create(data)
                    .then(function(identity) {
                        return identity;
                    });
            }
        });
};

// update_identity equivalent
update = function(id, data) {
    var endpoint = 'identities/'+id;

    return http.patch(base_url+endpoint, {
            data: data
        });
};

module.exports = {
    get: get,
    search: search,
    create: create,
    update: update
};
