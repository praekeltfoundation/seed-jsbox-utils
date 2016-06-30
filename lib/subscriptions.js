var base_url = require("./conf").staged_based_messaging.prefix;

// Gets the subscription from the Stage-base Store
// Returns the subscription object
var get = function(id) {
    var endpoint = 'subscriptions/'+id+'/';

    return http.get(base_url + endpoint, {params: {}})
        .then(function(response) {
            return response.data;
        });
};

// Searches the Stage-base Store for all active subscriptions with the provided identity_id
// Returns the first subscription object found or null if none are found
var get_active = function(id) {
    return list_active(id)
        .then(function(subscriptions_found) {
            return (subscriptions_found.length > 0)
                ? subscriptions_found[0]
                : null;
        });
};

// Searches the Stage-base Store for all active subscriptions with the provided identity_id
// Returns the first subscription object found or null if none are found
var list_active = function(id) {
    var endpoint = 'subscriptions/';
    var params = {
        identity: id,
        active: true
    };

    return http.get(base_url + endpoint, {params: params})
        .then(function(response) {
            return response.data.results;
        });
};

// Returns whether an identity has an active subscription
// Returns true / false
var has_active = function(id) {
    return list_active(id)
        .then(function(subscriptions) {
            return subscriptions.length > 0;
        });
};

// Update a subscription by passing in the full updated subscription object
// Returns the id (which should be the same as the subscription's id)
var update = function(subscription) {
    var endpoint = 'subscriptions/' + subscription.id + '/';
    return http.patch(base_url + endpoint, {data: subscription})
        .then(function(response) {
            return response.data.id;
        });
};

// Gets the messageset from the Stage-base Store
// Returns the messageset object
var get_messageset = function(id) {
    var endpoint = 'messageset/'+id+'/';

    return http.get(base_url + endpoint, {})
        .then(function(response) {
            return response.data;
        });
};

module.exports = {
    get: get,
    get_active: get_active,
    list_active: list_active,
    has_active: has_active,
    update: update,
    get_messageset: get_messageset
};
