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

        return this.http_api.post(this.base_url + endpoint, {data: inbound_msg_info})
            .then(function(json_post_response) {
                var inbound_response = json_post_response.data;
                // Return the inbound id
                return inbound_response.id;
            });
    }
};

module.exports = MessageSender;
