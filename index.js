const fs = require('fs')
const request = require('request-promise-native')
const config = require('./config')
const templates = require('./tasks/templates')
const campaigns = require('./tasks/campaigns')
const batches = require('./tasks/batches')
const creatives = require('./tasks/creatives')
const supportingTicket = require('./tasks/supporting-ticket')

let argv = require("yargs").usage('Usage: $0 [options]').option('realm_id', {
  demandOption: true,
  type: 'number',
  describe: 'set realm id'
}).option('token', {
  demandOption: true,
  describe: 'set access token'
}).help("help").argv;

(async function () {
  const template = await templates.create(argv.realm_id, argv.token)
  const campaign = await campaigns.create(argv.realm_id, argv.token)
  if (template.id && campaign.id) {
    const creative = await creatives.create(template, campaign, argv.realm_id, argv.token)
    if (creative.id) {
      checkCreativeState(creative.id)
    }
    await batches.create(template, campaign, argv.realm_id, argv.token)
  } else {
    console.error('Some error happened, stopped!')
  }
})()

function checkCreativeState(creativeId) {
  const checker = async () => {
    const result = await request.get({
      uri: `${config.savvy_api_url}/creatives/${creativeId}/build_state`,
      headers: {
        'authorization': `Bearer ${argv.token}`
      },
      json: true
    })
    console.log(`build state:`, result)
    if (result.state !== 'error' && result.state !== 'built') {
      setTimeout(checker, 5000)
    } else {
      if (result.state === 'error') {
        supportingTicket.create(`creative build error ${creativeId}`, `please help us to check build error`)
      } else {
        const urls = await getVideoURLs(creativeId)
        console.log(urls)
      }
    }
  }
  setTimeout(checker, 5000)
  checker()
}
async function getVideoURLs(creativeId){
  const result = await request.get({
    uri: `${config.savvy_api_url}/creatives/${creativeId}/videos/latest`,
    headers: {
      'authorization': `Bearer ${argv.token}`
    },
    json: true
  })
  return result.map(r=>(`${config.savvy_api_url}/space/creatives/${creativeId}/${r.file}`))
}