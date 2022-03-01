// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
import { test_account1, test_account2, test_account3, test_homeserver } from '../../test_utils'
import { POSTLoginResponse } from '@/interface/api.interface'
import { user_1, user_2 } from '../../unit/mocks/mocked_user'
import { selectorify, uuidgen } from '@/utils/utils'

Cypress.Commands.add('login', (id: 1 | 2 | 3) => {
  const homeserver = test_homeserver
  let username : string, password : string
  if (id === 1) {
    username = test_account1.username // choose the account you want
    password = test_account1.password // the same
  } else if (id === 2) {
    username = test_account2.username // choose the account you want
    password = test_account2.password // the same
  } else {
    username = test_account3.username // choose the account you want
    password = test_account3.password // the same
  }
  return cy.request<POSTLoginResponse>('POST', `${homeserver}/_matrix/client/r0/login`, {
    type: 'm.login.password',
    identifier: {
      type: 'm.id.user',
      user: username
    },
    password: password
  })
    .then((resp) => {
      window.localStorage.setItem('access_token', resp.body.access_token)
      window.localStorage.setItem('device_id', resp.body.device_id)
      window.localStorage.setItem('user_id', username)
      window.localStorage.setItem('homeserver', homeserver)
    })
})

Cypress.Commands.add('logout', () => {
  return cy.get('#logout_button').click()
})

Cypress.Commands.add('createTx', (description: string) => {
  cy.get('#createButton').click()
    .then(() => {
      cy.wait(1000)
      cy.get('#input-description').type(description)
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
            })
        })
    })
})

Cypress.Commands.add('logoutAll', () => {
  const test_accounts = [test_account1, test_account2, test_account3]
  const homeserver = test_homeserver
  for (const account of test_accounts) {
    cy.request<POSTLoginResponse>('POST', `${homeserver}/_matrix/client/r0/login`, {
      type: 'm.login.password',
      identifier: {
        type: 'm.id.user',
        user: account.username
      },
      password: account.password
    })
      .then((response) => {
        cy.request({
          method: 'POST',
          url: `${homeserver}/_matrix/client/v3/logout/all`,
          headers: {
            Authorization: 'Bearer ' + response.body.access_token
          }
        })
      })
      .then((response) => {
        if (response.status !== 200) {
          throw new Error('Cleanup failed.')
        }
      })
  }
})
