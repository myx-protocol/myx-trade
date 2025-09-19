import { $fetch } from "@/api/request";
import { MyxBase } from "../base";
import { BASE_URL } from "@/config/url";

export class MyxPosition extends MyxBase {
  constructor() {
    super();
    this.getConfig();
  }

  async getPositions () {
    const rs = await $fetch("GET", `${BASE_URL}/v2/mx-scan/position/list`);

    return rs.data || []
  }
}