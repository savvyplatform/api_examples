const fs = require('fs')
const request = require('request-promise-native')
const config = require('../config')

async function create(template, campaign, realmId, token) {
  let creative = {}
  //upload assets
  const fields = {}
  let files = null
  try {
    const paths = ['./assets/batch/images/3.png']
    const result = await request.post({
      uri: `${config.savvy_api_url}/creatives/assets?realm_id=${realmId}`,
      headers: {
        'authorization': `Bearer ${token}`
      },
      formData: {
        files: paths.map(f => (fs.createReadStream(f)))
      },
      json: true
    })
    fields['background'] = {
      file: result.files[0].path
    }
    files = result.files.map(f=>({path: f.path, hash: f.hash}))
  } catch (e) {
    if (!e.error || !e.error.error) throw e
    const err = e.error.error
    console.error(e.error)
  }
  const outputs = [{
    name: 'default',
    width: 1280,
    height: 800,
    format: 'mp4',
    min_bit_rate: '10Mbps',
    max_bit_rate: '20Mbps'
  }]
  let conflicted = false
  try {
    const result = await request.post({
      uri: `${config.savvy_api_url}/creatives`,
      headers: {
        'authorization': `Bearer ${token}`
      },
      body: {
        name: config.creative.name,
        summary: config.creative.summary,
        realm_id: realmId,
        template_id: template.id,
        campaign_id: campaign.id,
        notify_emails: config.notify_emails,
        fields,
        outputs,
        files
      },
      json: true
    })
    creative = result
  } catch (e) {
    if (!e.error || !e.error.error) throw e
    const err = e.error.error
    if (err.name === 'conflict_error') {
      console.warn(`use existing creative: ${err.conflict_id}, only update fields and outputs...`)
      creative.id = err.conflict_id
      conflicted = true
    } else {
      console.log(err.summary)
      return creative
    }
  }
  if (conflicted){
    try{
      creative = await request.patch({
        uri: `${config.savvy_api_url}/creatives/${creative.id}`,
        headers: {
          'authorization': `Bearer ${token}`
        },
        body: {fields, outputs, files},
        json: true
      })
    }catch (e) {
      if (!e.error || !e.error.error) throw e
      const err = e.error.error
      console.log(err.summary)
      return creative
    }
  }

  //build creative
  console.log("build creative")
  try {
    const result = await request.post({
      uri: `${config.savvy_api_url}/creatives/${creative.id}/build`,
      headers: {
        'authorization': `Bearer ${token}`
      },
      json: true
    })
    //  console.log(result)
  } catch (e) {
    if (!e.error || !e.error.error) throw e
    const err = e.error.error
    console.error(e.error)
  }
  return creative
}

module.exports = {
  create
}