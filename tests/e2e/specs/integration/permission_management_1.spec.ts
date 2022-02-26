import { selectorify, uuidgen } from '@/utils/utils'
import { user_1, user_2 } from '../../../unit/mocks/mocked_user'

describe('Test Permission Management', function () {
  beforeEach(function () {
    cy.login(1)
    cy.wait(1000)
    cy.visit('/rooms')
    cy.get('.alert-primary').should('not.exist', { timeout: 6000 })
    cy.get('table').contains('test-permisson').parent().contains('Detail').click()
    cy.get('.spinner').should('not.exist', { timeout: 6000 })
    cy.get('#inviteButton').click().then(() => {
      cy.wait(1000)
      cy.get('#invite-userid').type('@test-2:dsn.tm.kit.edu')
      cy.wait(1000)
      cy.get('#invite-confirm').click().then(() => {
        cy.logout().then(() => {
          cy.login(2)
          cy.wait(1000)
          cy.visit('/rooms')
          cy.get('.alert-primary').should('not.exist', { timeout: 6000 })
          cy.get('[data-cy=accept-invitation]').click().then(() => {
            cy.logout()
          }
          )
        })
      })
    })
  })
  it('Test kick a member(without open balance)', function () {
    cy.login(1)
    cy.visit('/rooms')
    cy.get('.alert-primary').should('not.exist', { timeout: 6000 })
    cy.get('table').contains('test-permisson').parent().contains('Detail').click()
    cy.get('.spinner').should('not.exist', { timeout: 6000 })
    cy.get('#usercard_' + selectorify(user_2.user_id)).get('#kickButton').click().then(() => {
      cy.get('[data-cy=Yes]').click().then(() => {
        cy.get('#usercard_' + selectorify(user_2.user_id)).should('not.exist', { timeout: 3000 })
      }
      )
    }
    )
  })
})
