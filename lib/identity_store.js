var Q = require('q');

function IdentityStore(http_api, auth_token, base_url) {
    this.http_api = http_api;
    this.auth_token = auth_token;
    this.base_url = base_url;
    this.http_api.defaults.headers.Authorization = ['Token ' + this.auth_token];
}

IdentityStore.prototype = {
    /**:IdentityStore.get(id)
    Gets the identity from the Identity Store. Returns the identity object

    :param string id: identity uuid
    */
    get_identity: function(id) {
        var endpoint = 'identities/' + id + '/';
        var url = this.base_url + endpoint;

        return this.http_api.get(url, {params: {}})
            .then(this.log_service_call('GET', url, null, null))
            .then(function(response) {
                return response.data;
            });
    },

    /**:IdentityStore.search(address)
    Searches the Identity Store for all identities with the provided address.
    Returns the identity object(s) found

    :param object address: {address_type: address}
                eg. {'msisdn': '0821234444'}; {'email': 'me@example.com'}
    */
    list_by_address: function(address) {
        var endpoint = 'identities/search/';
        var url = this.base_url + endpoint;

        var address_type = Object.keys(address)[0];
        var address_val = address[address_type];
        var params = {};
        var search_string = 'details__addresses__' + address_type;
        params[search_string] = address_val;

        return this.http_api.get(url, {params: params})
            .then(this.log_service_call('GET', url, null, params))
            .then(function(response) {
                return response.data;
            });
    },

    /**:IdentityStore.create(address, options)
    Create a new identity. Returns the identity object

    :param object address: {address_type: address}
                eg. {'msisdn': '0821234444'}; {'email': 'me@example.com'}
    :param object options: data/payload for POST request
    */
    create_identity: function(address, options) {
        var endpoint = 'identities/';
        var url = this.base_url + endpoint;

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

        return this.http_api.post(url, {data: payload})
            .then(this.log_service_call('POST', url, payload, null))
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
    get_or_create_identity: function(address, options) {
        var self = this;  // necessary to circumvent subsequent binding loss

        return this.list_by_address(address)
            .then(function(identities_found) {
                // get the first identity in the list of identities
                var identity = (identities_found.results.length > 0)
                    ? identities_found.results[0]
                    : null;

                if (identity !== null) {
                    // If identity exists, return the id
                    return identity;
                } else {
                    // If identity doesn't exist, create it
                    return self.create_identity(address, options)
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
    update_identity: function(id, identity) {
        var endpoint = 'identities/' + id + '/';
        var url = this.base_url + endpoint;

        return this.http_api.patch(url, {data: identity})
            .then(this.log_service_call('PATCH', url, identity, null))
            .then(function(response) {
                return response.data;
            });
    },

    /**:IdentityStore.optout(optout_info)
    Posts an optout to the identity store optout endpoint

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
        var url = this.base_url + endpoint;

        return this.http_api.post(url, {data: optout_info})
            .then(this.log_service_call('POST', url, optout_info, null))
            .then(function(response) {
                return response.data;
            });
    },

    /**:IdentityStore.optin(identity)
    Posts an optin to the identity store optout endpoint

    :param string identity: identity uuid
    :param string address_type: type of address, e.g. "msisdn", "email", etc.
    :param string address: e.g. "27845000000", "abc@gmail.com", etc.
    */
    optin: function(identity, address_type, address) {
        var endpoint = 'optin/';
        var url = this.base_url + endpoint;

        var payload = {
            "identity": identity,
            "address_type": address_type,
            "address": address
        };

        return this.http_api.post(url, {data: payload})
            .then(this.log_service_call('POST', url, payload, null))
            .then(function(response) {
                return response.data;
            });
    },

    /**:IdentityStore.log_service_call(method, url, payload, params)
    Logs the details of HTTP requests made.

    :param string method: the HTTP request method e.g. 'GET', 'POST', etc
    :param string url: the url the request is send to
    :param object payload: the request payload if applicable
    :param object params: the request params if applicable
    */
    log_service_call: function(method, url, payload, params) {
        var self = this;
        var log_mode = self.http_api.im.config.logging;

        return function(response) {
            if (log_mode === 'prod') {
                return self.http_api.im.log([
                        'Request: ' + method + ' ' + url,
                        'Payload: ' + JSON.stringify(payload),
                        'Params: ' + JSON.stringify(params),
                        'Response: ' + JSON.stringify(response),
                    ].join('\n'))
                    .then(function() {
                        return response;
                    });
            } else if (log_mode === 'test') {
                return Q()
                    .then(function() {
                        console.log([
                            'Request: ' + method + ' ' + url,
                            'Payload: ' + JSON.stringify(payload),
                            'Params: ' + JSON.stringify(params),
                            'Response: ' + JSON.stringify(response),
                        ].join('\n'));
                        return response;
                    });
            } else if (log_mode === 'off' || null) {
                return Q()
                    .then(function() {
                        return response;
                    });
            }
        };
    }
};

module.exports = IdentityStore;
