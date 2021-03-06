import { Handler, Context, Callback } from "aws-lambda";
import Axios from "axios";
import * as moment from "moment";

import Mackerel, { MackerelEnvironments } from "../lib/mackerel";

export const Origin: string = 'http://api.b.st-hatena.com'
export const Endpoint: string = '/entry.total_count'

const env = {
  BOOKMARK_URL: '',
  ...MackerelEnvironments,
  ...process.env
}

export const run: Handler =
  async (event: string, context: Context, callback: Callback) => {

    const total_bookmarks: Number = await Axios.request({
      baseURL: Origin,
      url: Endpoint,
      params: { url: env.BOOKMARK_URL }
    }).then(r => Number(r.data.total_bookmarks))

    const payload = [{
      name: env.MACKEREL_METRIC_NAME,
      time: moment().unix(),
      value: total_bookmarks
    }]

    const mackerel: Mackerel = new Mackerel(env.MACKEREL_API_KEY)
    const response = await mackerel.postServiceMetric(payload, env.MACKEREL_SERVICE_NAME)
    callback(null, response.data)
  }
