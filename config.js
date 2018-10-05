module.exports = {
  realm_id: 97,
  savvy_api_url: 'http://localhost:9798',
  notify_emails: [],
  template: {
    name: 'test_template',
    summary: 'this is a test template',
    bundle: './assets/template/bundle.zip'
  },
  campaign:{
    name: 'test_campaign',
    summary: 'this is a test campaign'
  },
  creative: {
    name: 'test_creative',
    summary: 'this is a test creative'
  },
  batch: {
    name: 'test_batch',
    summary: 'this is a test batch',
    creative_name_rule: 'test creative ${name}'
  }
}