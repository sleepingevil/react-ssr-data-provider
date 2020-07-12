# react-ssr-data-provider

> Type-safe isomorphic data provider to conveniently optimise data fetching during server-side and client-side rendering.

[![NPM](https://img.shields.io/npm/v/react-ssr-data-provider.svg)](https://www.npmjs.com/package/react-ssr-data-provider) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-ssr-data-provider
```

## Usage

#### First, create your DataProvider:

MyDataProvider.tsx
```tsx
import { getDataProvider } from 'react-ssr-data-provider';

export interface DataProviders {
  [key: string]: (...args: any[]) => Promise<any>; // TODO: I shouldn't need this... figure it out!
  getGreeting: (name: string) => Promise<string>;
}

export const { DataProvider: MyDataProvider, useDataClient: useMyDataClient } = getDataProvider<DataProviders>();
```

#### Set it up for the browser:

client.tsx
```tsx
import React from 'react';
import ReactDOM from 'react-dom';
import { MyDataProvider } from './MyDataProvider';

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
import App from './App';

const app = express();

app.get('*', (req, res) => {
  const renderedApp = renderToString(<MyDataProvider providers={{ getGreeting: (name) => Promise.resolve(`Hello ${name} from the server side. I'm probably doing an internal service or database call without going through the internet.`) }}>
    <App />
  </MyDataProvider>);
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
  const { getGreeting } = useMyDataClient();
  const [greeting, setGreeting] = useState<string>();

  useDataEffect(() => {
    const doEffect = async () => {
      setGreeting(await getGreeting('FooBar'));
    };

    doEffect();
  }, [getGreeting]);

  return <div>{greeting}</div>;
};

```

## License

MIT © [sleepingevil](https://github.com/sleepingevil)
