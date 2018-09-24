import { Handler, Context, Callback } from "aws-lambda";
import { google, analytics_v3 } from "googleapis";
import { JWT } from "google-auth-library";
import * as moment from "moment";

import Mackerel from "../lib/mackerel";

const REQUESTED_SCOPES = [
  "https://www.googleapis.com/auth/analytics.readonly"
]

const env = {
  GA_PRIVATE_KEY: '',
  GA_CLIENT_EMAIL: '',
  GA_VIEW_ID: '',
  MACKEREL_API_KEY: '',
  MACKEREL_SERVICE_NAME: '',
  MACKEREL_METRIC_NAME: '',
  ...process.env
}

export const run: Handler =
  async (event: string, context: Context, callback: Callback) => {

    const analytics: analytics_v3.Analytics = google.analytics('v3')

    const activeUser: Number =
      await analytics.data.realtime.get(getParams())
        .then(r => Number(r.data.totalsForAllResults['rt:activeUsers']||0))

    const payload = [{
      name: env.MACKEREL_METRIC_NAME,
      time: moment().unix(),
      value: activeUser
    }]

    const mackerel: Mackerel = new Mackerel(env.MACKEREL_API_KEY)
    await mackerel.postServiceMetric(payload, env.MACKEREL_SERVICE_NAME)
  }

export const getParams = (): analytics_v3.Params$Resource$Data$Ga$Get => {

  const auth: JWT = new JWT(env.GA_CLIENT_EMAIL, undefined, env.GA_PRIVATE_KEY, REQUESTED_SCOPES)

  const params: analytics_v3.Params$Resource$Data$Ga$Get = {
    auth: auth,
    ids: `ga:${env.GA_VIEW_ID}`,
    'start-date': 'today',
    'end-date': 'today',
    metrics: 'rt:activeUsers'
  }
  return params
}
