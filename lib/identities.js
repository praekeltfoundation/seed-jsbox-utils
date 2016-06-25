var base_url = require("./conf").identities.prefix;

// Gets the identity from the Identity Store
// Returns the identity object
get = function(id) {
    var endpoint = 'identities/'+id+'/';

    return http.get(base_url+endpoint, {params: {}})
        .then(function(response) {
            return response.data;
        });
};

// get_identity_by_address equivalent  *** special endpoint..?!

// Searches the Identity Store for all identities with the provided address.
// Returns the first identity object found
// Address should be an object {address_type: address}; eg.
// {'msisdn': '0821234444'}; {'email': 'me@example.com'}
search = function(address) {
    var endpoint = 'identities/search/';

    var address_type = Object.keys(address)[0];
    var address_val = address[address_type];
    var params = {};
    var search_string = 'details__addresses__' + address_type;
    params[search_string] = address_val;

    return http.get(base_url+endpoint, {params: params})
        .then(function(response) {
            var identities_found = response.data.results;
            // Return the first identity in the list of identities
            return (identities_found.length > 0)
            ? identities_found[0]
            : null;
        });
};

// Create a new identity
// Returns the identity object
create = function(address, options) {
    var endpoint = 'identities/';

    var payload = {
        "details": {
            "default_addr_type": null,
            "addresses": {}
        }
    };
    // compile base payload
    if (address) {
        var address_type = Object.keys(address);
        var addresses = {};
        addresses[address_type] = {};
        addresses[address_type][address[address_type]] = {};
        payload.details = {
            "default_addr_type": "msisdn",
            "addresses": addresses
        };
    }

    if (options) {
        if (options.communicate_through_id) {
            payload.communicate_through = options.communicate_through_id;
        }

        // add operator_id if available
        if (options.operator_id) {
            payload.operator = options.operator_id;
        }
    }

    return http.post(base_url+endpoint, {data: payload})
        .then(function(response) {
            return response.data;
        });
};

// Gets a identity if it exists, otherwise creates a new one
get_or_create = function(address, options) {

    return search(address)
        .then(function(identity) {
            if (identity !== null) {
                // If identity exists, return the id
                return identity;
            } else {
                // If identity doesn't exist, create it
                return create(address, options)
                    .then(function(identity) {
                        return identity;
                    });
            }
        });
};

// Update an identity by passing in the full updated identity object
// Removes potentially added fields that auto-complete and should not
// be submitted
// Returns the id (which should be the same as the identity's id)
update = function(id, identity) {
    var endpoint = 'identities/'+id+'/';

    return http.patch(base_url+endpoint, {data: identity})
        .then(function(response) {
            return response.data.id;
        });
};

module.exports = {
    get: get,
    search: search,
    create: create,
    get_or_create: get_or_create,
    update: update
};
