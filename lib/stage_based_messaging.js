function StageBasedMessaging(http_api, auth_token, base_url) {
    this.http_api = http_api;
    this.auth_token = auth_token;
    this.base_url = base_url;
    this.http_api.defaults.headers = {
        'Authorization': ['Token ' + this.auth_token]
    };
}

StageBasedMessaging.prototype = {
    /**:StageBasedMessaging.get(id)
    Gets the subscription from the Stage-base Store
    Returns the subscription object

    :param string id: subscription uuid
    */
    get_subscription: function(id) {
        var endpoint = 'subscriptions/'+id+'/';

        return this.http_api.get(this.base_url + endpoint, {params: {}})
            .then(function(response) {
                return response.data;
            });
    },

    /**:StageBasedMessaging.get_active_subscription(id)
    Searches the Stage-base Store for all active subscriptions with the provided identity_id
    Returns the first subscription object found or null if none are found

    :param string id: subscription uuid
    */
    get_active_subscription: function(id) {
        return this.list_active_subscriptions(id)
            .then(function(subscriptions_found) {
                return (subscriptions_found.length > 0)
                    ? subscriptions_found[0]
                    : null;
            });
    },

    /**:StageBasedMessaging.list_active_subscriptions(id)
    Searches the Stage-base Store for all active subscriptions with the provided identity_id

    :param string id: subscription uuid
    */
    list_active_subscriptions: function(id) {
        var endpoint = 'subscriptions/';
        var params = {
            identity: id,
            active: true
        };

        return this.http_api.get(this.base_url + endpoint, {params: params})
            .then(function(response) {
                return response.data.results;
            });
    },

    /**:StageBasedMessaging.has_active_subscription(id)
    Returns whether an identity has an active subscription (true / false)

    :param string id: subscription uuid
    */
    has_active_subscription: function(id) {
        return this.list_active_subscriptions(id)
            .then(function(subscriptions) {
                return subscriptions.length > 0;
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
        return this.http_api.patch(this.base_url + endpoint, {data: subscription})
            .then(function(response) {
                return response.data.id;
            });
    },

    /**:StageBasedMessaging.get_messageset(id)
    Gets the messageset from the Stage-base Store
    Returns the messageset object

    :param string id: subscription uuid
    */
    get_messageset: function(id) {
        var endpoint = 'messageset/'+id+'/';

        return this.http_api.get(this.base_url + endpoint, {})
            .then(function(response) {
                return response.data;
            });
    }
};


module.exports = StageBasedMessaging;
