const fs = require('fs')
const request = require('request-promise-native')
const config = require('./config')
const generators = require('./tasks/generators')
const campaigns = require('./tasks/campaigns')
const batches = require('./tasks/batches')
const creatives = require('./tasks/creatives')

let argv = require("yargs").usage('Usage: $0 [options]').option('realm_id', {
  demandOption: true,
  type: 'number',
  describe: 'set realm id'
}).option('token', {
  demandOption: true,
  describe: 'set access token'
}).help("help").argv;

(async function () {
  const generator = await generators.create(argv.realm_id, argv.token)
  const campaign = await campaigns.create(argv.realm_id, argv.token)
  if (generator.id && campaign.id){
    const creative = await creatives.create(generator, campaign, argv.realm_id, argv.token)
    if (creative.id){
      checkCreativeState(creative.id)
    }
    // await batches.create(generator, campaign, argv.realm_id, argv.token)
  }else{
    console.error('Some error happened, stopped!')
  }
})()

function checkCreativeState(creativeId){
  const checker= async ()=>{
    const result = await request.get({
      uri: `${config.savvy_api_url}/creatives/${creativeId}/build_state`,
      headers: {
        'authorization': `Bearer ${argv.token}`
      },
      json: true
    })
    if (result.state !== 'error' && result.state !== 'built'){
      setTimeout(checker, 5000)
    }else{
      console.log(`build state: ${result.state}`)
      if (result.state === 'error'){
        supportTicket.create(`creative build error ${creative.id}`, `please help us to check build error`)
      }
    }
  }
  setTimeout(checker, 5000)
}