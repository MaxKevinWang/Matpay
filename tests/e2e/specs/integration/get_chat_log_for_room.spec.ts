import { uuidgen } from '@/utils/utils'
import { user_3 } from '../../../unit/mocks/mocked_user'
import { POSTLoginResponse } from '@/interface/api.interface'
import { test_account3 } from '../../../test_utils'

describe('Test get_chat_log_for_room', function () {
  before(() => {
    cy.logoutAll()
    cy.wait(10000) // Login API has very strict rate limiting
  })
  beforeEach(function () {
    cy.login(1)
    cy.visit('/rooms')
    cy.get('.alert-primary').should('not.exist', { timeout: 6000 })
    cy.get('table').contains('test-sending-message').parent().contains('Detail').click()
    cy.get('.spinner').should('not.exist', { timeout: 6000 })
  })
  it('Test get chatlog synchronized', function () {
    const message = uuidgen()
    cy.request<POSTLoginResponse>('POST', 'https://matrix.dsn.scc.kit.edu/_matrix/client/r0/login', {
      type: 'm.login.password',
      identifier: {
        type: 'm.id.user',
        user: user_3.user_id
      },
      password: test_account3.password
    })
      .then((response) => {
        cy.request({
          method: 'PUT',
          url: `https://matrix.dsn.scc.kit.edu/_matrix/client/r0/rooms/!MDXnrxrPjjppRhMozh:dsn.tm.kit.edu/send/m.room.message/${uuidgen()}`,
          body: {
            msgtype: 'm.text',
            body: message
          },
          headers: {
            Authorization: 'Bearer ' + response.body.access_token
          }
        })
          .then(() => {
            cy.wait(2000) // this wait is necessary due to long poll delay
            cy.get('.mb-5').children().last().find('.chat-message')
              .contains(message)
          })
      })
  })
  afterEach(() => {
    cy.logout()
    cy.wait(3000)
  })
})
