export const long_poll_data = {
  next_batch: '2',
  rooms: {
    join: {
      '!SqtvWlRFkJPEsbntuD:dsn.tm.kit.edu': {
        timeline: {
          events: [
            {
              type: 'm.room.create',
              sender: '@test-1:dsn.tm.kit.edu',
              content: {
                room_version: '6',
                creator: '@test-1:dsn.tm.kit.edu'
              },
              state_key: '',
              origin_server_ts: 1643469806953,
              unsigned: {
                age: 1801646242
              },
              event_id: '$0wKV4Z0VgtUM0gAXKhkfceMPZI8nmkEMGFG29JhjTIw'
            },
            {
              type: 'm.room.member',
              sender: '@test-1:dsn.tm.kit.edu',
              content: {
                membership: 'join',
                displayname: 'DSN Test Account No 1'
              },
              state_key: '@test-1:dsn.tm.kit.edu',
              origin_server_ts: 1643469807029,
              unsigned: {
                age: 1801646166
              },
              event_id: '$vtEISdkvDDMus03ggfWHtHuiul9H7XLR-2M05ZlgJYM'
            },
            {
              type: 'm.room.power_levels',
              sender: '@test-1:dsn.tm.kit.edu',
              content: {
                users: {
                  '@test-1:dsn.tm.kit.edu': 100
                },
                users_default: 0,
                events: {
                  'm.room.name': 50,
                  'm.room.power_levels': 100,
                  'm.room.history_visibility': 100,
                  'm.room.canonical_alias': 50,
                  'm.room.avatar': 50,
                  'm.room.tombstone': 100,
                  'm.room.server_acl': 100,
                  'm.room.encryption': 100
                },
                events_default: 0,
                state_default: 50,
                ban: 50,
                kick: 50,
                redact: 50,
                invite: 0,
                historical: 100
              },
              state_key: '',
              origin_server_ts: 1643469807117,
              unsigned: {
                age: 1801646078
              },
              event_id: '$7cZBQWIvWqjacSTmR5bYJLh0kTMS34kcW7IVpVIglyU'
            },
            {
              type: 'm.room.join_rules',
              sender: '@test-1:dsn.tm.kit.edu',
              content: {
                join_rule: 'invite'
              },
              state_key: '',
              origin_server_ts: 1643469807203,
              unsigned: {
                age: 1801645992
              },
              event_id: '$qJ93zm_2TsFD_75LMhCJQ_VTeI9UASKdm-8i-vJWVlY'
            },
            {
              type: 'm.room.history_visibility',
              sender: '@test-1:dsn.tm.kit.edu',
              content: {
                history_visibility: 'shared'
              },
              state_key: '',
              origin_server_ts: 1643469807281,
              unsigned: {
                age: 1801645914
              },
              event_id: '$GZIoEnV8qV_Cndjkgfkk-QiOPzRSgIn0TPfaKdRQSCY'
            },
            {
              type: 'm.room.guest_access',
              sender: '@test-1:dsn.tm.kit.edu',
              content: {
                guest_access: 'forbidden'
              },
              state_key: '',
              origin_server_ts: 1643469807356,
              unsigned: {
                age: 1801645839
              },
              event_id: '$BT6P84Cjfr1T0o0HSie7TFfYlFcmjFf6pMvjjkYIB6A'
            },
            {
              type: 'm.room.name',
              sender: '@test-1:dsn.tm.kit.edu',
              content: {
                name: 'testtransform1'
              },
              state_key: '',
              origin_server_ts: 1643469807437,
              unsigned: {
                age: 1801645758
              },
              event_id: '$AMcKQMx0CYgL7lho_G8Xnas2IwEZ-qRX6AMvoUZtC1k'
            },
            {
              type: 'm.room.member',
              sender: '@test-1:dsn.tm.kit.edu',
              content: {
                membership: 'invite'
              },
              state_key: '@test-2:dsn.tm.kit.edu',
              origin_server_ts: 1643469822463,
              unsigned: {
                age: 1801630732
              },
              event_id: '$AGLzFSWWmfvVx4U4iU2FrXuxKsvtVQU-KzSHalCe2hg'
            },
            {
              type: 'm.room.member',
              sender: '@test-1:dsn.tm.kit.edu',
              content: {
                membership: 'invite'
              },
              state_key: '@test-3:dsn.tm.kit.edu',
              origin_server_ts: 1643469826355,
              unsigned: {
                age: 1801626840
              },
              event_id: '$Qr7d8HYJQ2fVj22E3F-ZkGessbwqlDaxREfXhVRvycw'
            },
            {
              type: 'm.room.member',
              sender: '@test-2:dsn.tm.kit.edu',
              content: {
                membership: 'join',
                displayname: 'DSN Test Account No 2'
              },
              state_key: '@test-2:dsn.tm.kit.edu',
              origin_server_ts: 1643469830730,
              unsigned: {
                replaces_state: '$AGLzFSWWmfvVx4U4iU2FrXuxKsvtVQU-KzSHalCe2hg',
                prev_content: {
                  membership: 'invite'
                },
                prev_sender: '@test-1:dsn.tm.kit.edu',
                age: 1801622465
              },
              event_id: '$-JxWHjEbUXDZgpSBOXIB92j-7je8qDujd0IAO881cHs'
            },
            {
              type: 'm.room.member',
              sender: '@test-3:dsn.tm.kit.edu',
              content: {
                membership: 'join',
                displayname: 'DSN Test Account No 3'
              },
              state_key: '@test-3:dsn.tm.kit.edu',
              origin_server_ts: 1643469871142,
              unsigned: {
                replaces_state: '$Qr7d8HYJQ2fVj22E3F-ZkGessbwqlDaxREfXhVRvycw',
                prev_content: {
                  membership: 'invite'
                },
                prev_sender: '@test-1:dsn.tm.kit.edu',
                age: 1801582053
              },
              event_id: '$AGQEoouw9rdE5kEXvgyujzTDetc5MfXG6WBU_43uCg4'
            },
            {
              type: 'com.matpay.create',
              sender: '@test-1:dsn.tm.kit.edu',
              content: {
                from: '@test-1:dsn.tm.kit.edu',
                txs: [
                  {
                    to: '@test-2:dsn.tm.kit.edu',
                    amount: 2000,
                    tx_id: '39eba819-7523-490d-a05a-1faa11cf7424'
                  }
                ],
                group_id: '8eca31d6-7fcf-4854-8a0e-6132895ffe09',
                description: 'Tx1'
              },
              origin_server_ts: 1643469897070,
              unsigned: {
                age: 1801556125
              },
              event_id: '$TFbv64qbLUSqT1uPU35Gej_rT1TTkNfEB6BQs7-OjJk'
            },
            {
              type: 'com.matpay.approve',
              sender: '@test-1:dsn.tm.kit.edu',
              content: {
                event_id: '$TFbv64qbLUSqT1uPU35Gej_rT1TTkNfEB6BQs7-OjJk'
              },
              origin_server_ts: 1643469897176,
              unsigned: {
                age: 1801556019
              },
              event_id: '$5E-ycDxiF7jptdrnmFqYhY3QcchHlq46WyHjvzEKj1A'
            },
            {
              type: 'com.matpay.create',
              sender: '@test-2:dsn.tm.kit.edu',
              content: {
                from: '@test-2:dsn.tm.kit.edu',
                txs: [
                  {
                    to: '@test-3:dsn.tm.kit.edu',
                    amount: 1000,
                    tx_id: '78fe8e07-166c-4ce0-8cb1-ee2b0e921e33'
                  }
                ],
                group_id: '60875a55-2fed-4d97-918b-2ae45ec95a80',
                description: 'Tx2'
              },
              origin_server_ts: 1643469910333,
              unsigned: {
                age: 1801542862
              },
              event_id: '$5LCiHkH-sUoaOM4W-lLySJBB4GltwNUKK7S5X7W-zSQ'
            },
            {
              type: 'com.matpay.approve',
              sender: '@test-2:dsn.tm.kit.edu',
              content: {
                event_id: '$5LCiHkH-sUoaOM4W-lLySJBB4GltwNUKK7S5X7W-zSQ'
              },
              origin_server_ts: 1643469910559,
              unsigned: {
                age: 1801542636
              },
              event_id: '$4iGxT-CTSCp0jXm_3Zkh82bt34iOHMt8anQHLKAIqUM'
            },
            {
              type: 'com.matpay.approve',
              sender: '@test-2:dsn.tm.kit.edu',
              content: {
                event_id: '$TFbv64qbLUSqT1uPU35Gej_rT1TTkNfEB6BQs7-OjJk'
              },
              origin_server_ts: 1643469915444,
              unsigned: {
                age: 1801537751
              },
              event_id: '$y3yNgrbKoYxkeamSkKMLwpZgQl-Z0Y1_LMRYlGvAWR8'
            },
            {
              type: 'com.matpay.approve',
              sender: '@test-3:dsn.tm.kit.edu',
              content: {
                event_id: '$5LCiHkH-sUoaOM4W-lLySJBB4GltwNUKK7S5X7W-zSQ'
              },
              origin_server_ts: 1643469917972,
              unsigned: {
                age: 1801535223
              },
              event_id: '$P1_N0X6FJqiE81guKmQFAv5LY0Px4HZqqqQ0Ul0qwGg'
            }
          ],
          prev_batch: 's2226533_65457631_87720_1938204_312400_253_111327_2735296_33',
          limited: false
        },
        state: {
          events: []
        },
        account_data: {
          events: []
        },
        ephemeral: {
          events: []
        },
        unread_notifications: {
          notification_count: 0,
          highlight_count: 0
        },
        summary: {
          'm.joined_member_count': 3,
          'm.invited_member_count': 0
        },
        'org.matrix.msc2654.unread_count': 0
      },
      '!VrVxkmqIUvHOdhwHir:dsn.tm.kit.edu': {
        timeline: {
          events: [
            {
              type: 'm.room.message',
              sender: '@test-3:dsn.tm.kit.edu',
              content: {
                'org.matrix.msc1767.text': 'fwdfgedgdfgdfgfwdfgedgdfgdfgvfwdfgedgdfgdfgvvv',
                body: 'fwdfgedgdfgdfgfwdfgedgdfgdfgvfwdfgedgdfgdfgvvv',
                msgtype: 'm.text'
              },
              origin_server_ts: 1645099292649,
              unsigned: {
                age: 172160546
              },
              event_id: '$_4S8_S8JHidu0gMmQkWKG2yUlIPhlOxUt_-45BlPl7w'
            },
            {
              type: 'm.room.message',
              sender: '@test-3:dsn.tm.kit.edu',
              content: {
                'org.matrix.msc1767.text': 'v',
                body: 'v',
                msgtype: 'm.text'
              },
              origin_server_ts: 1645099292806,
              unsigned: {
                age: 172160389
              },
              event_id: '$Hvj9Ly8BI5EeVvq8cnAAAhRsqWApgRI4OLfwEzRILhE'
            },
            {
              type: 'm.room.message',
              sender: '@test-3:dsn.tm.kit.edu',
              content: {
                'org.matrix.msc1767.text': 'v',
                body: 'v',
                msgtype: 'm.text'
              },
              origin_server_ts: 1645099292970,
              unsigned: {
                age: 172160225
              },
              event_id: '$M-qec-EJLf5PDo0lGPunM40d5sXovnKpqjrifB9fR0I'
            },
            {
              type: 'm.room.message',
              sender: '@test-3:dsn.tm.kit.edu',
              content: {
                'org.matrix.msc1767.text': 'v',
                body: 'v',
                msgtype: 'm.text'
              },
              origin_server_ts: 1645099293151,
              unsigned: {
                age: 172160044
              },
              event_id: '$obcIWZPpepTBSOdmoi8pRhzFJhvZXXxgrHH65fP_Tis'
            },
            {
              type: 'm.room.message',
              sender: '@test-3:dsn.tm.kit.edu',
              content: {
                'org.matrix.msc1767.text': 'v',
                body: 'v',
                msgtype: 'm.text'
              },
              origin_server_ts: 1645099293311,
              unsigned: {
                age: 172159884
              },
              event_id: '$p92i_bZ1Y0ZyBSixb9SbXe0Z8fGyngVynJ3DicXVqR4'
            },
            {
              type: 'm.room.message',
              sender: '@test-3:dsn.tm.kit.edu',
              content: {
                'org.matrix.msc1767.text': 'v',
                body: 'v',
                msgtype: 'm.text'
              },
              origin_server_ts: 1645099293479,
              unsigned: {
                age: 172159716
              },
              event_id: '$ChwL2wEaY1wdyRv73eQN_b56bxFkZDY3jCpi3ibUa1g'
            },
            {
              type: 'm.room.message',
              sender: '@test-3:dsn.tm.kit.edu',
              content: {
                'org.matrix.msc1767.text': 'v',
                body: 'v',
                msgtype: 'm.text'
              },
              origin_server_ts: 1645099293636,
              unsigned: {
                age: 172159559
              },
              event_id: '$gvgZ9ORDiQV7JsciK6wJAANg_7cexcy5gxyMcxvPT80'
            },
            {
              type: 'm.room.message',
              sender: '@test-3:dsn.tm.kit.edu',
              content: {
                'org.matrix.msc1767.text': 'v',
                body: 'v',
                msgtype: 'm.text'
              },
              origin_server_ts: 1645099293815,
              unsigned: {
                age: 172159380
              },
              event_id: '$U9c7SOQn9FfRwhTQT_RkxjqLgqBhhZabgDaMs0ILjKM'
            },
            {
              type: 'm.room.message',
              sender: '@test-3:dsn.tm.kit.edu',
              content: {
                'org.matrix.msc1767.text': 'v',
                body: 'v',
                msgtype: 'm.text'
              },
              origin_server_ts: 1645099294018,
              unsigned: {
                age: 172159177
              },
              event_id: '$Ts8JNkK2axoYf0DWas96op2OM716cUujavXMgtQEe6o'
            },
            {
              type: 'm.room.message',
              sender: '@test-3:dsn.tm.kit.edu',
              content: {
                'org.matrix.msc1767.text': 'v',
                body: 'v',
                msgtype: 'm.text'
              },
              origin_server_ts: 1645099294196,
              unsigned: {
                age: 172158999
              },
              event_id: '$D5UeQnyyKAfg5MC47vnryER4ARkWxNhL4V6TPinR6gU'
            },
            {
              type: 'm.room.message',
              sender: '@test-3:dsn.tm.kit.edu',
              content: {
                'org.matrix.msc1767.text': 'v',
                body: 'v',
                msgtype: 'm.text'
              },
              origin_server_ts: 1645099294360,
              unsigned: {
                age: 172158835
              },
              event_id: '$syYF4IjPasWy6CZfaRFARnnwN9QryrpX4vb7uXFEInw'
            },
            {
              type: 'm.room.message',
              sender: '@test-3:dsn.tm.kit.edu',
              content: {
                'org.matrix.msc1767.text': 'v',
                body: 'v',
                msgtype: 'm.text'
              },
              origin_server_ts: 1645099294522,
              unsigned: {
                age: 172158673
              },
              event_id: '$uOV2ylPLQ4am1SOuGdco_q_O6ca9lsrGRmDoLnP_toE'
            },
            {
              type: 'm.room.message',
              sender: '@test-3:dsn.tm.kit.edu',
              content: {
                'org.matrix.msc1767.text': 'vvfwdfgedgdfgdfgfwdfgedgdfgdfgvfwdfgedgdfgdfgvvv',
                body: 'vvfwdfgedgdfgdfgfwdfgedgdfgdfgvfwdfgedgdfgdfgvvv',
                msgtype: 'm.text'
              },
              origin_server_ts: 1645099294686,
              unsigned: {
                age: 172158509
              },
              event_id: '$XvDFo_fW7XGNwjFRBsoIc2E6UWlQqJWRtCuuvYW99ks'
            },
            {
              type: 'm.room.message',
              sender: '@test-3:dsn.tm.kit.edu',
              content: {
                'org.matrix.msc1767.text': 'v',
                body: 'v',
                msgtype: 'm.text'
              },
              origin_server_ts: 1645099294862,
              unsigned: {
                age: 172158333
              },
              event_id: '$DiULk9viLoteyxyjHCNS44mZee91or4TVP_pcKPBmbk'
            },
            {
              type: 'com.matpay.modify',
              sender: '@test-1:dsn.tm.kit.edu',
              content: {
                txs: [
                  {
                    to: '@test-2:dsn.tm.kit.edu',
                    amount: 8000,
                    tx_id: 'da7e015d-fc06-4bf1-9085-e52cba9947f0'
                  }
                ],
                group_id: '9cc5f89a-4eea-402f-8460-2fe356e4903e',
                description: 'tx1.5'
              },
              origin_server_ts: 1645099328705,
              unsigned: {
                age: 172124490
              },
              event_id: '$dHHsmRzoBIUwmw0w_FpfVfi5YJO-hhfwYuoAxzx6WtY'
            },
            {
              type: 'com.matpay.approve',
              sender: '@test-1:dsn.tm.kit.edu',
              content: {
                event_id: '$dHHsmRzoBIUwmw0w_FpfVfi5YJO-hhfwYuoAxzx6WtY'
              },
              origin_server_ts: 1645099328873,
              unsigned: {
                age: 172124322
              },
              event_id: '$gWKokVx4_xZRPXTpA6trglCkFctaok6yLtwjKrKa6XA'
            },
            {
              type: 'm.room.message',
              sender: '@test-3:dsn.tm.kit.edu',
              content: {
                msgtype: 'm.text',
                body: '456'
              },
              origin_server_ts: 1645100094728,
              unsigned: {
                age: 171358467
              },
              event_id: '$zK1V_c10qmped8M8PmTCPZ6qJ2Fk0wnwu9uC5H1N9lY'
            },
            {
              type: 'm.room.message',
              sender: '@test-3:dsn.tm.kit.edu',
              content: {
                msgtype: 'm.text',
                body: '456'
              },
              origin_server_ts: 1645100186860,
              unsigned: {
                age: 171266335
              },
              event_id: '$fJiAj2Gw_aDuGsektnX9ozr_BA2YP7iGjpVx2-pb7aA'
            },
            {
              type: 'm.room.message',
              sender: '@test-3:dsn.tm.kit.edu',
              content: {
                msgtype: 'm.text',
                body: 'fd'
              },
              origin_server_ts: 1645102240962,
              unsigned: {
                age: 169212233
              },
              event_id: '$VNG-sSnDkTq6oBXljQGDkydCcVXzPuE26mR4xcr9IUo'
            },
            {
              type: 'm.room.message',
              sender: '@test-1:dsn.tm.kit.edu',
              content: {
                msgtype: 'm.text',
                body: '45354'
              },
              origin_server_ts: 1645102249499,
              unsigned: {
                age: 169203696
              },
              event_id: '$YrlFr6rnt3cfjn6xAQ3tR9XNgBcspEyFXkAvZaRsSEM'
            }
          ],
          prev_batch: 't177-2224463_65457631_87720_1938204_312400_253_111327_2735296_33',
          limited: true
        },
        state: {
          events: []
        },
        account_data: {
          events: [
            {
              type: 'm.fully_read',
              content: {
                event_id: '$xDA8-WPsElyfPMxYi3oCTuYPxqlq9_u8Ka6fQxvtLlM'
              }
            }
          ]
        },
        ephemeral: {
          events: []
        },
        unread_notifications: {
          notification_count: 1,
          highlight_count: 0
        },
        summary: {
          'm.joined_member_count': 3,
          'm.invited_member_count': 0
        },
        'org.matrix.msc2654.unread_count': 1
      }
    },
    invite: {
      '!lukaWOYXtUZYjnCqnz:dsn.tm.kit.edu': {}
    },
    leave: {
      '!ElXKiDHBrqPJAcPXFS:dsn.tm.kit.edu': {}
    }
  },
  account_data: {
    events: [
      {
        event_id: 'abc'
      }
    ]
  }
}
