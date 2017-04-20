var Q = require('q');

function StageBasedMessaging(http_api, auth_token, base_url) {
    this.http_api = http_api;
    this.auth_token = auth_token;
    this.base_url = base_url;
    this.http_api.defaults.headers.Authorization = ['Token ' + this.auth_token];
}

StageBasedMessaging.prototype = {
    /**:StageBasedMessaging.get(id)
    Gets the subscription from the Stage-base Store
    Returns the subscription object

    :param string id: subscription uuid
    */
    get_subscription: function(id) {
        var endpoint = 'subscriptions/' + id + '/';
        var url = this.base_url + endpoint;

        return this.http_api.get(url, {params: {}})
            .then(this.log_service_call('GET', url, null, null))
            .then(function(response) {
                return response.data;
            });
    },

    /**:StageBasedMessaging.get_active_subscription(id)
    Searches the Stage-base Store for all active subscriptions with the provided identity_id
    Returns the first subscription object found or null if none are found

    :param string id: identity uuid
    */
    get_active_subscription: function(id) {
        return this.list_active_subscriptions(id)
            .then(function(subscriptions_found) {
                return (subscriptions_found.results.length > 0)
                    ? subscriptions_found.results[0]
                    : null;
            });
    },

    /**:StageBasedMessaging.list_active_subscriptions(id)
    Searches the Stage-base Store for all active subscriptions with the provided identity_id

    :param string id: identity uuid
    */
    list_active_subscriptions: function(id) {
        var endpoint = 'subscriptions/';
        var url = this.base_url + endpoint;
        var params = {
            identity: id,
            active: "True"
        };

        return this.http_api.get(url, {params: params})
            .then(this.log_service_call('GET', url, null, params))
            .then(function(response) {
                return response.data;
            });
    },

    /**:StageBasedMessaging.has_active_subscription(id)
    Returns whether an identity has an active subscription (true / false)

    :param string id: identity uuid
    */
    has_active_subscription: function(id) {
        return this.list_active_subscriptions(id)
            .then(function(subscriptions) {
                return subscriptions.results.length > 0;
            });
    },

    /**:StageBasedMessaging.update_subscription(subscription)
    Update a subscription by passing in the full updated subscription object
    Returns the id (which should be the same as the subscription's id)

    :param object subscription:
      Gets passed through directly to service. Consult service docs/protocol.
      Possible example object content:
                'id': "51fcca25-2e85-4c44-subscription-1111",
                'identity': 'cb245673-aa41-4302-ac47-00000000001',
                'messageset': 1,
                'next_sequence_number': 2,
                'lang': "ibo_NG",
                'active': true,
                'completed': true
    */
    update_subscription: function(subscription) {
        var endpoint = 'subscriptions/' + subscription.id + '/';
        var url = this.base_url + endpoint;

        return this.http_api.patch(url, {data: subscription})
            .then(this.log_service_call('PATCH', url, subscription, null))
            .then(function(response) {
                return response.data;
            });
    },

    /**:StageBasedMessaging.get_messageset(id)
    Gets the messageset from the Stage-base Store
    Returns the messageset object

    :param string id: subscription uuid
    */
    get_messageset: function(id) {
        var endpoint = 'messageset/' + id + '/';
        var url = this.base_url + endpoint;

        return this.http_api.get(url, {})
            .then(this.log_service_call('GET', url))
            .then(function(response) {
                return response.data;
            });
    },

    /**:StageBasedMessaging.list_messagesets()
    List all the available messagesets
    */
    list_messagesets: function(id) {
        var endpoint = 'messageset/';
        var url = this.base_url + endpoint;

        return this.http_api.get(url, {})
            .then(this.log_service_call('GET', url))
            .then(function(response) {
                return response.data;
            });
    },

    /**:StageBasedMessaging.check_identity_subscribed(id, short_name)
    Determines if the identity has an active subscription to a messageset
    with the short_name provided. The short_name can be the full messageset
    short_name or just a part of it.

    :param string id: identity uuid
    :param string short_name: messageset short_name
    */
    check_identity_subscribed: function(id, short_name) {
        var self = this;  // necessary to circumvent subsequent binding loss

        return this
        .list_active_subscriptions(id)
        .then(function(active_subs_response) {
            var active_subs = active_subs_response.results;
            if (active_subs_response.count === 0) {
                // immediately return false if user has no active subscriptions
                return false;
            } else {
                // otherwise get all the messagesets
                return self
                .list_messagesets()
                .then(function(messagesets_response) {
                    var messagesets = messagesets_response.results;

                    // create a mapping of messageset ids to shortnames
                    var short_name_map = {};
                    for (var k=0; k < messagesets.length; k++) {
                        short_name_map[messagesets[k].id] = messagesets[k].short_name;
                    }

                    // see if the active subscriptions shortnames contain the searched text
                    for (var i=0; i < active_subs.length; i++) {
                        var active_sub_shortname = short_name_map[active_subs[i].messageset];
                        if (active_sub_shortname.indexOf(short_name) > -1) {
                            return true;
                        }
                    }
                    return false;
                });
            }
        });
    },

    /**:StageBasedMessaging.log_service_call(method, url, payload, params)
    Logs the details of HTTP requests made.

    :param string method: the HTTP request method e.g. 'GET', 'POST', etc
    :param string url: the url the request is send to
    :param object payload: the request payload if applicable
    :param object params: the request params if applicable
    */
    log_service_call: function(method, url, payload, params) {
        var self = this;
        var log_mode = self.http_api.im.config.logging || null;

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
            } else if (log_mode === 'off' || log_mode === null) {
                return Q()
                    .then(function() {
                        return response;
                    });
            }
        };
    }
};


module.exports = StageBasedMessaging;
