const fs = require('fs')
const request = require('request-promise-native')
const config = require('../config')

async function create(realmId, token){
  let generator = null
  try{
    const result = await request.post({
      uri: `${config.savvy_api_url}/generators`,
      headers: {
        'authorization': `Bearer ${token}`
      },
      body: {
        name: config.generator.name,
        summary: config.generator.summary,
        realm_id: realmId
      },
      json: true
    })
    generator = result
  }catch(e){
    if (!e.error || !e.error.error) throw e
    const err = e.error.error
    if (err.name === 'conflict_error'){
      console.warn(`use existing generator: ${err.conflict_id}`)
      generator = {id: err.conflict_id}
    }else{
      console.log(err.summary)
      return
    }
  }
  try{
    const result = await request.post({
      uri: `${config.savvy_api_url}/generators/${generator.id}/assets?versioned=true`,
      headers: {
        'authorization': `Bearer ${token}`
      },
      formData: {
        file: fs.createReadStream(config.generator.bundle)
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
  return generator
}
module.exports = {create}