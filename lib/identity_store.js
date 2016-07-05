function IdentityStore(http_api, auth_token, base_url) {
    this.http_api = http_api;
    this.auth_token = auth_token;
    this.base_url = base_url;
    this.http_api.defaults.headers = {
        'Authorization': ['Token ' + this.auth_token]
    };
}

IdentityStore.prototype = {
    /**:IdentityStore.get(id)
    Gets the identity from the Identity Store. Returns the identity object

    :param string id: identity uuid
    */
    get: function(id) {
        var endpoint = 'identities/'+id+'/';

        return this.http_api.get(this.base_url + endpoint, {params: {}})
            .then(function(response) {
                return response.data;
            });
    },

    /**:IdentityStore.search(address)
    Searches the Identity Store for all identities with the provided address.
    Returns the first identity object found

    :param object address: {address_type: address}
                eg. {'msisdn': '0821234444'}; {'email': 'me@example.com'}
    */
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

    /**:IdentityStore.create(address, options)
    Create a new identity. Returns the identity object

    :param object address: {address_type: address}
                eg. {'msisdn': '0821234444'}; {'email': 'me@example.com'}
    :param object options: data/payload for POST request
    */
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

    /**:IdentityStore.get_or_create(address, options)
    Gets a identity if it exists, otherwise creates a new one

    :param object address: {address_type: address}
                eg. {'msisdn': '0821234444'}; {'email': 'me@example.com'}
    :param object options: data/payload for POST request (create function)
    */
    get_or_create: function(address, options) {
        var that = this;  // necessary to circumvent subsequent binding loss

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

    /**:IdentityStore.update(id, identity)
    Update an identity by passing in the full updated identity object
    Removes potentially added fields that auto-complete and should not
    be submitted
    Returns the id (which should be the same as the identity's id)

    :param string id: identity uuid
    :param object identity:
      Gets passed through directly to service. Consult service docs/protocol.
      An example of properties in identity object:
            "id": identity uuid,
            "details": {
                "addresses": {
                    "msisdn": {
                        "08212345679": {}
                    }
                }
            }
    */
    update: function(id, identity) {
        var endpoint = 'identities/'+id+'/';

        return this.http_api.patch(this.base_url + endpoint, {data: identity})
            .then(function(response) {
                return response.data.id;
            });
    },

    /**:IdentityStore.optout(optout_info)
    Posts an optout to the identity store optout endpoint
    Parameter:

    :param object optout_info:
      Gets passed through directly to service. Consult service docs/protocol.
      An example of properties in optout_info object:
          "optout_type": string,
          "identity": identity uuid,
          "reason": string,
          "address_type": e.g. "msisdn",
          "address": e.g. "08212345678",
          "request_source": e.g. "seed-jsbox-utils",
          "requestor_source_id": uuid
    */
    optout: function(optout_info) {
        var endpoint = 'optout/';

        return this.http_api.post(this.base_url + endpoint, {data: optout_info})
            .then(function(response) {
                return response;
            });
    }
};

module.exports = IdentityStore;
