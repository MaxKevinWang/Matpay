import { selectorify, uuidgen } from '@/utils/utils'
import { user_1, user_2 } from '../../../unit/mocks/mocked_user'

describe('Test Permission Management', function () {
  before(function () {
    cy.login(1)
    cy.visit('room/!jJAYhsNjTNIdCGndgz:dsn.tm.kit.edu')
    cy.wait(5000)
    cy.get('#usercard_' + selectorify(user_2.user_id)).get('#kickButton').click().then(() => {
      cy.wait(1000)
      cy.get('[data-cy=Yes]').click().then(() => {
        cy.get('#usercard_' + selectorify(user_2.user_id)).should('not.exist', { timeout: 3000 })
      }
      )
    })
  })
  it('Test user can invite others(successfully)', function () {
    cy.login(1)
    cy.visit('room/!jJAYhsNjTNIdCGndgz:dsn.tm.kit.edu')
    cy.wait(5000)
    cy.get('#inviteButton').click().then(() => {
      cy.wait(1000)
      cy.get('#invite-userid').type('@test-2:dsn.tm.kit.edu')
      cy.wait(1000)
      cy.get('#invite-confirm').click()
      cy.wait(1000)
      cy.logout()
      cy.wait(1000)
      cy.login(2)
      cy.wait(1000)
      cy.visit('/rooms')
      cy.wait(5000)
      cy.get('[data-cy=accept-invitation]').should('be.visible', { timeout: 3000 }) // invited user can receive the invitation
      cy.get('[data-cy=accept-invitation]').click().then(() => {
        cy.wait(1000)
        cy.logout()
        cy.login(1)
        cy.visit('room/!jJAYhsNjTNIdCGndgz:dsn.tm.kit.edu')
        cy.wait(5000)
        cy.get('#usercard_' + selectorify(user_2.user_id)).should('exist', { timeout: 3000 })
        cy.get('#usercard_' + selectorify(user_2.user_id)).should('include.text', 'Test Account No 2') // succesfully invited
      }
      )
    })
  })
  it('Test user can not invite others without permission(invite himself)', function () {
    cy.login(1)
    cy.visit('room/!jJAYhsNjTNIdCGndgz:dsn.tm.kit.edu')
    cy.wait(5000)
    cy.get('#inviteButton').click().then(() => {
      cy.wait(1000)
      cy.get('#invite-userid').type('@test-1:dsn.tm.kit.edu')
      cy.wait(1000)
      cy.get('#invite-confirm').click().then(() => {
        cy.get('.popover').contains('You cannot invite yourself!')
      }
      )
    }
    )
  })
})
