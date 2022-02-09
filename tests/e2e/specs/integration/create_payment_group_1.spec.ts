import { user_1 } from '../../../unit/mocks/mocked_user'
import { uuidgen } from '@/utils/utils'

describe('Test US Create Payment Group 1', function () {
  beforeEach(function () {
    cy.login(1)
  })
  it('Create Payment Group', function () {
    cy.visit('/rooms')
    cy.wait(5000)
    cy.get('#create-dialog-button').click()
      .then(() => {
        const random_room_name = uuidgen().substring(0, 7)
        cy.get('#room-name-input').type(random_room_name)
        cy.get('#create-room-button').click()
          .then(() => {
            cy.wait(1000)
            cy.url().should('includes', 'room')
            cy.contains('h2', random_room_name)
            cy.contains('.about', user_1.displayname)
            cy.contains('.about', 'Admin')
            cy.get('.chat-message').should('not.exist')
            cy.visit('/rooms')
              .then(() => {
                cy.contains('td', random_room_name)
              })
          })
      })
  })
})
