import { describe, before, it } from "mocha";
import { assert } from "chai";
import MockAdapter from "axios-mock-adapter";

import Mackerel from "../../lib/mackerel";

describe('Mackerel client test', () => {

  describe('Request mackerel api', () => {

    let mackerel: Mackerel,
        mock: MockAdapter

    before(() => {
      mackerel = new Mackerel('DummyApiKey')
      mock = new MockAdapter(mackerel.getAxiosInstance())
      mock
        .onPost('/api/v0/services/test/tsdb').reply(200)
    })

    it('post metric succeeded', async () => {
      const payload = {/* dummy */}
      const res = await mackerel.postServiceMetric(payload, 'test')
      assert.strictEqual(res.status, 200)
    })

  })
})
