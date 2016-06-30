function IdentityStore(http_api, auth_token, base_url) {
    this.http_api = http_api;
    this.auth_token = auth_token;
    this.base_url = base_url;
    this.http_api.defaults.headers = {
        'Authorization': ['Token ' + this.auth_token]
    };
}

IdentityStore.prototype = {
    // Gets the identity from the Identity Store
    // Returns the identity object
    get: function(id) {
        var endpoint = 'identities/'+id+'/';
        // console.log("headers: "+this.http_api.defaults.headers.Authorization);
        // console.log("headers2: "+http.defaults.headers.Authorization);
        return this.http_api.get(this.base_url + endpoint, {params: {}})
            .then(function(response) {
                return response.data;
            });
    },

    // Searches the Identity Store for all identities with the provided address.
    // Returns the first identity object found
    // Address should be an object {address_type: address}; eg.
    // {'msisdn': '0821234444'}; {'email': 'me@example.com'}
    search: function(address) {
        var endpoint = 'identities/search/';

        var address_type = Object.keys(address)[0];
        var address_val = address[address_type];
        var params = {};
        var search_string = 'details__addresses__' + address_type;
        params[search_string] = address_val;

        return this.http_api.get(this.base_url + endpoint, {params: params})
            .then(function(response) {
                var identities_found = response.data.results;
                // Return the first identity in the list of identities
                return (identities_found.length > 0)
                ? identities_found[0]
                : null;
            });
    },

    // Create a new identity
    // Returns the identity object
    create: function(address, options) {
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
                "default_addr_type": address_type[0],
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

        return this.http_api.post(this.base_url + endpoint, {data: payload})
            .then(function(response) {
                return response.data;
            });
    },

    // Gets a identity if it exists, otherwise creates a new one
    get_or_create: function(address, options) {
        var that = this;

        return this.search(address)
            .then(function(identity) {
                if (identity !== null) {
                    // If identity exists, return the id
                    return identity;
                } else {
                    // If identity doesn't exist, create it
                    return that.create(address, options)
                        .then(function(identity) {
                            return identity;
                        });
                }
            });
    },

    // Update an identity by passing in the full updated identity object
    // Removes potentially added fields that auto-complete and should not
    // be submitted
    // Returns the id (which should be the same as the identity's id)
    update: function(id, identity) {
        var endpoint = 'identities/'+id+'/';

        return this.http_api.patch(this.base_url + endpoint, {data: identity})
            .then(function(response) {
                return response.data.id;
            });
    },

    // Posts an optout to the identity store optout endpoint
    optout: function(optout_info) {
        var endpoint = 'optout/';

        return this.http_api.post(this.base_url + endpoint, {data: optout_info})
            .then(function(response) {
                return response;
            });
    }
};

module.exports = IdentityStore;