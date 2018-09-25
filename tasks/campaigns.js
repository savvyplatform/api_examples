const fs = require('fs')
const request = require('request-promise-native')
const config = require('../config')

async function create(realmId, token){
  let campaign = {}
  try{
    const result = await request.post({
      uri: `${config.savvy_api_url}/campaigns`,
      headers: {
        'authorization': `Bearer ${token}`
      },
      body: {
        name: config.campaign.name,
        summary: config.campaign.summary,
        realm_id: realmId
      },
      json: true
    })
    campaign = result
  }catch(e){
    if (!e.error || !e.error.error) throw e
    const err = e.error.error
    if (err.name === 'conflict_error'){
      console.warn(`use existing campaign: ${err.conflict_id}`)
      campaign.id = err.conflict_id
    }else{
      console.log(err.summary)
      return
    }
  }
  return campaign
}

module.exports = {create}