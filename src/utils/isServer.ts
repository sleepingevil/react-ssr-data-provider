const IS_SERVER = typeof window === 'undefined';

export const isServer = () => IS_SERVER;
