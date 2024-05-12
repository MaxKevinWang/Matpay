import { selectorify } from '@/utils/utils'
import { user_2 } from '../../../unit/mocks/mocked_user'

describe('Test join_leave_payment_group', function () {
  before(() => {
    cy.logoutAll()
    cy.wait(10000) // Login API has very strict rate limiting
  })
  afterEach(() => {
    cy.logout()
    cy.wait(3000)
  })
  it('Test rejoin', function () {
    cy.login(2)
    cy.visit('/rooms')
    cy.get('.alert-primary').should('not.exist', { timeout: 6000 })
    cy.get('table').contains('test rojoin').parent().contains('Detail').click()
    cy.get('.spinner').should('not.exist', { timeout: 6000 })
    // cy.visit('room/!XfSkhdwHMNwuyctFJP:dsn.tm.kit.edu')
    // cy.get('.spinner').should('not.exist', { timeout: 6000 })
    if (cy.$$('#usercard_' + selectorify(user_2.user_id))) {
      cy.get('#usercard_' + selectorify(user_2.user_id)).get('#leaveButton').click().then(() => {
        cy.get('[data-cy=Yes]').click().then(() => {
          cy.logout()
          cy.login(1)
          cy.visit('/rooms')
          cy.get('.alert-primary').should('not.exist', { timeout: 6000 })
          cy.get('table').contains('test rojoin').parent().contains('Detail').click()
          cy.get('.spinner').should('not.exist', { timeout: 6000 })
          cy.get('#inviteButton').click().then(() => {
            cy.wait(1000)
            cy.get('#invite-userid').type('@test-2:dsn.tm.kit.edu').then(() => {
              cy.wait(1000)
              cy.get('#invite-confirm').eq(0).click().then(() => {
                cy.logout()
                cy.login(2)
                cy.visit('/rooms')
                cy.get('.alert-primary').should('not.exist', { timeout: 6000 })
                cy.get('[data-cy=accept-invitation]').eq(0).click().then(() => {
                  cy.get('.mb-5').children().last().find('.card').find('.card-body').find('.row').children().eq(1)
                    .find('p').contains('test-rejoin').should('be.visible')
                })
              })
            })
          })
        })
      })
    }
  })
})
