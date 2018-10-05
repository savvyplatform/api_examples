
const fs = require('fs')
const request = require('request-promise-native')
const config = require('../config')

async function create(template, campaign, realmId, token) {
  console.log("batch upload feed...")
  let feed = null
  try {
    const result = await request.post({
      uri: `${config.savvy_api_url}/batches/feed?realm_id=${realmId}`,
      headers: {
        'authorization': `Bearer ${token}`
      },
      formData: {
        file: fs.createReadStream('assets/batch/feed.xlsx')
      },
      json: true
    })
    feed = {file:result.files[0].path, type:'xlsx'}
    //  console.log(result)
  } catch (e) {
    if (!e.error || !e.error.error) throw e
    const err = e.error.error
    console.error(e.error)
  }

  console.log("batch upload assets...")
  let assets = null
  try {
    const result = await request.post({
      uri: `${config.savvy_api_url}/batches/assets?realm_id=${realmId}`,
      headers: {
        'authorization': `Bearer ${token}`
      },
      formData: {
        file: fs.createReadStream('assets/batch/batch.zip')
      },
      json: true
    })
    assets = result.files
    //  console.log(result)
  } catch (e) {
    if (!e.error || !e.error.error) throw e
    const err = e.error.error
    console.error(e.error)
  }

  let batch = {}
  let conflicted = false
  try {
    const result = await request.post({
      uri: `${config.savvy_api_url}/batches`,
      headers: {
        'authorization': `Bearer ${token}`
      },
      body: {
        name: config.batch.name,
        summary: config.batch.summary,
        realm_id: realmId,
        template_id: template.id,
        campaign_id: campaign.id,
        creative_name_rule: config.batch.creative_name_rule,
        notify_emails: config.notify_emails,
        feed: feed,
        assets: assets
      },
      json: true
    })
    batch = result
  } catch (e) {
    if (!e.error || !e.error.error) throw e
    const err = e.error.error
    if (err.name === 'conflict_error') {
      console.warn(`use existing batch: ${err.conflict_id}, only update it...`)
      batch.id = err.conflict_id
      conflicted = true
    } else {
      console.log(err.summary)
      return batch
    }
  }
  if (conflicted){
    try{
      batch = await request.patch({
        uri: `${config.savvy_api_url}/batches/${batch.id}`,
        headers: {
          'authorization': `Bearer ${token}`
        },
        body: {
          summary: config.batch.summary,
          realm_id: realmId,
          template_id: template.id,
          campaign_id: campaign.id,
          creative_name_rule: config.batch.creative_name_rule,
          notify_emails: config.notify_emails,
          feed: feed,
          assets: assets
        },
        json: true
      })
    }catch (e) {
      if (!e.error || !e.error.error) throw e
      const err = e.error.error
      console.log(err.summary)
      return batch
    }
  }

  console.log("batch generate creatives")
  try {
    const result = await request.post({
      uri: `${config.savvy_api_url}/batches/${batch.id}/generate`,
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
  console.log("build batch")
  try {
    const result = await request.post({
      uri: `${config.savvy_api_url}/batches/${batch.id}/build`,
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
  return batch
}

module.exports = {
  create
}