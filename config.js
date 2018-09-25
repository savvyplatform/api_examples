module.exports = {
  realm_id: 97,
  savvy_api_url: 'http://localhost:9798',
  generator: {
    name: 'test_generator',
    summary: 'this is a test generator',
    bundle: './assets/generator/bundle.zip'
  },
  campaign:{
    name: 'test_campaign',
    summary: 'this is a test campaign'
  },
  creative: {
    name: 'test_creative',
    summary: 'this is a test creative',
    notify_emails: ['chrislearn@kenorld.com']
  },
  batch: {
    name: 'test_batch',
    summary: 'this is a test batch',
    notify_emails: ['chrislearn@kenorld.com']
  }
}