import Axios, { AxiosInstance } from "axios";
import "reflect-metadata";
import { APIMeta, Method, RestPower } from "./api-meta";
import { APIKey } from "./const";
import {request} from "./request";

interface IRequestOption {
  full_response: boolean;
}

const default_option: IRequestOption = {
  full_response: false,
};

function newHTTPMethod(
  methodType: "post" | "get" | "options" | "delete" | "put" | "head" | "patch"
) {
  return function (
    path: string,
    option: IRequestOption = default_option
  ): MethodDecorator {
    return function <T>(
      target: Object,
      key: string | symbol,
      desc: TypedPropertyDescriptor<T>
    ) {
      if (!(target instanceof RestPower)) {
        throw Error("API class should extends RestPower");
      }
      const local_option = { ...default_option, ...option };
      const name = key as string;
      const meta: APIMeta =
        Reflect.getMetadata(APIKey, target.constructor) || new APIMeta();
      const method = meta.methods.get(name) || new Method(name, path);
      method.path = path;
      meta.methods.set(name, method);
      Reflect.defineMetadata(APIKey, meta, target.constructor);

      // 覆盖原有的函数方法
      desc.value = request(local_option, meta, name, methodType) as any;
    };
  };
}

export const Get = newHTTPMethod("get");
export const Post = newHTTPMethod("post");
export const Options = newHTTPMethod("options");
export const Delete = newHTTPMethod("delete");
export const Patch = newHTTPMethod("patch");

export const API = function (arg: {
  headers?: Record<any, any>;
  prefix?: string;
  psm?: string;
  client?: AxiosInstance;
}): ClassDecorator {
  return function (target) {
    if (!arg.client) {
      arg.client = Axios.create();
    }
    const meta =
      (Reflect.getMetadata(APIKey, target) as APIMeta) || new APIMeta();
    meta.prefix = arg.prefix || "";
    meta.client = arg.client;
    Reflect.defineMetadata(APIKey, meta, target);
  };
};
