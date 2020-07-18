# react-ssr-data-provider

<img src="https://img.icons8.com/offices/30/000000/warning-shield.png"/> This library is still in PoC stage, and <strong>it's not ready for production</strong>. Feel free to share your ideas. If you want to contribute. Please keep your pull requests small, and understandable. <img src="https://img.icons8.com/offices/30/000000/warning-shield.png"/>

Type-safe isomorphic data provider to conveniently optimise data fetching during server-side and client-side rendering.

[![NPM](https://img.shields.io/npm/v/react-ssr-data-provider.svg)](https://www.npmjs.com/package/react-ssr-data-provider) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
yarn add react-ssr-data-provider
```
or
```bash
npm install --save react-ssr-data-provider
```

## Usage

#### First, create your DataProvider:

MyDataProvider.tsx
```tsx
import { getDataProvider, DataClientBase } from 'react-ssr-data-provider';

// Create your DataClient interface. This ensures ssr and csr data providers are returning the same shape of data
export interface MyDataClient extends DataClientBase {
  getGreeting: (name: string) => Promise<string>;
}

/* 
  - DataProvider: A higher-order component to provider a data context for your component tree
  - useDataClient: react hook to get access to the data provider client
  
  Name these as you like for exports so they fit your projects naming conventions
*/
export const { DataProvider: MyDataProvider, useDataClient: useMyDataClient } = getDataProvider<MyDataClient>();
```

#### Set it up for the browser:

client.tsx
```tsx
import React from 'react';
import ReactDOM from 'react-dom';
import { MyDataProvider } from './MyDataProvider';
/* 
  Wrap your application with your DataProvider and define the functions that fetch data from the browser, e.g.: calling a public API
*/
ReactDOM.hydrate(
  <MyDataProvider providers={{ getGreeting: (name) => Promise.resolve(`Hello ${name} from the client side. I'm probably doing an http call or using a proxy to fetch data.`) }}>
    <App />
  </MyDataProvider>,
  document.getElementById('root')
);
```

#### Set it up for server-side rendering:

server.tsx
```tsx
import React from 'react';
import express from 'express';
import { renderToString } from 'react-dom/server';
import { MyDataProvider } from 'MyDataProvider';
import { DataContext } from 'react-ssr-data-provider';
import App from './App';

const app = express();

app.get('*', async (req, res) => {
  const myDataContext = {} as DataContext;
  /*
     Wrap your application with your DataProvider and define the functions that fetch data during server-side rendering, e.g.: calling a microservoce direcly within the VPC network
  */
  const renderedApp = renderToString(<MyDataProvider dataContext={myDataContext} providers={{ getGreeting: (name) => Promise.resolve(`Hello ${name} from the server side. I'm probably doing an internal service or database call without going through the internet.`) }}>
    <App />
  </MyDataProvider>);

  /*
    dataContext.getScript() will return a string, containing a <script></script> that you need to inject into your HTML, so the client-side DataProvider can use the pre-fetched data from the server. This will make your first client-side data fetches lighning fast.
  */
  const dataScript = myDataContext.getScript ? await myDataContext.getScript() : '';

  res.send(`<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
    </head>
    <body>
      ${renderedApp}
      ${dataScript}
      <script src="/myBundle.js"></script>
    </body>
  </html>`);
});

app.listen(3000, () => console.log('App is listening on port 3000'));
```

#### Use the isomorphic data providers in your App

App.tsx
```tsx
import React from 'react';
import { useMyDataClient } from './MyDataProvider';
import { useDataEffect } from 'react-ssr-data-provider';

const App: React.FC = () => {
  /* 
    You can get access to your data provider methods using the `useDataClient()` hook. They will use the pre-fetched data from the server-side for the first render.
  */
  const { getGreeting } = useMyDataClient();
  const [greeting, setGreeting] = useState<string>();

  const update = useCallback(async () => {
    /*
     First call to getGreeting will use the pre-fetched data. Any subsequent call will use the client-side data provider.
      setGreeting(await getGreeting('FooBar'));
    */
  }, [setGreeting, getGreeting]);

  useDataEffect(() => {
    update();
  }, [getGreeting]);

  return <div>
    {greeting}
    <button onClick={update}>Fetch data again</button>
  </div>;
};

```

## Upcoming features

- `withDataClient()` higher-order component
- `withDataProvider()` higher-order component
- Use [suspense](https://reactjs.org/docs/concurrent-mode-suspense.html) for full server-side rendering as soon as it's available in react
- provide way to describe the client interface without TypeScript
- use web workers for client-side fetching
- use worker threads for server-side fetching
- do you have an idea? Let me know about it on github!

## License

MIT © [sleepingevil](https://github.com/sleepingevil)
