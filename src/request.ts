import { APIMeta, RestPower } from "./api-meta";
import Axios, { AxiosResponse, Method as MethodType } from "axios";
import templateFormat from "string-template";

export function request(
  local_option: { full_response: boolean },
  meta: APIMeta,
  methodName: string,
  methodType: MethodType
) {
  return async function (this: RestPower) {
    const method = meta.methods.get(methodName)!;
    const {
      bodyParams,
      pathTemplateArg,
      queryParams,
      headerParams,
    } = method.processArgs(arguments);
    const formatedPath = templateFormat(method.path, pathTemplateArg);

    let url = `${meta.prefix}${formatedPath}`;
    const cancelToken = Axios.CancelToken.source();
    this.registerCanceller(cancelToken.cancel);
    return meta
      .client!.request({
        url,
        method: methodType,
        data: bodyParams,
        params: queryParams,
        cancelToken: cancelToken.token,
        headers: {  ...meta.headers, ...headerParams },
      })
      .then((resp: AxiosResponse<any>) => {
        if (local_option.full_response) {
          return Promise.resolve(resp);
        } else {
          return Promise.resolve(resp.data);
        }
      })
      .catch((err) => {
        if (Axios.isAxiosError(err)) {
          if (err.response) {
            // Axios 的错误栈基本对 debug 无帮助
            const { stack } = new Error();
            err.stack = stack!;
          }
        }
        throw err;
      })
      .finally(() => {
        this.removeCanceller(cancelToken.cancel);
      });
  };
}
