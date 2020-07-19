describe('isServer()', () => {
  const originalWindow = global.window

  afterEach(() => {
    jest.resetModules()
    global.window = originalWindow
  })
  ;[true, false].forEach((expectation) => {
    test(`it should return ${expectation}`, () => {
      if (expectation) {
        delete global.window
      }
      const isServer = require('./isServer').isServer
      expect(isServer()).toBe(expectation)
    })
  })
})
