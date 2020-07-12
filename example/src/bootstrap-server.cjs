require('ignore-styles');

require('@babel/register')({
  ignore: [/(node_modules)/],
  extensions: ['.ts', '.tsx'],
  presets: ['@babel/preset-env', 'react-app', '@babel/preset-typescript']
});

require('./server.tsx');