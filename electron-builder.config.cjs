const packageConfig = require('./package.json');

module.exports = {
  ...packageConfig.build,
  publish: [{
    provider: 'github',
    owner: 'beatsbyteezo-creator',
    repo: 'wavsresolver'
  }]
};
