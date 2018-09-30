import { Handler, Context, Callback } from "aws-lambda";
import Axios, { AxiosResponse } from "axios";
import * as moment from "moment";

import Mackerel, { MackerelEnvironments } from "../lib/mackerel";

export interface Device {
  id: string;
  name: string;
  temperature_offset: number;
  humidity_offset: number;
  created_at: string;
  updated_at: string;
  firmware_version: string;
  newest_events: NewestEvents;
}
export interface NewestEvents {
  te: EventItem;
  hu: EventItem;
  il: EventItem;
}
export interface EventItem {
  value: number;
  created_at: string;
}

const Sensors = [
  { key: 'hu', name: 'humidity' },
  { key: 'te', name: 'temperature' },
  { key: 'il', name: 'illumination'}
]

export const run: Handler =
  async (event: string, context: Context, callback: Callback) => {

    const env = {
      ACCESS_TOKEN: '',
      ...MackerelEnvironments,
      MACKEREL_METRIC_NAME: 'custom.NatureRemo',
      ...process.env
    }

    const device = await Axios.request({
      baseURL: 'https://api.nature.global/',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${env.ACCESS_TOKEN}`
      },
      url: '/1/devices'
    }).then((r: AxiosResponse<Device>): Device => r.data[0])

    const payload = Sensors.map((sensor) => {
      return {
        name: `${env.MACKEREL_METRIC_NAME}.${sensor.name}.${device.name}`,
        time: moment().unix(),
        value: device.newest_events[`${sensor.key}`].val
      }
    })

    const mackerel: Mackerel = new Mackerel(env.MACKEREL_API_KEY)
    const response = await mackerel.postServiceMetric(payload, env.MACKEREL_SERVICE_NAME)
    callback(null, response.data)
  }
