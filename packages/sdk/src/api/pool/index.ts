import { ApiResponse } from "../type";
import { http } from "../request";
import { baseUrl } from "..";

export const getPoolList = async () => {
  return http.get<ApiResponse<any[]>>(`${baseUrl}/openapi/gateway/scan/market/list`);

}