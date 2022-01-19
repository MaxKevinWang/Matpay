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
  cy.request<POSTLoginResponse>('POST', `${homeserver}/_matrix/client/r0/login`, {
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
