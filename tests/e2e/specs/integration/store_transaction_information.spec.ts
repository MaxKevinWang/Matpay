import { uuidgen } from '@/utils/utils'

describe('Test store_transaction_message', function () {
  before(() => {
    cy.logoutAll()
    cy.wait(10000) // Login API has very strict rate limiting
  })
  afterEach(() => {
    cy.logout()
    cy.wait(3000)
  })
  beforeEach(function () {
    cy.login(1)
    cy.visit('room/!WcLZCQQpAHFFsJMbvF:dsn.tm.kit.edu')
    cy.get('.spinner').should('not.exist', { timeout: 6000 })
  })
  it('Check if approved message exists', function () {
    const random_tx_name = uuidgen().substring(0, 7)
    cy.createTx(random_tx_name)
    cy.logout()
    cy.login(2).then(() => {
      cy.visit('/rooms')
      cy.get('.alert-primary').should('not.exist', { timeout: 6000 })
      cy.get('table').contains('CypressStoreTest').parent().contains('Detail').click()
        .then(() => {
          cy.get('.spinner').should('not.exist', { timeout: 3000 })
          cy.get('.mb-5').children().last().find('.card').find('.card-body')
            .find('.row').children().eq(3).find('.btn-primary').click()
            .then(() => {
              cy.get('[data-cy=approve]').filter(':visible').click()
                .then(() => {
                  cy.get('.mb-5').children().last().find('.card').find('.card-body')
                    .find('.row').children().eq(1)
                    .find('p').contains(random_tx_name)
                  cy.get('.mb-5').children().last().find('.card').find('.card-body')
                    .find('.row').children().eq(2)
                    .find('p').contains('DSN Test Account No 1 paid 20.00€')
                })
            })
        })
    })
  })
})
