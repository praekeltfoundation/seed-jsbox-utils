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

        // 3: get identity 08212345678 by msisdn
        {
            'repeatable': true,
            'request': {
                'method': 'GET',
                'params': {
                    'details__addresses__msisdn': '08212345678'
                },
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/search/',
            },
            'response': {
                "code": 200,
                "data": {
                    "count": 1,
                    "next": null,
                    "previous": null,
                    "results": [{
                        "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000001/",
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

        // 4: get identity cb245673-aa41-4302-ac47-00000000001
        {
            'repeatable': true,
            'request': {
                'method': 'GET',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000001/',
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000001/",
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

        // 5: create identity 08212345678
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/",
                'data':  {
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "08212345678": {}
                            }
                        }
                    }
                }
            },
            'response': {
                "code": 201,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000001/",
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
                }
            }
        },

        // 6: create identity 08212345678; operater_id provided
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/",
                'data':  {
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "08212345678": {}
                            }
                        }
                    },
                    "operator": "cb245673-aa41-4302-ac47-00000000002"
                }
            },
            'response': {
                "code": 201,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000001/",
                    "id": "cb245673-aa41-4302-ac47-00000000001",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "08212345678": {}
                            }
                        },
                    },
                    "operator": "cb245673-aa41-4302-ac47-00000000002",
                    "created_at": "2016-06-21T06:13:29.693272Z",
                    "updated_at": "2016-06-21T06:13:29.693298Z"
                }
            }
        },

        // 7: create identity 08212345678; communicate_through provided
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/",
                'data':  {
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "08212345678": {}
                            }
                        }
                    },
                    "communicate_through": "cb245673-aa41-4302-ac47-00000000003"
                }
            },
            'response': {
                "code": 201,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000001/",
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
                    "communicate_through": "cb245673-aa41-4302-ac47-00000000003",
                    "created_at": "2016-06-21T06:13:29.693272Z",
                    "updated_at": "2016-06-21T06:13:29.693298Z"
                }
            }
        },

        // 8: create identity 08212345678; communicate_through & operator_id provided
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/",
                'data': {
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {"08212345678":{}}
                        }
                    },
                    "communicate_through":"cb245673-aa41-4302-ac47-00000000003",
                    "operator":"cb245673-aa41-4302-ac47-00000000002"
                },
            },
            'response': {
                "code": 201,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000001/",
                    "id": "cb245673-aa41-4302-ac47-00000000001",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {"08212345678":{}}
                        }
                    },
                    "communicate_through":"cb245673-aa41-4302-ac47-00000000003",
                    "operator":"cb245673-aa41-4302-ac47-00000000002"
                }
            }
        },

        // 9: get identity 08211111111 by msisdn
        {
            'repeatable': true,
            'request': {
                'method': 'GET',
                'params': {
                    'details__addresses__msisdn': '08211111111'
                },
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/search/',
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

        // 10: create identity 08211111111
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/",
                'data':  {
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "08211111111": {}
                            }
                        }
                    }
                }
            },
            'response': {
                "code": 201,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00011111111/",
                    "id": "cb245673-aa41-4302-ac47-00011111111",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "08211111111": {}
                            }
                        }
                    },
                    "created_at": "2016-06-21T06:13:29.693272Z",
                    "updated_at": "2016-06-21T06:13:29.693298Z"
                }
            }
        },

        // 11: patch identity cb245673-aa41-4302-ac47-00000000001
        {
            'request': {
                'method': 'PATCH',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000001/",
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

    ];
};
