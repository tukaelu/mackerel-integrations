import { Handler, Context, Callback } from "aws-lambda";
import { CloudWatch } from "aws-sdk";
import { GetMetricStatisticsInput } from "aws-sdk/clients/cloudwatch";
import * as moment from "moment";
import Mackerel, { MackerelEnvironments } from "../../lib/mackerel";

export const AWS_SERVICES: Array<string> = [
  'AmazonApiGateway',
  'AmazonAthena',
  'AmazonCloudFront',
  'AmazonCloudWatch',
  'AmazonDynamoDB',
  'AmazonEC2',
  'AmazonElastiCache',
  'AmazonES',
  'AmazonRDS',
  'AmazonRoute53',
  'AmazonS3',
  'AmazonSNS',
  'AWSCloudTrail',
  'AWSConfig',
  'AWSDataTransfer',
  'AWSLambda',
  'AWSMarketplace',
  'AWSQueueService',
  'AWSGlue'
]

export const run: Handler =
  async (event: string, context: Context, callback: Callback) => {

    const env = {
      ACCESS_TOKEN: '',
      ...MackerelEnvironments,
      MACKEREL_METRIC_NAME: 'custom.AWS.billing',
      ...process.env
    }

    const cloudwatch = new CloudWatch({ region: 'us-east-1' })

    const payload = await Promise.all(AWS_SERVICES.map(async service => {
      const params: GetMetricStatisticsInput = {
        Namespace: 'AWS/Billing',
        MetricName: 'EstimatedCharges',
        Period: 28800,
        StartTime: moment().subtract(8, 'hours').toDate(),
        EndTime: moment().toDate(),
        Statistics: ['Maximum'],
        Dimensions: [
          { Name: 'Currency', Value: 'USD' },
          { Name: 'ServiceName', Value: `${service}` }
        ]
      }
      return await cloudwatch.getMetricStatistics(params).promise().then(data => {
        // skip if no Datapoints
        if (!data.Datapoints || (data.Datapoints && !data.Datapoints.length)) {
          return
        }
        // @ts-ignore
        // suppress warnings for refs to Datapoints
        return data.Datapoints.map(p => {
          return {
            name: `${env.MACKEREL_METRIC_NAME}.${service}`,
            time: moment().unix(),
            value: p.Maximum || 0
          }
        })[0]
      })
    }, []))

    const mackerel = new Mackerel(env.MACKEREL_API_KEY)
    const response = await mackerel.postServiceMetric(payload.filter(a => a), env.MACKEREL_SERVICE_NAME)
    callback(null, response.data)
  }
