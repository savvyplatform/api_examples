const fs = require('fs')
const request = require('request-promise-native')
const config = require('../config')

async function create(subject, content, realmId, token){
  let ticket = {}
  try{
    const result = await request.post({
      uri: `${config.savvy_api_url}/supporting_tickets`,
      headers: {
        'authorization': `Bearer ${token}`
      },
      body: {
        subject: subject,
        content: content,
        realm_id: realmId,
        notify_emails: config.notify_emails
      },
      json: true
    })
    ticket = result
  }catch(e){
    if (!e.error || !e.error.error) throw e
    const err = e.error.error
    if (err.name === 'conflict_error'){
      console.warn(`use existing creative: ${err.conflict_id}`)
      ticket.id = err.conflict_id
    }else{
      console.log(err.summary)
      return ticket
    }
  }
  return ticket
}

module.exports = {create}