import { getDataProvider } from 'react-ssr-data-provider';

export interface DataProviders {
  [key: string]: (...args: any[]) => Promise<any>; // TODO: I shouldn't need this... figure it out!
  getGreeting: (name: string) => Promise<string>;
}

export const { DataProvider: MyDataProvider, useDataClient: useMyDataClient } = getDataProvider<DataProviders>();