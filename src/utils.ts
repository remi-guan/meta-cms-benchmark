export function msToTime(duration: number) {
  const milliseconds = Math.floor((duration % 1000) / 100);
  let seconds: string | number = Math.floor((duration / 1000) % 60);
  let minutes: string | number = Math.floor((duration / (1000 * 60)) % 60);

  minutes = minutes < 10 ? `0${minutes}` : minutes;
  seconds = seconds < 10 ? `0${seconds}` : seconds;
  return `${minutes}:${seconds}.${milliseconds}`;
}
