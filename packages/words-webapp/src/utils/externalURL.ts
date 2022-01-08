export enum ExternalURL {
  discord,
  twitter,
  notion,
  discourse,
}

export const externalURL = (externalURL: ExternalURL) => {
  switch (externalURL) {
    case ExternalURL.discord:
      return 'http://discord.gg/words';
    case ExternalURL.twitter:
      return 'https://twitter.com/wordsdao';
    case ExternalURL.notion:
      return 'https://words.notion.site/Explore-Words-a2a9dceeb1d54e10b9cbf3f931c2266f';
    case ExternalURL.discourse:
      return 'https://discourse.words.wtf/';
  }
};
