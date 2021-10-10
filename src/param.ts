import { APIKey, ParamLocation } from "./const";
import { APIMeta, Method } from "./api-meta";

const parameter = function (
  add_rule: (m: Method, index: number) => void
): ParameterDecorator {
  return function (target, key, index) {
    const meta =
      (Reflect.getMetadata(APIKey, target.constructor) as APIMeta) ||
      new APIMeta();
    const method_name = key as string;
    if (!meta.methods.has(key as string)) {
      meta.methods.set(method_name, new Method(method_name, ""));
    }
    const method = meta.methods.get(method_name)!;
    add_rule(method, index);
    Reflect.defineMetadata(APIKey, meta, target.constructor);
  };
};

export const Query = function (name?: string): ParameterDecorator {
  return parameter((m, i) => {
    m.addRule(name || "", ParamLocation.QUERY, i);
  });
};

export const Body = function (): ParameterDecorator {
  return parameter((m, i) => {
    m.addRule(i.toString(), ParamLocation.BODY, i);
  });
};

export const Path = function (name?: string): ParameterDecorator {
  return parameter((m, i) => {
    m.addRule(name || i.toString(), ParamLocation.PATH, i);
  });
};

export const Header = function (name?: string): ParameterDecorator {
  return parameter((m, i) => {
    m.addRule(name || "", ParamLocation.HEADER, i);
  });
};
