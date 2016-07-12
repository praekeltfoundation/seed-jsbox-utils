var Q = require('q');

function Hub(http_api, auth_token, base_url) {
    this.http_api = http_api;
    this.auth_token = auth_token;
    this.base_url = base_url;
    this.http_api.defaults.headers = {
        'Authorization': ['Token ' + this.auth_token]
        // if we're passing in the http_api, is this not going to override it?
        // add default content_type = application/json
    };
}

Hub.prototype = {
    /**:Hub.create_registration(reg_info)
    Creates a new registration

    :param object reg_info:
      Gets passed through directly to service. Consult service docs/protocol.
      Possible example object content:
            stage: im.user.answers.state_pregnancy_status,
            mother_id: im.user.answers.mother_id,
            data: {
                msg_receiver: im.user.answers.state_msg_receiver,
                receiver_id: im.user.answers.receiver_id,
                operator_id: im.user.answers.operator_id,
                gravida: im.user.answers.state_gravida,
                language: im.user.answers.state_msg_language,
                msg_type: im.user.answers.state_msg_type,
                user_id: im.user.answers.user_id;
                voice_times: im.user.answers.state_voice_times;
                voice_days: im.user.answers.state_voice_days;
                last_period_date: im.user.answers.working_date;
                baby_dob: im.user.answers.working_date;
            }
    */
    create_registration: function(reg_info) {
        var endpoint = 'registration/';
        var url = this.base_url + endpoint;

        return this.http_api.post(url, {data: reg_info})
            .then(this.log_service_call('POST', url, reg_info, null))
            .then(function(response) {
                return response.data;
            });
    },

    /**:Hub.update_registration(reg_update_data)
    Updates existing registration

    :param object reg_update_data:
      Gets passed through directly to service. Consult service docs/protocol.
    */
    update_registration: function(reg_update_data) {
        var endpoint = 'change/';
        var url = this.base_url + endpoint;

        return this.http_api.patch(url, {data: reg_update_data})
            .then(this.log_service_call('PATCH', url, reg_update_data, null))
            .then(function(response) {
                return response.data;
            });
    },

    /**:Hub.log_service_call(method, url, payload, params)
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

module.exports = Hub;
