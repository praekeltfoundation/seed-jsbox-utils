function Hub(http_api, auth_token, base_url) {
    this.http_api = http_api;
    this.auth_token = auth_token;
    this.base_url = base_url;
    this.http_api.defaults.headers = {
        'Authorization': ['Token ' + this.auth_token]
    };
}

Hub.prototype = {
    /**:Hub.create_registration(reg_info)
    Creates a new registration

    :param object reg_info:
        e.g.
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
                rvoice_days: im.user.answers.state_voice_days;
                last_period_date: im.user.answers.working_date;
                baby_dob: im.user.answers.working_date;
            }
    */
    create_registration: function(reg_info) {
        var endpoint = 'registrations/';

        return this.http_api.post(this.base_url + endpoint, {data: reg_info})
            .then(function(result) {
                return result.data.id;
            });
    },

    /**:Hub.create_change(registration)
    ?? needs to either change a registration or do a create_or_change..??

    :param object registration
    */
    create_change: function(registration) {
        var endpoint = 'registrations/';

        return this.http_api.patch(this.base_url + endpoint, {data: registration})
            .then(function(result) {
                return result.data.id;
            });
    }
};

module.exports = Hub;
