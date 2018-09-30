import axios, { AxiosInstance } from "axios";

export const Origin: string = "https://mackerel.io/"
export const ContentType: string = "application/json"

export const MackerelEnvironments: any = {
  MACKEREL_API_KEY: '',
  MACKEREL_SERVICE_NAME: '',
  MACKEREL_METRIC_NAME: ''
}

export default class Mackerel {

  private apiKey: string
  private axios: AxiosInstance

  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.axios = axios.create({
      baseURL: Origin,
      headers: {
        'Content-Type': ContentType,
        'X-Api-Key': this.apiKey
      }
    })
  }

  async postServiceMetric(payload: any, serviceName: string): Promise<any> {
    const requestConfig = {
      method: 'post',
      url: `/api/v0/services/${serviceName}/tsdb`,
      data: payload
    }
    return await this.axios.request(requestConfig)
  }
}
