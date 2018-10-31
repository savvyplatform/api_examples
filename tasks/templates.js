const fs = require('fs')
const request = require('request-promise-native')
const config = require('../config')

async function create(realmId, token){
  let template = null
  try{
    const result = await request.post({
      uri: `${config.savvy_api_url}/templates`,
      headers: {
        'authorization': `Bearer ${token}`
      },
      body: {
        name: config.template.name,
        summary: config.template.summary,
        realm_id: realmId
      },
      json: true
    })
    template = result
  }catch(e){
    if (!e.error || !e.error.error) throw e
    const err = e.error.error
    if (err.name === 'conflict_error'){
      console.warn(`use existing template: ${err.conflict_id}`)
      template = {id: err.conflict_id}
    }else{
      console.log(err.summary)
      return
    }
  }
  try{
    const result = await request.post({
      uri: `${config.savvy_api_url}/templates/${template.id}/assets?versioned=true`,
      headers: {
        'authorization': `Bearer ${token}`
      },
      formData: {
        file: fs.createReadStream(config.template.bundle)
      },
      json: true
    })
     console.log(result)
  }catch(e){
    if (!e.error || !e.error.error) throw e
    const err = e.error.error
    if (err.name !== 'equal_previous_version'){
      console.error(e.error)
    }else{
      console.warn(err.summary)
    }
  }
  return template
}
module.exports = {create}