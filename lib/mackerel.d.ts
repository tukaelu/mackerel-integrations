import { AxiosInstance } from "axios";

export interface MackerelApiRequestConfig {
  baseURL: string,
  headers: MackerelApiRequestHeaders
}

export interface MackerelApiRequestHeaders {
  'Content-Type': string,
  'X-Api-Key': string
}

export interface Mackerel {
  apiKey: string
  axios: AxiosInstance
  postServiceMetric<T = any>(payload: any, serviceName: string): Promise<T>
}
