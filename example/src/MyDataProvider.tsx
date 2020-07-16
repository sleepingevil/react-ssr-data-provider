import { getDataProvider, DataClientBase } from 'react-ssr-data-provider';

export interface MyDataClient extends DataClientBase {
  getGreeting: (name: string) => Promise<string>;
}

export const { DataProvider: MyDataProvider, useDataClient: useMyDataClient } = getDataProvider<MyDataClient>();