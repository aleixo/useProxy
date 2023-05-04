import { useMemo } from "react";

class Singleton {
  constructor() {
    this.proxies = {};
    this.setcbs = {};
  }

  init(ops) {
    this.proxy(ops);

    if (this.proxies[ops.id]) return this.proxies[ops.id];

    this.proxies[ops.id] = new Proxy(ops.value, {
      set: (target, property, value, receiver) => {
        target[property] = value;

        (this.setcbs[ops.id] || []).forEach((cb) =>
          cb(this.proxies[ops.id], target, property, value)
        );
        return true;
      },
    });

    return this.proxies[ops.id];
  }

  proxy(ops) {
    if (!ops.cb) return this.proxies[ops.id];

    this.setcbs[ops.id] = [...(this.setcbs[ops.id] || []), ops.cb];
    return this.proxies[ops.id];
  }
}

const singleton = new Singleton();

const useProxy = (id, value, cb) => {
  const proxy = useMemo(() => {
    if (!value) {
      return singleton.proxy({
        id,
        cb,
      });
    }
    return singleton.init({
      id,
      value,
      cb,
    });
  }, []);

  return proxy;
};

export default useProxy;
