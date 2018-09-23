import { describe, before, it } from "mocha";
import { assert } from "chai";
import * as nock from "nock";

import Mackerel, { Origin } from "../../lib/mackerel";

const API_KEY = "DUMYY_API_KEY"
const SERVICE_NAME = 'test'

describe('Mackerel client test', () => {

  describe('Request mackerel api', () => {

    const mackerel: Mackerel = new Mackerel(API_KEY)

    before(() => {
      nock(Origin)
        .filteringRequestBody((body) => eval(body))
        .post(`/api/v0/services/${SERVICE_NAME}/tsdb`, [{
          name: 'METRIC_NAME',
          time: 0,
          value: 123
        }])
        .reply(200, { success: true })
    })

    it('post metric succeeded', async () => {
      const payload = [{
        name: 'METRIC_NAME',
        time: 0,
        value: 123
      }]
      const res = await mackerel.postServiceMetric(payload, SERVICE_NAME)
      assert.strictEqual(res.status, 200)
      assert.strictEqual(res.data.success, true)
    })
  })
})
