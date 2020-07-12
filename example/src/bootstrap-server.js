require('ignore-styles');

require('@babel/register')({
  ignore: [/(node_modules)/],
  presets: ['preset-env', 'preset-react-app', 'preset-typescript']
});

require('./server.tsx');