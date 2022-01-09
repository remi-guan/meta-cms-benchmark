import baselog from 'ololog';
import Site from 'src/create-site';
import {
  createSiteRequests,
  defaultSitePrefix,
  P90timeLimitInSeconds,
} from 'src/config';
import { msToTime, CurrentStorageIdStartup } from './utils';

const log = baselog.configure({ locate: false, time: true }); // removes the code location tag

(async function main() {
  const storageIdStartup = await CurrentStorageIdStartup.get();

  const sites: Site[] = [];

  const allUsedTimes: number[] = [];
  const requestStartTimes: { [key: number]: number } = {};

  log.blue.bright('Benchmark program started.', '\n');
  log.blue(`Requests to be made: ${createSiteRequests}`);
  log.blue('Submitting data to make ready for publishing...', '\n');

  for (let id = storageIdStartup; id < storageIdStartup + createSiteRequests; id++) {
    const site = new Site(defaultSitePrefix, id);
    sites.push(site);
  }

  // execute submitting requests
  await Promise.all(sites.map((site) => site.submit()));

  log.bright.green('Ready for publishing.');
  log.bright.green('Start to publish the sites.', '\n');

  const allStartTime = new Date();

  await Promise.all(sites.map((site) => {
    const id = site.configId;
    requestStartTimes[id] = (new Date()).getTime();
    return site.deployAndPublish().then((res) => {
      const endTime = new Date();
      const time: number = endTime.getTime() - requestStartTimes[id];
      allUsedTimes.push(time);
      log.green(`Request ID ${id} finished. Code: ${res.statusCode}`);
      log.cyan(`Time used (mm:ss.ms): ${msToTime(time)}`, '\n');
      // 如果需要固定并发数，那就在一个 callback 跑完后，由 callback 启动下一个并发
      // 用 if 判断当前id是否超限，可以继续启动下一个并发
      // 如果id超限，则不继续执行。类似递归的行为。由函数传入id来追踪进程
    });
  }));

  log.bright.blue('All requests are done.');

  log.cyan(`Full time used (mm:ss.ms): ${msToTime(new Date().getTime() - allStartTime.getTime())}`);
  log.cyan(`Average time used (mm:ss.ms): ${msToTime(
      allUsedTimes.reduce((x, y) => x + y) / createSiteRequests,
    )}`, '\n');

  log.cyan(`percentage of time used < than (${P90timeLimitInSeconds} secs): ${
      (allUsedTimes.filter((e) => e < P90timeLimitInSeconds * 1000).length / allUsedTimes.length) * 100
    }%`);

  log.bright.blue('\nBenchmark program end.');

  // update the storage id
  await CurrentStorageIdStartup.set(storageIdStartup + createSiteRequests);
}());
