import { user_1, user_2 } from '../../../unit/mocks/mocked_user'
import { selectorify, split_percentage, sum_amount, to_currency_display, uuidgen } from '@/utils/utils'

describe('Test recall_tx_history', function () {
  beforeEach(function () {
    cy.login(1)
    cy.visit('room/!boXqlLQELBngYvdxpE:dsn.tm.kit.edu')
    cy.get('.alert-primary').should('not.exist', { timeout: 6000 })
  })
  it('Test rejection', function () {
    const random_tx_name = uuidgen().substring(0, 7)
    cy.createTx(random_tx_name)
    cy.logout()
    cy.login(2)
    cy.visit('room/!boXqlLQELBngYvdxpE:dsn.tm.kit.edu')
    cy.get('.alert-primary').should('not.exist', { timeout: 6000 })
    cy.get('.mb-5').children().last().find('.card').find('.card-body')
      .find('.row').children().eq(3).find('[F-cy=detail]').click()
      .then(() => {
        cy.get('[data-cy=reject]').click()
        cy.get('.mb-5').should('not.exist', { timeout: 3000 })
      })
  })
  it('Test scroll to previous', function () {
    cy.viewport(550, 750)
    cy.viewport('iphone-6')
    cy.visit('room/!gqmGxtvBMcFMBWAAKb:dsn.tm.kit.edu')
    cy.get('.alert-primary').should('not.exist', { timeout: 6000 })
    cy.get('.mb-5').children().last().find('.card').find('.card-body')
      .find('.row').children().eq(3).find('[data-cy=previous]').click()
    cy.get('.mb-5').children().eq(1).should('be.visible')
  })
})
