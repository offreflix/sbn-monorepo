let accessToken: string | null = null;

export type SbnAuthBridge = {
  getAccessToken: () => string | null;
  setAccessToken: (token: string | null) => void;
  clear: () => void;
};

export function getAuthBridge(): SbnAuthBridge {
  if (!window.__SBN_AUTH__) {
    window.__SBN_AUTH__ = {
      getAccessToken: () => accessToken,
      setAccessToken: (token: string | null) => {
        accessToken = token;
      },
      clear: () => {
        accessToken = null;
      },
    };
  }

  return window.__SBN_AUTH__;
}
