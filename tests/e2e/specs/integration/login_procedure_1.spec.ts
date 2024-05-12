import { test_account1, test_homeserver } from '../../../test_utils'

describe('Test login procedure', () => {
  afterEach(() => {
    cy.wait(3000)
  })
  before(() => {
    cy.logoutAll()
    cy.wait(10000) // Login API has very strict rate limiting
  })
  it('Test login procedure', () => {
    cy.visit('/login')
    cy.contains('h2', 'Login')
    cy.get('#username').type(test_account1.username)
    cy.get('#homeserver').clear().type(test_homeserver)
    cy.get('#password').type(test_account1.password)
    cy.get('#login')
      .click()
      .then(() => {
        cy.get('.spinner-login').should('not.exist', { timeout: 6000 })
        cy.url().should('includes', 'rooms')
        cy.contains('h2', 'Rooms')
        cy.contains('h3', 'Joined Rooms')
        cy.contains('h3', 'Received Invitations')
        cy.contains('tr', 'Name')
        cy.contains('th', 'Test00001', { timeout: 5000 })
      })
  })
  it('Test login procedure fail', () => {
    cy.visit('/login')
    cy.contains('h2', 'Login')
    cy.get('#username').type(test_account1.username)
    cy.get('#homeserver').clear().type(test_homeserver)
    cy.get('#password').type('fyou')
    cy.get('#login')
      .click()
      .then(() => {
        cy.get('.alert').contains('Error')
      })
  })
})
