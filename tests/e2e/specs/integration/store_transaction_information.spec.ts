import { user_1, user_2 } from '../../../unit/mocks/mocked_user'
import { selectorify, split_percentage, sum_amount, to_currency_display, uuidgen } from '@/utils/utils'

describe('Test store_transaction_message', function () {
  beforeEach(function () {
    cy.login(1)
    cy.visit('room/!HJKUpUGgHFoSoqWlCj:dsn.tm.kit.edu')
    cy.wait(5000)
  })
  // assuming there is one default approved tx in the room
  it('Check if approved message exists', function () {
    cy.get('.mb-5').children().first().find('.card').find('.card-body')
      .find('.row').children().eq(1)
      .find('p').contains('670a8a3')
    cy.get('.mb-5').children().first().find('.card').find('.card-body')
      .find('.row').children().eq(2)
      .find('p').contains('DSN Test Account No 1 paid 20.00€')
  })
})
