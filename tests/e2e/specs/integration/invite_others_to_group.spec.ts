import { selectorify } from '@/utils/utils'
import { user_2 } from '../../../unit/mocks/mocked_user'

describe('Test invite_others_to_group', function () {
  afterEach(() => {
    cy.logout()
    cy.wait(3000)
  })
  before(function () {
    cy.logoutAll()
    cy.wait(10000) // Login API has very strict rate limiting
    cy.login(1)
    cy.visit('/rooms')
    cy.get('.alert-primary').should('not.exist', { timeout: 6000 })
    cy.get('table').contains('test-invite').parent().contains('Detail').click()
    cy.get('.spinner').should('not.exist', { timeout: 6000 })
    if (cy.$$('#usercard_' + selectorify(user_2.user_id))) {
      cy.get('#usercard_' + selectorify(user_2.user_id)).get('#kickButton').click().then(() => {
        cy.get('[data-cy=Yes]').click().then(() => {
          cy.get('#usercard_' + selectorify(user_2.user_id)).should('not.exist', { timeout: 3000 })
        }
        )
      })
    }
  })
  it('Test user can invite others(successfully)', function () {
    cy.login(1)
    cy.visit('/rooms')
    cy.get('.alert-primary').should('not.exist', { timeout: 6000 })
    cy.get('table').contains('test-invite').parent().contains('Detail').click()
    cy.get('.spinner').should('not.exist', { timeout: 6000 })
    cy.get('#inviteButton').click().then(() => {
      cy.wait(1000)
      cy.get('#invite-userid').type('@test-2:dsn.tm.kit.edu')
      cy.wait(1000)
      cy.get('#invite-confirm').click().then(() => {
        cy.logout()
        cy.login(2)
        cy.visit('/rooms')
        cy.get('.alert-primary').should('not.exist', { timeout: 6000 })
        cy.get('[data-cy=accept-invitation]').should('be.visible', { timeout: 3000 }) // invited user can receive the invitation
        cy.get('[data-cy=accept-invitation]').eq(0).click().then(() => {
          cy.wait(1000)
          cy.logout().then(() => {
            cy.login(1)
            cy.visit('/rooms')
            cy.get('.alert-primary').should('not.exist', { timeout: 6000 })
            cy.get('table').contains('test-invite').parent().contains('Detail').click()
            cy.get('.spinner').should('not.exist', { timeout: 6000 })
            cy.get('#usercard_' + selectorify(user_2.user_id)).should('exist', { timeout: 3000 })
            cy.get('#usercard_' + selectorify(user_2.user_id)).should('include.text', 'Test Account No 2') // succesfully invited
          }
          )
        })
      })
    })
  })
  it('Test user can not invite others without permission(invite noone)', function () {
    cy.login(1)
    cy.visit('/rooms')
    cy.get('.alert-primary').should('not.exist', { timeout: 6000 })
    cy.get('table').contains('test-invite').parent().contains('Detail').click()
    cy.get('.spinner').should('not.exist', { timeout: 6000 })
    cy.get('#inviteButton').click().then(() => {
      cy.wait(1000)
      cy.get('#invite-confirm').click().then(() => {
        cy.get('.popover').contains('cannot be blank')
        cy.get('[data-cy=closeInvite]').click()
      }
      )
    }
    )
  })
})
