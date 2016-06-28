var base_url = require("./conf").subscriptions.prefix;

// Gets the subscription from the Stage-base Store
// Returns the subscription object
get = function(id) {
    var endpoint = 'subscriptions/'+id+'/';

    return http.get(base_url+endpoint, {params: {}})
        .then(function(response) {
            return response.data;
        });
};

// Searches the Stage-base Store for all active subscriptions with the provided identity_id
// Returns the first subscription object found or null if none are found
get_active = function(id) {
    return list_active(id)
        .then(function(subscriptions_found) {
            return (subscriptions_found.length > 0)
                ? subscriptions_found[0]
                : null;
        });
};

// Searches the Stage-base Store for all active subscriptions with the provided identity_id
// Returns the first subscription object found or null if none are found
list_active = function(id) {
    var endpoint = 'subscriptions/';
    var params = {
        identity: id,
        active: true
    };

    return http.get(base_url+endpoint, {params: params})
        .then(function(response) {
            return response.data.results;
        });
};

// Returns whether an identity has an active subscription
// Returns true / false
has_active = function(id) {
    return list_active(id)
        .then(function(subscriptions) {
            return subscriptions.length > 0;
        });
};

// Update a subscription by passing in the full updated subscription object
// Returns the id (which should be the same as the subscription's id)
update = function(subscription) {
    var endpoint = 'subscriptions/' + subscription.id + '/';
    return http.patch(base_url+endpoint, {data: subscription})
        .then(function(response) {
            return response.data.id;
        });
};

module.exports = {
    get: get,
    get_active: get_active,
    list_active: list_active,
    has_active: has_active,
    update: update
};
