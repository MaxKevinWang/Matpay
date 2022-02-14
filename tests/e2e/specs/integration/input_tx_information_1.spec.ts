import { user_1, user_2 } from '../../../unit/mocks/mocked_user'
import { uuidgen } from '@/utils/utils'
import { selectorify, split_percentage, sum_amount, to_currency_display } from '@/utils/utils'

describe('Test US Input Tx Information 1', function () {
  beforeEach(function () {
    cy.login(1)
    cy.visit('room/!HJKUpUGgHFoSoqWlCj:dsn.tm.kit.edu')
    cy.wait(5000)
  })
  it('Input Tx info', function () {
    cy.get('#createButton').click()
      .then(() => {
        cy.wait(1000)
        cy.get('#input-description').type('tx1')
        cy.wait(1000)
        cy.get('#input-amount').type('20')
        cy.wait(1000)
        cy.get('#select-member').select(user_1.displayname)
        cy.wait(1000)
        cy.get('#split_button').click()
          .then(() => {
            cy.get(`#split-checkbox${selectorify(user_1.user_id)}`).click()
            cy.wait(1000)
            cy.get(`#split-checkbox${selectorify(user_2.user_id)}`).click()
            cy.wait(1000)
            cy.get('#default-split').click()
            cy.wait(1000)
            cy.get('#split_create_save').click()
              .then(() => {
                cy.wait(3000)
                cy.get('#create-confirm').click()
                  .then(() => {
                    cy.wait(3000)
                    cy.contains('p', 'tx1')
                  })
              })
          })
      })
  })
})
