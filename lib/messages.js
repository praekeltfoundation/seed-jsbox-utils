var base_url = require("./conf").message_sender.prefix;

 // Saves the inbound messages to seed-message-sender
var save = function(inbound_msg_info) {
    var endpoint = 'inbound/';

    return http.post(base_url + endpoint, {data: inbound_msg_info})
        .then(function(json_post_response) {
            var inbound_response = json_post_response.data;
            // Return the inbound id
            return inbound_response.id;
        });
};

module.exports = {
    save: save
};
