module.exports = function() {
    return [

        // 0: update identity 08212345678
        {
            'request': {
                'method': 'PATCH',
                'url': 'http://is.localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000001/',
                'data': {
                    "id": "cb245673-aa41-4302-ac47-00000000001",
                    "details": {
                        "addresses": {
                            "msisdn": { "08212345679":{}}
                        },
                        "completed":true
                    }
                }
            },
            'response': {
                "code": 200,
                "data": {
                    "id": "cb245673-aa41-4302-ac47-00000000001",
                    "details": {
                        "addresses": {
                            "msisdn": { "08212345679":{}}
                        },
                        "completed":true
                    }
                }
            }
        },

        // 1: get identity 08212345678 by msisdn
        {
            'repeatable': true,
            'request': {
                'method': 'GET',
                'params': {
                    'details__addresses__msisdn': '08212345678'
                },
                'headers': {
                    'Authorization': ['Token test IdentityStore'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://is.localhost:8001/api/v1/identities/search/',
            },
            'response': {
                "code": 200,
                "data": {
                    "count": 1,
                    "next": null,
                    "previous": null,
                    "results": [{
                        "url": "http://is.localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000001/",
                        "id": "cb245673-aa41-4302-ac47-00000000001",
                        "version": 1,
                        "details": {
                            "default_addr_type": "msisdn",
                            "addresses": {
                                "msisdn": {
                                    "08212345678": {}
                                }
                            }
                        },
                        "created_at": "2016-06-21T06:13:29.693272Z",
                        "updated_at": "2016-06-21T06:13:29.693298Z"
                    }]
                }
            }
        },

        // 2: get identity cb245673-aa41-4302-ac47-00000000001
        {
            'repeatable': true,
            'request': {
                'method': 'GET',
                'params': {},
                'headers': {
                    'Authorization': ['Token test IdentityStore'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://is.localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000001/',
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://is.localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000001/",
                    "id": "cb245673-aa41-4302-ac47-00000000001",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+8212345678": {}
                            }
                        }
                    },
                    "created_at": "2016-06-21T06:13:29.693272Z",
                    "updated_at": "2016-06-21T06:13:29.693298Z"
                }
            }
        },

        // 3: create identity 08212345678
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test IdentityStore'],
                    'Content-Type': ['application/json']
                },
                'url': "http://is.localhost:8001/api/v1/identities/",
                'data':  {
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "08212345678": { "default": true }
                            }
                        }
                    }
                }
            },
            'response': {
                "code": 201,
                "data": {
                    "url": "http://is.localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000001/",
                    "id": "cb245673-aa41-4302-ac47-00000000001",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "08212345678": { "default": true }
                            }
                        }
                    },
                    "created_at": "2016-06-21T06:13:29.693272Z",
                    "updated_at": "2016-06-21T06:13:29.693298Z"
                }
            }
        },

        // 4: create identity 08212345678; operater_id provided
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test IdentityStore'],
                    'Content-Type': ['application/json']
                },
                'url': "http://is.localhost:8001/api/v1/identities/",
                'data':  {
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "08212345678": { "default": true }
                            }
                        }
                    },
                    "operator": "cb245673-aa41-4302-ac47-00000000002"
                }
            },
            'response': {
                "code": 201,
                "data": {
                    "url": "http://is.localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000001/",
                    "id": "cb245673-aa41-4302-ac47-00000000001",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "08212345678": { "default": true }
                            }
                        },
                    },
                    "operator": "cb245673-aa41-4302-ac47-00000000002",
                    "created_at": "2016-06-21T06:13:29.693272Z",
                    "updated_at": "2016-06-21T06:13:29.693298Z"
                }
            }
        },

        // 5: create identity 08212345678; communicate_through provided
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test IdentityStore'],
                    'Content-Type': ['application/json']
                },
                'url': "http://is.localhost:8001/api/v1/identities/",
                'data':  {
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "08212345678": { "default": true }
                            }
                        }
                    },
                    "communicate_through": "cb245673-aa41-4302-ac47-00000000003"
                }
            },
            'response': {
                "code": 201,
                "data": {
                    "url": "http://is.localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000001/",
                    "id": "cb245673-aa41-4302-ac47-00000000001",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "08212345678": { "default": true }
                            }
                        }
                    },
                    "communicate_through": "cb245673-aa41-4302-ac47-00000000003",
                    "created_at": "2016-06-21T06:13:29.693272Z",
                    "updated_at": "2016-06-21T06:13:29.693298Z"
                }
            }
        },

        // 6: create identity 08212345678; communicate_through & operator_id provided
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test IdentityStore'],
                    'Content-Type': ['application/json']
                },
                'url': "http://is.localhost:8001/api/v1/identities/",
                'data': {
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "08212345678": { "default": true }
                            }
                        }
                    },
                    "communicate_through":"cb245673-aa41-4302-ac47-00000000003",
                    "operator":"cb245673-aa41-4302-ac47-00000000002"
                },
            },
            'response': {
                "code": 201,
                "data": {
                    "url": "http://is.localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000001/",
                    "id": "cb245673-aa41-4302-ac47-00000000001",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "08212345678": { "default": true }
                            }
                        }
                    },
                    "communicate_through":"cb245673-aa41-4302-ac47-00000000003",
                    "operator":"cb245673-aa41-4302-ac47-00000000002"
                }
            }
        },

        // 7: get identity 08211111111 by msisdn
        {
            'repeatable': true,
            'request': {
                'method': 'GET',
                'params': {
                    'details__addresses__msisdn': '08211111111'
                },
                'headers': {
                    'Authorization': ['Token test IdentityStore'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://is.localhost:8001/api/v1/identities/search/',
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

        // 8: create identity 08211111111
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test IdentityStore'],
                    'Content-Type': ['application/json']
                },
                'url': "http://is.localhost:8001/api/v1/identities/",
                'data':  {
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "08211111111": { "default": true }
                            }
                        }
                    }
                }
            },
            'response': {
                "code": 201,
                "data": {
                    "url": "http://is.localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00011111111/",
                    "id": "cb245673-aa41-4302-ac47-00011111111",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "08211111111": { "default": true }
                            }
                        }
                    },
                    "created_at": "2016-06-21T06:13:29.693272Z",
                    "updated_at": "2016-06-21T06:13:29.693298Z"
                }
            }
        },

        // 9: update identity cb245673-aa41-4302-ac47-00000000001
        {
            'request': {
                'method': 'PATCH',
                'params': {},
                'headers': {
                    'Authorization': ['Token test IdentityStore'],
                    'Content-Type': ['application/json']
                },
                'url': "http://is.localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000001/",
                'data':  {
                    "id": "cb245673-aa41-4302-ac47-00000000001",
                    "details": {
                        "addresses": {
                            "msisdn": {
                                "08212345679": {}
                            }
                        }
                    }
                }
            },
            'response': {
                "code": 200,
                "data": {
                    "id": "cb245673-aa41-4302-ac47-00000000001",
                    "details": {
                        "addresses": {
                            "msisdn": {
                                "08212345679": {}
                            }
                        }
                    },
                    "created_at": "2016-06-21T06:13:29.693272Z",
                    "updated_at": "2015-06-21T06:13:29.693298Z"
                }
            }
        },

        // 10: get subscription for identity cb245673-aa41-4302-ac47-00000000001
        {
            'repeatable' : true,
            'request': {
                'method': 'GET',
                'params': {
                    'identity': 'cb245673-aa41-4302-ac47-00000000001',
                    'active': 'true'
                },
                'headers': {
                    'Authorization': ['Token test Staged-based Messaging'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://sbm.localhost:8003/api/v1/subscriptions/'
            },
            'response': {
                "code": 200,
                "data": {
                    "count": 2,
                    "next": null,
                    "previous": null,
                    "results": [
                        {
                            'url': 'http://sbm.localhost:8003/api/v1/subscriptions/51fcca25-2e85-4c44-subscription-1111',
                            'id': '51fcca25-2e85-4c44-subscription-1111',
                            'version': 1,
                            'identity': 'cb245673-aa41-4302-ac47-00000000001',
                            'messageset': 1,
                            'next_sequence_number': 1,
                            'lang': "ibo_NG",
                            'active': true,
                            'completed': false,
                            'schedule': 1,
                            'process_status': 0,
                            'metadata': {},
                            'created_at': "2015-07-10T06:13:29.693272Z",
                            'updated_at': "2015-07-10T06:13:29.693272Z"
                        },
                        {
                            'url': 'http://sbm.localhost:8003/api/v1/subscriptions/51fcca25-2e85-4c44-subscription-1112',
                            'id': '51fcca25-2e85-4c44-subscription-1112',
                            'version': 1,
                            'identity': 'cb245673-aa41-4302-ac47-00000000001',
                            'messageset': 1,
                            'next_sequence_number': 1,
                            'lang': "ibo_NG",
                            'active': true,
                            'completed': false,
                            'schedule': 1,
                            'process_status': 0,
                            'metadata': {},
                            'created_at': "2015-07-10T06:13:29.693272Z",
                            'updated_at': "2015-07-10T06:13:29.693272Z"
                        }
                    ]

                }
            }
        },

        // 11: get subscription for identity cb245673-aa41-4302-ac47-00000000002
        {
            'request': {
                'method': 'GET',
                'params': {
                    'identity': 'cb245673-aa41-4302-ac47-00000000002',
                    'active': 'true'
                },
                'headers': {
                    'Authorization': ['Token test Staged-based Messaging'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://sbm.localhost:8003/api/v1/subscriptions/'
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

        // 12: update subscription 51fcca25-2e85-4c44-subscription-1111 (completed = true)
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test Staged-based Messaging'],
                    'Content-Type': ['application/json']
                },
                'url': "http://sbm.localhost:8003/api/v1/subscriptions/51fcca25-2e85-4c44-subscription-1111/",
                "data": {
                    "id": "51fcca25-2e85-4c44-subscription-1111",
                    "identity": "cb245673-aa41-4302-ac47-00000000001",
                    "messageset": 1,
                    "next_sequence_number": 2,
                    "lang": "ibo_NG",
                    "active": true,
                    "completed": true
                }
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://sbm.localhost:8003/api/v1/subscriptions/51fcca25-2e85-4c44-subscription-1111/",
                    "id": "51fcca25-2e85-4c44-subscription-1111",
                    "version": 1,
                    "identity": "cb245673-aa41-4302-ac47-00000000001",
                    "messageset": 1,
                    "next_sequence_number": 2,
                    "lang": "ibo_NG",
                    "active": true,
                    "completed": true,
                    "schedule": 3,
                    "process_status": 0,
                    "metadata":{
                        "msg_type": "audio"
                    },
                    "created_at": "2016-06-21T15:19:01.734812Z",
                    "updated_at": "2016-06-22T07:00:00.826924Z"
                }
            }
        },

        // 13: get subscription for identity cb245673-aa41-4302-ac47-00000000002
        {
            'request': {
                'method': 'GET',
                'headers': {
                    'Authorization': ['Token test Staged-based Messaging'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://sbm.localhost:8003/api/v1/subscriptions/51fcca25-2e85-4c44-subscription-1112/'
            },
            'response': {
                "code": 200,
                "data": {
                    'url': 'http://sbm.localhost:8003/api/v1/subscriptions/51fcca25-2e85-4c44-subscription-1112/',
                    'id': '51fcca25-2e85-4c44-subscription-1112',
                    'version': 1,
                    'identity': 'cb245673-aa41-4302-ac47-00000000001',
                    'messageset': 1,
                    'next_sequence_number': 1,
                    'lang': "ibo_NG",
                    'active': true,
                    'completed': false,
                    'schedule': 1,
                    'process_status': 0,
                    'metadata': {},
                    'created_at': "2016-06-21T06:13:29.693272Z",
                    'updated_at': "2016-06-22T06:13:29.693272Z"
                }
            }
        },

        // 14: get messageset 2
        {
            'request': {
                'method': 'GET',
                'params': {},
                'headers': {
                    'Authorization': ['Token test Staged-based Messaging'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://sbm.localhost:8003/api/v1/messageset/2/'
            },
            'response': {
                'code': 200,
                'data': {
                    'id': 2,
                    'short_name': 'postbirth_mother_text_0_12',
                    'notes': null,
                    'next_set': 3,
                    'default_schedule': 1,
                    'content_type': 'text',
                    'created_at': "2016-06-22T06:13:29.693272Z",
                    'updated_at': "2016-06-22T06:13:29.693272Z"
                }
            }
        },

        // 15: create inbound message
        {
            'request': {
                'method': 'POST',
                'params': {},
                'headers': {
                    'Authorization': ['Token test Message-sender'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://ms.localhost:8004/api/v1/inbound/',
                'data': {
                    "message_id": "0170b7bb-978e-4b8a-35d2-662af5b6daee",
                    "content": "Testing... 1,2,3",
                    "in_reply_to": null,
                    "to_addr": "2341234",
                    "from_addr": "08212345678",
                    "transport_name": "aggregator_sms",
                    "transport_type": "sms",
                    "helper_metadata": {}
                }
            },
            'response': {
                "code": 201,
                "data": {
                    "id": 1
                }
            }
        },

        // 16: Optout - miscarriage
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test IdentityStore'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://is.localhost:8001/api/v1/optout/',
                'data': {
                    "optout_type": "stop",
                    "identity": "cb245673-aa41-4302-ac47-00000000001",
                    "reason": "miscarriage",
                    "address_type": "msisdn",
                    "address": "08212345678",
                    "request_source": "seed-jsbox-utils",
                    "requestor_source_id": "0170b7bb-978e-4b8a-35d2-662af5b6daee"
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 1
                }
            }
        },

        // 17: create registration cb245673-aa41-4302-ac47-00000000002 - friend_only / family_member - sms
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test Hub'],
                    'Content-Type': ['application/json']
                },
                'url': "http://hub.localhost:8002/api/v1/registration/",
                'data':  {
                    "stage": "prebirth",
                    "mother_id": "cb245673-aa41-4302-ac47-1234567890",
                    "data": {
                        "msg_receiver": "friend_only",
                        "receiver_id": "cb245673-aa41-4302-ac47-00000000002",
                        "operator_id": "cb245673-aa41-4302-ac47-00000000007",
                        "gravida": "3",
                        "language": "ibo_NG",
                        "msg_type": "text"
                    }
                }
            },
            'response': {
                "code": 201,
                "data": {
                    "id": "reg_for_00000000002_uuid",
                    "stage": "prebirth",
                    "mother_id": "cb245673-aa41-4302-ac47-1234567890",
                    "data": {
                        "msg_receiver": "friend_only",
                        "receiver_id": "cb245673-aa41-4302-ac47-00000000002",
                        "operator_id": "cb245673-aa41-4302-ac47-00000000007",
                        "language": "ibo_NG",
                        "msg_type": "text"
                    },
                    "validated": false,
                    "source": "source",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2016-06-22T06:13:29.693298Z",
                    "created_by": "user",
                    "updated_by": "user"
                }
            }
        },

        // 18: update registration cb245673-aa41-4302-ac47-00000000002
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test Hub'],
                    'Content-Type': ['application/json']
                },
                'url': "http://hub.localhost:8002/api/v1/change/",
                'data': {
                    "mother_id": "cb245673-aa41-4302-ac47-1234567890",
                    "action": "change_stage"
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 1
                }
            }
        },

        // 19: Optin SUCCESS - cb245673-aa41-4302-ac47-00000000001
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test IdentityStore'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://is.localhost:8001/api/v1/optin/',
                'data': {
                    "identity": "cb245673-aa41-4302-ac47-00000000001",
                    "address_type": "msisdn",
                    "address": "08212345678"
                }
            },
            'response': {
                'code': 201,
                'data': {
                    "accepted": true
                }
            }
        },

        // 20: create outbound message
        {
            'request': {
                'method': 'POST',
                'params': {},
                'headers': {
                    'Authorization': ['Token test Message-sender'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://ms.localhost:8004/api/v1/outbound/',
                'data': {
                    "to_addr": "+278212345678",
                    "identity": "cb245673-aa41-4302-ac47-00000000001",
                    "content": "testing... testing... 1,2,3",
                    "metadata": {}
                }
            },
            'response': {
                "code": 201,
                "data": {
                    'attempts': 0,
                    'updated_at': '2016-08-18T11:32:17.750207Z',
                    'content': "testing... testing... 1,2,3",
                    'created_at': '2016-08-18T11:32:17.750236Z',
                    'vumi_message_id': '075a32da-e1e4-4424-be46-1d09b71056fd',
                    'to_addr': "+278212345678",
                    'metadata': {},
                    'id': 'c99bd21e-6b9d-48ba-9f07-1e8e406737fe',
                    'delivered': "False",
                    'version': 1,
                    'url': 'http://ms.localhost:8004/api/v1/outbound/c99bd21e-6b9d-48ba-9f07-1e8e406737fe/'
                }
            }
        },

        // 21: create outbound message (metadata supplied)
        {
            'request': {
                'method': 'POST',
                'params': {},
                'headers': {
                    'Authorization': ['Token test Message-sender'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://ms.localhost:8004/api/v1/outbound/',
                'data': {
                    "to_addr": "+278212345678",
                    "identity": "cb245673-aa41-4302-ac47-00000000001",
                    "content": "testing... testing... 1,2,3",
                    "metadata": {
                        "someFlag": true
                    }
                }
            },
            'response': {
                "code": 201,
                "data": {
                    'attempts': 0,
                    'updated_at': '2016-08-18T11:32:17.750207Z',
                    'content': "testing... testing... 1,2,3",
                    'created_at': '2016-08-18T11:32:17.750236Z',
                    'vumi_message_id': '075a32da-e1e4-4424-be46-1d09b71056fd',
                    'to_addr': "+278212345678",
                    'metadata': { "someFlag": true },
                    'id': 'c99bd21e-6b9d-48ba-9f07-1e8e406737fe',
                    'delivered': "False",
                    'version': 1,
                    'url': 'http://ms.localhost:8004/api/v1/outbound/c99bd21e-6b9d-48ba-9f07-1e8e406737fe/'
                }
            }
        },

    ];
};
