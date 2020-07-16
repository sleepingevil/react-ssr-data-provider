import React, { createContext, useContext, EffectCallback, DependencyList, useMemo, useEffect } from 'react';
import { isServer } from './utils/isServer';

const mergeAll = (...args: any[]) => args.reduce((result, arg) => ({ ...result, ...arg }), {});

export type DataContext = Partial<Pick<SSRDataContextBase, 'getScript'>>;

export interface GetDataProviderResult<T> {
  DataProvider: React.FC<{ providers: T, dataContext?: DataContext }>;
  useDataClient: () => T;
  // withDataProvider: React.FC; TODO: Implement this if it becomes a public npm package
}

export interface SSRDataRequest<T> {
  name: string;
  request: Promise<T>;
}

export interface SSRDataContextBase {
  getScript: () => Promise<string>;
  ssrDataRequests: SSRDataRequest<any>[];
}

export type DataClientBase = Record<string, (...args: any[]) => Promise<any>>;

export const getDataProvider = <T extends DataClientBase>(): GetDataProviderResult<T> => {
  const SSRDataContext = createContext<SSRDataContextBase & T>({} as SSRDataContextBase & T);
  const ClientDataContext = createContext<T>({} as T);
  if (isServer()) {
    const useDataClient = (): T => useContext(SSRDataContext);

    const context: SSRDataContextBase & T = {
      ssrDataRequests: [],
      getScript: async (): Promise<string> => {
        // Preload data for client-side rendering
        const dataRequests = context!.ssrDataRequests!.map(async ({ request, name }: any) => {
          return {
            [name]: await request
          };
        });

        if (dataRequests && dataRequests.length) {
          const dataObjects = await Promise.all(dataRequests);
          const combinedDataObject = JSON.stringify(mergeAll(...dataObjects));
          return `<script>window.__dataProvider__ = {prefetchedState: ${combinedDataObject}}</script>`;
        }

        return '';
      }
    } as unknown as SSRDataContextBase & T;

    const result: GetDataProviderResult<T> = {
      DataProvider: ({ children, providers, dataContext }) => {
        Reflect.ownKeys(providers).filter(v => typeof v === 'string').forEach(key => {
          // @ts-ignore TODO: find a way to do this without errors
          context[key] = (...args) => {
            context.ssrDataRequests.push({
              // @ts-ignore TODO: find a way to do this without errors
              name: key,
              // @ts-ignore TODO: find a way to do this without errors
              request: providers[key](...args)
            });
            return Promise.resolve();
          };
        });

        if (dataContext) {
          dataContext.getScript = () => context.getScript();
        }

        return <SSRDataContext.Provider value={context}>{children}</SSRDataContext.Provider>;
      },
      useDataClient
    };
    return result;
  } else {
    const initialData: { prefetchedState: { [key: string]: any } } | undefined = getInitialState();
    let oneTimeCache = initialData ? initialData.prefetchedState : {};

    const context: T = {} as T;

    const useDataClient = (): T => useContext(ClientDataContext);

    return {
      DataProvider: ({ children, providers }) => {
        Reflect.ownKeys(providers).filter(v => typeof v === 'string').forEach(key => {
          // @ts-ignore TODO: find a way to do this without errors
          context[key] = (...args) => {
            // @ts-ignore TODO: find a way to do this without errors
            if (oneTimeCache[key]) {
              // @ts-ignore TODO: find a way to do this without errors
              const cacheResponse: Promise<any> = Promise.resolve(oneTimeCache[key]);
              // @ts-ignore TODO: find a way to do this without errors
              delete oneTimeCache[key];
              return cacheResponse;
            }

            // @ts-ignore TODO: find a way to do this without errors
            return providers[key](...args);
          };
        });

        return <ClientDataContext.Provider value={context}>{children}</ClientDataContext.Provider>
      },
      useDataClient
    }
  }
}

export const useDataEffect = async (handler: EffectCallback, deps?: DependencyList) => {
  if (isServer()) {
    useMemo(handler, deps);
  }
  else {
    useEffect(handler, deps);
  }
};

function getInitialState(): { prefetchedState: { [key: string]: any; }; } | undefined {
  return (window as any).__dataProvider__;
}

