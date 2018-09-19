const fs = require('fs')
const request = require('request-promise-native')
const config = require('../config')

let argv = require("yargs").usage('Usage: $0 [options]').option('name', {
  default: config.generator.name
}).option('summary', {
  alias: 'summary',
  default: config.generator.summary
}).option('realm_id', {
  default: config.realm_id
}).option('generator_id', {
  default: config.creative.generator_id
}).option('campaign_id', {
  default: config.creative.campaign_id
}).option('token', {
  default: config.access_token
}).help("help").argv;

async function create(){
  let creative = null
  try{
    const result = await request.post({
      uri: `${config.savvy_api_url}/creatives`,
      headers: {
        'authorization': `Bearer ${argv.token}`
      },
      body: {
        name: argv.name,
        summary: argv.summary,
        realm_id: argv.realm_id
      },
      json: true
    })
    creative = result
  }catch(e){
    const err = e.error.error
    if (err.name === 'conflict_error'){
      console.warn(`use existing creative: ${err.conflict_id}`)
      creative = {id: err.conflict_id}
    }else{
      console.log(err.summary)
      return
    }
  }
  try{
    const result = await request.post({
      uri: `${config.savvy_api_url}/creatives/${creative.id}/build`,
      headers: {
        'authorization': `Bearer ${argv.token}`
      },
      formData: {
        file: fs.createReadStream(argv.bundle)
      },
      json: true
    })
     console.log(result)
  }catch(e){
    console.error(e.error)
  }
  try{
    const result = await request.post({
      uri: `${config.savvy_api_url}/creatives/${creative.id}/build`,
      headers: {
        'authorization': `Bearer ${argv.token}`
      },
      formData: {
        file: fs.createReadStream(argv.bundle)
      },
      json: true
    })
     console.log(result)
  }catch(e){
    console.error(e.error)
  }
}

(async function(){
  await create()
})()