const fs = require('fs')
const request = require('request-promise-native')
const config = require('../config')

async function create(generator, campaign, realmId, token){
  let creative = {}
  try{
    const result = await request.post({
      uri: `${config.savvy_api_url}/creatives`,
      headers: {
        'authorization': `Bearer ${token}`
      },
      body: {
        name: config.creative.name,
        summary: config.creative.summary,
        realm_id: realmId,
        generator_id: generator.id,
        campaign_id: campaign.id,
        notify_emails: config.notify_emails,
        outputs:[{
          name: 'default',
          width: 1280,
          height: 800,
          format: 'mp4'
        }]
      },
      json: true
    })
    creative = result
  }catch(e){
    if (!e.error || !e.error.error) throw e
    const err = e.error.error
    if (err.name === 'conflict_error'){
      console.warn(`use existing creative: ${err.conflict_id}`)
      creative.id = err.conflict_id
    }else{
      console.log(err.summary)
      return creative
    }
  }
  const fields = {}
  try{
    const files = ['./assets/batch/images/1.png']
    const result = await request.post({
      uri: `${config.savvy_api_url}/creatives/${creative.id}/assets`,
      headers: {
        'authorization': `Bearer ${token}`
      },
      formData: {
        files: files.map(f=>(fs.createReadStream(f)))
      },
      json: true
    })
    fields['background']
  }catch(e){
    if (!e.error || !e.error.error) throw e
    const err = e.error.error
    console.error(e.error)
  }
  try{
    const result = await request.post({
      uri: `${config.savvy_api_url}/creatives/${creative.id}/build`,
      headers: {
        'authorization': `Bearer ${token}`
      },
      json: true
    })
    //  console.log(result)
  }catch(e){
    if (!e.error || !e.error.error) throw e
    const err = e.error.error
    console.error(e.error)
  }
  return creative
}

module.exports = {create}