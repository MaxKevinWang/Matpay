import { uuidgen } from '@/utils/utils'

describe('Test transaction approval', function () {
  before(() => {
    cy.logoutAll()
    cy.wait(10000) // Login API has very strict rate limiting
  })
  afterEach(() => {
    cy.wait(3000)
  })
  beforeEach(function () {
    cy.login(1)
    cy.visit('/rooms')
    cy.get('.alert-primary').should('not.exist', { timeout: 6000 })
  })
  it('Test rejection', function () {
    const random_tx_name = uuidgen().substring(0, 7)
    cy.get('table').contains('CypressApprovalTest').parent().contains('Detail').click()
    cy.get('.spinner').should('not.exist', { timeout: 6000 })
    cy.createTx(random_tx_name)
    cy.logout()
    cy.login(2).then(() => {
      cy.visit('/rooms')
      cy.get('.alert-primary').should('not.exist', { timeout: 6000 })
      cy.get('table').contains('CypressApprovalTest').parent().contains('Detail').click()
        .then(() => {
          cy.get('.spinner').should('not.exist', { timeout: 3000 })
          cy.get('.mb-5').children().last().find('.card').find('.card-body')
            .find('.row').children().eq(3).find('.btn-primary').click()
            .then(() => {
              cy.get('[data-cy=reject]').filter(':visible').click()
              cy.get('.mb-5').contains(random_tx_name).should('not.exist', { timeout: 3000 })
              cy.visit('/rooms')
              cy.get('.alert-primary').should('not.exist', { timeout: 6000 })
              cy.get('table').contains('CypressApprovalTest').parent().contains('Detail').click()
              cy.get('.spinner').should('not.exist', { timeout: 6000 })
              cy.get('.mb-5').contains(random_tx_name).should('not.exist', { timeout: 3000 })
            })
        })
    })
  })
  it('Test scroll to previous', function () {
    cy.viewport(550, 750)
    cy.viewport('iphone-6')
    cy.get('table').contains('CypressTestScrolling').parent().contains('Detail').click()
      .then(() => {
        cy.get('.spinner').should('not.exist', { timeout: 6000 })
        cy.scrollTo('bottom')
        cy.get('.mb-5').children().last().find('.card').find('.card-body')
          .find('.row').children().eq(3).find('[data-cy=previous]').click()
        cy.get('.mb-5').children().eq(1).should('be.visible')
      })
  })
})
