import axios, { AxiosInstance } from "axios";

const Origin: string = "https://mackerel.io/"
const ContentType: string = "application/json"

const MackerelApiConfig = {
  baseURL: Origin,
  headers: {
    'Content-Type': ContentType
  }
}

export default class Mackerel {

  private apiKey: string
  private axios: AxiosInstance

  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.axios = axios.create({
      ...MackerelApiConfig,
      headers: { 'X-Api-Key': this.apiKey }
    })
  }

  async postServiceMetric(payload: any, serviceName: string) {
    const config = {
      data: payload
    }
    return await this.axios.post(`/api/v0/services/${serviceName}/tsdb`, config)
  }

  getAxiosInstance(): AxiosInstance {
    return this.axios
  }
}
