export interface GETLoginResponse {
  flows: [{
    type: string
  }]
}

export interface POSTLoginResponse {
  user_id: string,
  access_token: string,
  device_id: string
}
