interface Window {
  __SBN_AUTH__?: {
    getAccessToken: () => string | null;
    setAccessToken: (token: string | null) => void;
    clear: () => void;
  };
}
