import baselog from 'ololog';

baselog.handleNodeErrors();
const log = baselog.configure({ locate: false, time: true }); // removes the code location tag

/**
 * This wrapper is used to print an additional
 * new line when the command is switched.
 * Use this decorator on any class, it applies modification to the **static** methods.
 * @param {Function} target
 */
function SeparateLinesStatically(target: Function) {
  let command: string = null;

  Object.getOwnPropertyNames(target).forEach((propertyName) => {
    const descriptor = Object.getOwnPropertyDescriptor(target, propertyName);
    const isMethod = descriptor.value instanceof Function;
    if (!isMethod) { return; }

    const originalMethod = descriptor.value;

    descriptor.value = function wrapped(...args: any[]) {
      if (command && command !== propertyName) {
        // print a new line here for any different command
        // eslint-disable-next-line no-console
        console.log();
      }
      command = propertyName;
      return originalMethod.apply(this, args);
    };

    Object.defineProperty(target, propertyName, descriptor);
  });
}

@SeparateLinesStatically
export default class Logger {
  static program(...args) {
    return log.blue.bright.apply(this, args);
  }

  static status(...args) {
    return log.blue.apply(this, args);
  }

  static publishing(...args) {
    return log.bright.green.apply(this, args);
  }

  static published(...args) {
    return log.green.apply(this, args);
  }

  static benchmark(...args) {
    return log.cyan.apply(this, args);
  }
}
