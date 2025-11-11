import wretch, { WretchOptions } from "wretch";

const client = wretch();

/**
 * Build query options
 */
const buildQueryOptions = (url: string, params?: Record<string, any>) => {
  if (params) {
    params = JSON.parse(JSON.stringify(params));
    if (url.includes("?")) {
      return url + "&" + new URLSearchParams(params).toString();
    }
    return url + "?" + new URLSearchParams(params).toString();
  }
  return url;
};

/**
 * Http request
 */
export const http = {
  /**
   * Get request
   */
  get: <T = Record<string, any>>(
    url: string,
    params?: Record<string, any>,
    options: WretchOptions = {}
  ) => {
    const requestUrl = buildQueryOptions(url, params);
    return client.url(requestUrl).options(options).get().json<T>();
  },

  /**
   * Post request
   */
  post: <T = Record<string, any>>(
    url: string,
    data?: Record<string, any>,
    options: WretchOptions = {}
  ) => {
    return client.url(url).options(options).post(data).json<T>();
  },

  /**
   * Put request
   */
  put: <T = Record<string, any>>(
    url: string,
    data?: Record<string, any>,
    options: WretchOptions = {}
  ) => {
    return client.url(url).options(options).put(data).json<T>();
  },

  /**
   * Delete request
   */
  delete: <T = Record<string, any>>(
    url: string,
    options: WretchOptions = {}
  ) => {
    return client.url(url).options(options).delete().json<T>();
  },
};
