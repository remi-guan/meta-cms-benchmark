import {
  createSiteRequests,
  defaultSitePrefix,
  P90timeLimitInSeconds,
} from 'src/config';

import Site from 'src/create-site';
import Logger from 'src/logger';
import { msToTime, CurrentStorageIdStartup } from './utils';

(async function main() {
  const storageIdStartup = await CurrentStorageIdStartup.get();

  const sites: Site[] = [];

  const allUsedTimes: number[] = [];
  const requestStartTimes: { [key: number]: number } = {};

  Logger.program('Benchmark program started.');

  Logger.status(`Requests to be made: ${createSiteRequests}`);
  Logger.status('Submitting data to make ready for publishing...');

  for (let id = storageIdStartup; id < storageIdStartup + createSiteRequests; id++) {
    const site = new Site(defaultSitePrefix, id);
    sites.push(site);
  }

  // execute submitting requests
  await Promise.all(sites.map((site) => site.submit()));

  Logger.publishing('Ready for publishing.');
  Logger.publishing('Publishing sites, please wait...');

  const allStartTime = new Date();

  await Promise.all(sites.map((site) => {
    const id = site.configId;
    requestStartTimes[id] = (new Date()).getTime();
    return site.deployAndPublish().then((res) => {
      const endTime = new Date();
      const time: number = endTime.getTime() - requestStartTimes[id];
      allUsedTimes.push(time);
      Logger.published(`Request ID ${id} finished. Code: ${res.statusCode}`);
      Logger.published(`Time used (mm:ss.ms): ${msToTime(time)}`);
      // 如果需要固定并发数，那就在一个 callback 跑完后，由 callback 启动下一个并发
      // 用 if 判断当前id是否超限，可以继续启动下一个并发
      // 如果id超限，则不继续执行。类似递归的行为。由函数传入id来追踪进程
    });
  }));

  Logger.program('All requests are done.');

  Logger.benchmark(`Full time used (mm:ss.ms): ${msToTime(new Date().getTime() - allStartTime.getTime())}`);
  Logger.benchmark(`Average time used (mm:ss.ms): ${msToTime(
      allUsedTimes.reduce((x, y) => x + y) / createSiteRequests,
  )}`);
  Logger.benchmark(`percentage of time used < than ${P90timeLimitInSeconds} secs: ${
      (allUsedTimes.filter((e) => e < P90timeLimitInSeconds * 1000).length / allUsedTimes.length) * 100
  }%`);

  Logger.program('Benchmark program end.');

  // update the storage id
  await CurrentStorageIdStartup.set(storageIdStartup + createSiteRequests);
}());
