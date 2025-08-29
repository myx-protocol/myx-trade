// pool list [scan]
// pool info
"use client";

// import { getActiveLocale } from "base/src/i18n";
import { ErrorCode, ObjectType } from "@/api/type";

export function $fetch(
  method: "GET" | "POST",
  url: string,
  data?: ObjectType<any>,
) {
  return fetch(url, {
    method,
    headers: {
      Accept: "application/json,text/plain,*/*",
      "Content-Type": "application/json",
      "Access-Control-Allow-credentials": "true",
      // "Accept-Language": getActiveLocale(),
      // "myx-signature-account":
      //   store.getState().account?.account?.address ?? undefined,
    } as any,
    body: method === "GET" || !data ? undefined : JSON.stringify(data),
  })
    .then((res) => {
      if (res.status === 200) {
        return res.json();
      } else {
        return Promise.reject(res);
      }
    })
    .then((data) => {
      console.log(data);
      if (
        data.code === ErrorCode.SUCCESS ||
        data.code === ErrorCode.SUCCESS_ORIGIN
      ) {
        return Promise.resolve(data);
      } else {
        // 判断token是否存在，如果存在说明需要更新token
        return Promise.reject(data);
      }
    })
    .catch((e) => {
      // console.error(e)
      // todo toast error message
      console.error(e.message);
      return Promise.reject(e);
    });
}
