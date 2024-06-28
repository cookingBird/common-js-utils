import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";


export class Request {
  instance: AxiosInstance;
  baseConfig: AxiosRequestConfig = {
    baseURL: "/",
  };

  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create(Object.assign(this.baseConfig, config));

    //响应拦截
    this.instance.interceptors.response.use(
      (res: AxiosResponse) => {
        const { data } = res;
        if (typeof data === "object" && data !== null)
        {
          switch (data.code)
          {
            case 401: {
              //用户登录过期
              return Promise.reject("用户信息已过期，请重新登录")
            }
          }
        }
        return res;
      },
      (err) => {
        let text = "";
        switch (err.response.status)
        {
          case 400:
            text = "请求错误(400)";
            break;
          case 401:
            text = "未授权，请重新登录(401)";
            break;
          case 403:
            text = "拒绝访问(403)";
            break;
          case 404:
            text = "请求出错(404)";
            break;
          case 408:
            text = "请求超时(408)";
            break;
          case 500:
            text = "服务器错误(500)";
            break;
          case 501:
            text = "服务未实现(501)";
            break;
          case 502:
            text = "网络错误(502)";
            break;
          case 503:
            text = "服务不可用(503)";
            break;
          case 504:
            text = "网络超时(504)";
            break;
          case 505:
            text = "HTTP版本不受支持(505)";
            break;
          default:
            text = `连接出错(${err.response.status})!`;
        }
        return Promise.reject(text);
      }
    );
  }

  public request<T = any>(config: AxiosRequestConfig): Promise<T> {
    return this.instance.request(config);
  };
}

/**
 * @deprecated
 */
export const request = new Request({});
