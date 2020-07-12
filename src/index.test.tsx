import { GetDataProviderResult, DataContext, getDataProvider, useDataEffect } from ".";
import React, { useState, useEffect } from 'react';
import { render, RenderResult, act } from "@testing-library/react";
import { isServer } from "./utils/isServer";

jest.mock('./utils/isServer', () => ({
  isServer: jest.fn()
}));

describe('DataProvider', () => {
  let provider: GetDataProviderResult<{ getData: () => Promise<string> }>;

  describe('When on the server', () => {
    beforeEach(() => {
      (isServer as jest.Mock).mockReturnValue(true);
      provider = getDataProvider<{ getData: () => Promise<string> }>();
    });

    test('it should provide the getScript method that returns the script to inject pre-fetched data', async () => {
      const dataPromise = Promise.resolve('someData');
      const TestComponent: React.FC = () => {
        const { getData } = provider.useDataClient();
        const [data, setData] = useState<string>();

        useDataEffect(() => {
          const doEffect = async () => {
            setData(await getData())
          };

          doEffect();
        }, [])


        return <div>{data}</div>;
      };

      const context = {} as DataContext;

      const renderResult: RenderResult = render(<provider.DataProvider providers={{ getData: () => dataPromise }} dataContext={context}>
        <TestComponent />
      </provider.DataProvider>, {});

      expect(context).toHaveProperty('getScript', expect.any(Function));

      await act(async () => {
        expect(await context.getScript!()).toMatchSnapshot();
      });

      expect(renderResult.baseElement).toMatchSnapshot();
    });

    test('it should provide the getScript method that returns an empty script when no data was requested', async () => {
      const dataPromise = Promise.resolve('someData');
      const TestComponent: React.FC = () => {
        return <div></div>;
      };

      const context = {} as DataContext;

      const renderResult: RenderResult = render(<provider.DataProvider providers={{ getData: () => dataPromise }} dataContext={context}>
        <TestComponent />
      </provider.DataProvider>, {});

      expect(context).toHaveProperty('getScript', expect.any(Function));

      await act(async () => {
        expect(await context.getScript!()).toMatchSnapshot();
      });

      expect(renderResult.baseElement).toMatchSnapshot();
    });

    test('it should render without a context passed in', async () => {
      const dataPromise = Promise.resolve('someData');
      const TestComponent: React.FC = () => {
        return <div></div>;
      };

      const renderResult: RenderResult = render(<provider.DataProvider providers={{ getData: () => dataPromise }}>
        <TestComponent />
      </provider.DataProvider>, {});


      await act(async () => {
        await dataPromise;
      });

      expect(renderResult.baseElement).toMatchSnapshot();
    });
  });

  describe('When in the browser', () => {
    beforeEach(() => {
      (isServer as jest.Mock).mockReturnValue(false);
    });

    test('it should render consistently', async () => {
      provider = getDataProvider<{ getData: () => Promise<string> }>();
      const dataPromise = Promise.resolve('someData');
      const TestComponent: React.FC = () => {
        const { getData } = provider.useDataClient();
        const [data, setData] = useState<string>();

        useDataEffect(() => {
          const doEffect = async () => {
            setData(await getData())
          };

          doEffect();
        }, [])


        return <div>{data}</div>;
      };

      const renderResult = render(<provider.DataProvider providers={{ getData: () => dataPromise }}>
        <TestComponent />
      </provider.DataProvider>, {});

      await act(async () => {
        await dataPromise;
      });

      expect(renderResult.baseElement).toMatchSnapshot();
    });

    test('it should render consistently when state is pre-populated', async () => {
      (window as any).__dataProvider__ = {
        prefetchedState: {
          getData: 'someCachedData'
        }
      };

      provider = getDataProvider<{ getData: () => Promise<string> }>();

      const dataPromise = Promise.resolve('someData');
      const TestComponent: React.FC = () => {
        const { getData } = provider.useDataClient();
        const [data, setData] = useState<string>();

        useDataEffect(() => {
          const doEffect = async () => {
            setData(await getData())
          };

          doEffect();
        }, [])


        return <div>{data}</div>;
      };

      let renderResult: RenderResult;

      await act(async () => {
        renderResult = render(<provider.DataProvider providers={{ getData: () => dataPromise }}>
          <TestComponent />
        </provider.DataProvider>);
        await dataPromise;
      });

      expect(renderResult.baseElement).toMatchSnapshot();

      delete (window as any).__dataProvider__;
    });

    test('it should only use the cache once', async () => {
      (window as any).__dataProvider__ = {
        prefetchedState: {
          getData: 'someCachedData'
        }
      };

      provider = getDataProvider<{ getData: () => Promise<string> }>();

      const dataPromise = Promise.resolve('someData');
      const TestComponent: React.FC<{ shouldUpdate?: boolean }> = ({ shouldUpdate }) => {
        const { getData } = provider.useDataClient();
        const [updater, setUpdater] = useState(Math.random());
        const [data, setData] = useState<string>();

        useEffect(() => {
          if (shouldUpdate) {
            setUpdater(Math.random());
          }
        }, [shouldUpdate]);

        useDataEffect(() => {
          const doEffect = async () => {
            setData(await getData())
          };

          doEffect();
        }, [updater])


        return <div>{data}</div>;
      };

      let renderResult: RenderResult;

      await act(async () => {
        renderResult = render(<provider.DataProvider providers={{ getData: () => dataPromise }}>
          <TestComponent shouldUpdate />
        </provider.DataProvider>);
      });

      await act(async () => {
        renderResult.rerender(<provider.DataProvider providers={{ getData: () => dataPromise }}>
          <TestComponent shouldUpdate />
        </provider.DataProvider>);
        await dataPromise;
      });


      expect(renderResult.baseElement).toMatchSnapshot();

      delete (window as any).__dataProvider__;
    });
  });
})
