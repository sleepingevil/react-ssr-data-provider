import React, { useState, useCallback } from 'react';
import { useMyDataClient } from './MyDataProvider';
import { useDataEffect } from 'react-ssr-data-provider';

const App: React.FC = () => {
  const { getGreeting } = useMyDataClient();
  const [greeting, setGreeting] = useState<string>('');

  const update = useCallback(async () => {
    setGreeting(await getGreeting('FooBar'));
  }, [setGreeting, getGreeting]);

  useDataEffect(() => {
    update();
  }, [getGreeting]);

  return <div>
    <div>{greeting}</div>
    <button onClick={update}>Fetch data again</button>
  </div>;
};

export default App;