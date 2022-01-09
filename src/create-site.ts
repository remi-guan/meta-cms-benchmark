import dotenv from 'dotenv';
import { siteSetting } from 'src/config';
import MetaCMSAxios from './axios-requests';

dotenv.config();

export default class Site {
  public configId: number = null;

  private readonly storageId: number;

  private readonly sitePrefix: string;

  constructor(sitePrefix: string, id: number) {
    this.storageId = id;
    this.sitePrefix = sitePrefix;
  }

  async submit() {
    const domainSetting = `${this.sitePrefix}-${this.storageId}`;

    const storeSetting = {
      storage: 'GitHub',
      username: process.env.GITHUB_USERNAME,
      repos: {
        storeRepo: `meta-space-${this.sitePrefix}-${this.storageId}`,
        publishRepo: `meta-space-${this.sitePrefix}-published-${this.storageId}`,
      },
    };

    const infoSetting = await MetaCMSAxios.newSiteInfo({
      title: siteSetting.title,
      subtitle: siteSetting.subtitle,
      description: siteSetting.description,
      author: siteSetting.author,
      keywords: siteSetting.keywords,
      favicon: new URL(siteSetting.favicon).href,
    });

    const configSetting = await MetaCMSAxios.newSiteConfig(
      infoSetting.data.id,
      {
        language: siteSetting.language,
        timezone: siteSetting.timezone,
        templateId: 1,
        metaSpacePrefix: domainSetting,
      },
    );

    await MetaCMSAxios.newSiteStorage(
      configSetting.data.id,
      storeSetting.storage.toLowerCase(),
      {
        userName: storeSetting.username,
        repoName: storeSetting.repos.storeRepo,
        branchName: 'master',
        dataType: 'HEXO',
        useGitProvider: true,
      },
    );

    await MetaCMSAxios.newSitePublish(
      configSetting.data.id,
      storeSetting.storage.toLowerCase(),
      {
        userName: storeSetting.username,
        repoName: storeSetting.repos.publishRepo,
        branchName: 'gh-pages',
        dataType: 'HEXO',
        useGitProvider: true,
        publishDir: 'public',
      },
    );

    this.configId = configSetting.data.id;
  }

  async deployAndPublish() {
    if (!this.configId) {
      throw new ReferenceError('No configId provided for this instance');
    } else {
      return MetaCMSAxios.deployAndPublish(this.configId);
    }
  }
}
