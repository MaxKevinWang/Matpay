import { selectorify, uuidgen } from '@/utils/utils'
import { user_1, user_2 } from '../../../unit/mocks/mocked_user'

describe('Test Permission Management', function () {
  beforeEach(function () {
    cy.login(1)
    cy.visit('room/!HJKUpUGgHFoSoqWlCj:dsn.tm.kit.edu')
    cy.wait(5000)
    cy.get('#inviteButton').click().then(() => {
      cy.get('#invite-userid').type('@test-2:dsn.tm.kit.edu')
      cy.get('#invite-confirm').click()
    })
    cy.logout()
    cy.login(2)
  })
})
