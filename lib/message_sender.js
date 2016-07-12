var Q = require('q');

function MessageSender(http_api, auth_token, base_url) {
    this.http_api = http_api;
    this.auth_token = auth_token;
    this.base_url = base_url;
    this.http_api.defaults.headers = {
        'Authorization': ['Token ' + this.auth_token]
    };
}

MessageSender.prototype = {

    /**:MessageSender.save_inbound_message(inbound_msg_info)
    Saves the inbound messages to seed-message-sender

    :param object inbound_msg_info:
      Gets passed through directly to service. Consult service docs/protocol.
      Possible example object content:
                {
                    "message_id": app.im.config.testing_message_id,
                    "in_reply_to": null,
                    "to_addr": app.im.config.channel,
                    "from_addr": "08212345678",
                    "content": "Testing... 1,2,3",
                    "transport_name": app.im.config.transport_name,
                    "transport_type": app.im.config.transport_type,
                    "helper_metadata": {}
                }
    */
    save_inbound_message: function(inbound_msg_info) {
        var endpoint = 'inbound/';
        var url = this.base_url + endpoint;

        return this.http_api.post(url, {data: inbound_msg_info})
            .then(this.log_service_call('POST', url, inbound_msg_info, null))
            .then(function(response) {
                return response.data;
            });
    },

    /**:MessageSender.log_service_call(method, url, payload, params)
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

module.exports = MessageSender;
