import { user_1, user_2 } from '../../../unit/mocks/mocked_user'
import { selectorify, split_percentage, sum_amount, to_currency_display, uuidgen } from '@/utils/utils'

describe('Test recall_tx_history', function () {
  before(() => {
    cy.logoutAll()
    cy.wait(10000) // Login API has very strict rate limiting
  })
  afterEach(() => {
    cy.wait(3000)
  })
  beforeEach(function () {
    cy.login(1)
    cy.visit('room/!HJKUpUGgHFoSoqWlCj:dsn.tm.kit.edu')
    cy.wait(5000)
  })
  // assuming there is one default approved tx in the room
  it('Test inter history page and if tx is shown correctly', function () {
    cy.get('#historyButton').click()
      .then(() => {
        cy.wait(1000)
        const date = new Date()
        date.setFullYear(2022, 1, 19)
        cy.get('.list-group-item-action').contains(date.toLocaleDateString() + ' 670a8a3: DSN Test Account No 1 paid 20€')
        cy.get('.list-group-item-action').click()
          .then(() => {
            cy.get('#TXDetail-body').contains('670a8a3: 20€ from DSN Test Account No 1 at ' + date.toLocaleDateString())
          })
      })
  })
})
