import { AxiosInstance } from "axios";
import { ParamLocation } from "./const";

export function R<T>() {
  return Promise.resolve({} as T);
}

export class ParamRule {
  constructor(
    public name: string,
    public location: ParamLocation,
    public index: number
  ) {}
}

export class Method {
  rules: ParamRule[] = [];
  init: boolean = false;
  constructor(public name: string, public path: string) {}
  addRule(name: string, loc: ParamLocation, index: number) {
    this.rules = [new ParamRule(name, loc, index), ...this.rules];
  }
  processArgs(args: ArrayLike<any>) {
    if (!this.init) {
      this.rules.sort((a, b) => a.index - b.index);
      this.init = true;
    }
    const queryParams: Record<string, any> = {};
    let pathIndex = 0;
    let bodyParams = undefined;
    const pathTemplateArg: Record<string, any> = {};
    const headerParams: Record<string, string> = {};
    // 处理请求参数
    this.rules.forEach((r, index) => {
      if (r.location === ParamLocation.QUERY) {
        if (r.name !== "") {
          queryParams[r.name] = args[index];
        } else {
          if (typeof args[index] === "object") {
            Object.assign(queryParams, args[index]);
          } else {
            queryParams[args[index]] = "";
          }
        }
      } else if (r.location === ParamLocation.PATH) {
        if (r.name) {
          pathTemplateArg[r.name] = args[index];
        } else {
          pathTemplateArg[pathIndex++] = args[index];
        }
      } else if (r.location === ParamLocation.BODY) {
        bodyParams = args[index];
      } else if (r.location === ParamLocation.HEADER) {
        if (r.name !== "") {
          headerParams[r.name] = args[index];
        } else {
          if (typeof args[index] === "object") {
            Object.assign(headerParams, args[index]);
          }
        }
      }
    });
    return { bodyParams, queryParams, headerParams, pathTemplateArg };
  }
}

export class RestPower {
  protected cancellers: Set<Function> = new Set();

  protected registerCanceller(func: Function) {
    this.cancellers.add(func);
  }

  protected removeCanceller(func: Function) {
    this.cancellers.delete(func);
  }

  cancelAll() {
    for (const canceler of this.cancellers) {
      canceler();
    }
    this.cancellers.clear();
  }
}

export class APIMeta {
  prefix: string = "";
  headers?: Record<string, string>;
  client?: AxiosInstance;
  methods: Map<string, Method> = new Map();
}
