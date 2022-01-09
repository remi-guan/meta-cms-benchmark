import axios from 'axios';
import { accessToken } from 'src/config';

const instance = axios.create({
  baseURL: 'https://meta-cms-api-dev.mttk.net',
  withCredentials: true,
  headers: {
    Cookie: `ucenter_access_token=${accessToken};`,
    'Content-Type': 'application/json',
  },
});

instance.interceptors.response.use((response) => response, (error) => {
  throw new Error(`Code: ${error.response.status}, ${error.response.data.message}`);
});

export default class MetaCMSAxios {
  private static instance = instance;

  public static async newSiteInfo(data) {
    return (await MetaCMSAxios.instance.post('/site/info', data)).data;
  }

  public static async newSiteConfig(siteInfoId: number, data) {
    return (
      await MetaCMSAxios.instance.post('/site/config', data, {
        params: {
          siteInfoId,
        },
      })
    ).data;
  }

  public static async newSiteStorage(configId: number, platform: string, body) {
    return (
      await MetaCMSAxios.instance.post(`/storage/${platform}`, body, {
        params: {
          configId,
        },
      })
    ).data;
  }

  public static async newSitePublish(configId: number, platform: string, body) {
    return (
      await MetaCMSAxios.instance.post(`/publisher/${platform}`, body, {
        params: {
          configId,
        },
      })
    ).data;
  }

  public static async deployAndPublish(configId: number) {
    return (
      await MetaCMSAxios.instance.post('/tasks/deploy-publish', { configId })
    ).data;
  }
}
