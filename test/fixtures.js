module.exports = function() {
    return [

        // 0: get identity 08212345678 by msisdn - no results
        {
            'repeatable': true,
            'request': {
                'method': 'GET',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identity/08212345678/',
            },
            'response': {
                "code": 200,
                "data": {
                    "count": 0,
                    "next": null,
                    "previous": null,
                    "results": []
                }
            }
        },

        // 1: post identity 08212345678
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/",
                'data':  {
                    "msisdn": "08212345678"
                }
            },
            'response': {
                "code": 201,
                "data": {}
            }
        },

        // 2: patch identity 08212345678
        {
            'request': {
                'method': 'PATCH',
                'url': 'http://localhost:8001/api/v1/identity/08212345678/completed',
                'data': {
                    "completed": true
                }
            },
            'response': {
                "code": 200,
                "data": {
                    "msisdn": "08212345678",
                    "completed": true,
                    "created_at":"2016-05-23T06:13:29.693272Z",
                    "updated_at":"2016-05-23T06:13:29.693298Z"
                }
            }
        },

    ];
};
