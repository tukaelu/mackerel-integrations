import { describe, before, it } from "mocha";
import { assert } from "chai";
import * as nock from "nock";
import { Context, Callback } from "aws-lambda";
import * as MockContext from "aws-lambda-mock-context";

const DUMMY_SITE_URL: string = 'http://example.com/'
process.env.BOOKMARK_URL = DUMMY_SITE_URL
process.env.MACKEREL_API_KEY = "DUMMY_API_KEY"
process.env.MACKEREL_SERVICE_NAME = "hatebu_test"
process.env.MACKEREL_METRIC_NAME = "はてなブックマーク数推移.total-bookmarks"

import { run, Origin as Hatebu_Origin, Endpoint as Hatebu_Endpoint } from "../handlers/hatebu-total-bookmarks";
import { Origin as Mackerel_Origin } from "../lib/mackerel";

describe('Hatena bookmark Handler', () => {

  // mock hatena bookmark api
  nock(Hatebu_Origin)
    .get(Hatebu_Endpoint)
      .query({
        url: DUMMY_SITE_URL
      })
      .reply(200, {
        url: DUMMY_SITE_URL,
        total_bookmarks: 1009
      })

  // mock mackerel api
  nock(Mackerel_Origin)
    .filteringRequestBody(body => {
      let a = eval(body)[0]
      delete a.time
      return a
    })
    .post(`/api/v0/services/${process.env.MACKEREL_SERVICE_NAME}/tsdb`, {
      name: process.env.MACKEREL_METRIC_NAME,
      value: 1009
    })
      .reply(200, { success: true })

  it('', async () => {
    const context: Context = MockContext()

    await run('test', context, (err, result) => {
      assert.isNull(err)
      assert.strictEqual(result.status, 200)
      assert.strictEqual(result.data.success, true)
    })
  })
})
