var Q = require('q');
var utils = require('./utils');

function ServiceRating(http_api, auth_token, base_url) {
    this.http_api = http_api;
    this.auth_token = auth_token;
    this.base_url = base_url;
    this.http_api.defaults.headers.Authorization = ['Token ' + this.auth_token];
}

ServiceRating.prototype = {

    /**:ServiceRating.list_serviceratings(params)
    Retrieves service ratings

    :param object params: object containing parameters
      Gets passed through directly to service. Consult service docs/protocol.
      e.g. {
              "identity": identity,
              "completed": "False",
              "expired": "False"
            }
    */
    list_serviceratings: function(params) {
        var endpoint = 'invite/';
        var url = this.base_url + endpoint;

        return utils.get_paginated_response(this, url, params);
    },

    /**:ServiceRating.create_servicerating_feedback(
        identity, q_id, q_text, answer_text, answer_value, version_number, invite_uuid
    )
    Saves servicerating info

    :param object identity: identity uuid
    :param string q_id: question id
    :param string answer_text: answer text
    :param string answer_value: answer value
    :param string version_number: version number
    :param string invite_uuid: invite uuid

    Params gets passed through directly to service. Consult service docs/protocol.
    */
    create_servicerating_feedback: function(identity, q_id, q_text, answer_text, answer_value, version_number, invite_uuid) {
        var endpoint = 'rating/';
        var url = this.base_url + endpoint;

        var payload = {
            "identity": identity,
            "invite": invite_uuid,
            "version": version_number,
            "question_id": q_id,
            "question_text": q_text,
            "answer_text": answer_text,
            "answer_value": answer_value
        };

        return this.http_api.post(url, {data: payload})
            .then(this.log_service_call('POST', url, payload, null))
            .then(function(response) {
                return response.data;
            });
    },

    /**:ServiceRating.update_servicerating_status_completed(identity)
    Sets service rating 'completed' to true

    :param object invite: invite uuid
      gets passed through directly to service. Consult service docs/protocol.
    */
    update_servicerating_status_completed: function(invite) {
        var endpoint = "invite/" + invite + "/";
        var url = this.base_url + endpoint;

        var payload = {
            "completed": "True"
        };

        return this.http_api.patch(url, {data: payload})
            .then(this.log_service_call('PATCH', url, payload, null))
            .then(function(response) {
                return response.data;
            });
    },

    /**:ServiceRating.log_service_call(method, url, payload, params)
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

module.exports = ServiceRating;
