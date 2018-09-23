import { describe, before, it } from "mocha";
import { assert } from "chai";
import * as nock from "nock";
import { Context, Callback } from "aws-lambda";
import * as MockContext from "aws-lambda-mock-context";

// dummy private key
process.env.GA_PRIVATE_KEY = "-----BEGIN RSA PRIVATE KEY-----\nMIIEpQIBAAKCAQEAuNX+GVONjhFwVnjDI1iYCqzt3cNI1I0GOYjAtB8iaoxyqf4Y\nYMEuIspbVRbX8jn3kDY/OP48Dbx4IemWnWQwybtzAyPJN+G0N95OFNNik1hrCmEj\nazZj4PEcRTxaQdli+zztAj9iMyTwDAA/d5Pw+DKcw6lIuBO3z96S+2GE2oU5prXD\nHBPoERPI9q18xXN8br9gDDU/qft0sDbb0V8adkazWKaq7913qlUVCQP6rXDI6cYp\nKJa+gIpq96IYqScoLdgKZ6sCLi3x3xYl5Xx35PuZBZrHZHaNJyLd16mfbX/TbHJU\nS/CbPOK7LxQkg2ZzJVGDF6Tm/ZatCFpnBQQDowIDAQABAoIBAHSO/d4awnmEpcLi\nBKyVgcu5oYbnT1Y6WGKPynXL7HgkeWqZweXB7MYjtdTCwwsNYwCeNOBL8rL21wsL\nst8t/1Y3zx97wbhrrKpOlg6r/s3MRDQXba5+bh277of6tzAvViv5D70LG3IFKRto\nTJ2rvZnG0PTSG/l49cEwKqA7rvvdVOJ701xaX6hsouCOpvD2R5KYQR36IiE2MYf9\n5ANnvYLNxivUDhGAcDpZP3Jo8UPnGCbu/VZWC8RVYGIpza/DCaDwDJ/e1P8SYExJ\nDRw5srI/V65cnnim2c8kAKpOv0vJKTBsMIRwJwUvXY+pYtEg5APhHfAfjfn2/a8H\nUF68bwECgYEA5jv5V6eYo4RFBPfeTAePOS7XG0vq5lyRQT+G91UI5m0Hc0HE8l9j\nAC3yWjT+DOdvFUyU2BS1OQjlCUoZA1ms+u88YTf7dbZ4IJ6NRLfjWHZ8tr/U83mK\nsXo0ZbIaM2AjkLPWo+uB5mMyRaQtjhlIYUHNRNFu3XQXjT1/+WDxC+sCgYEAzYVk\nX877ik5K4UADkqoWQpmaPxAzwE5auQ0V5qh3f5dmPnGzrD2IbjOt/g0oTAvTvT1o\nl+hzMwsDzcJ7zbGwuloZvkwPKMbBBUr7fb0RDVHXIQXraPIfk/twmfQbs6Sl96LF\nTyV1RpuCDxG+7ao359Y0QCZQNsVtVhEwqEa7kSkCgYEAvZzrD2ux5AlNJnhVFdyr\n8fZHpe1yOeJGpqwBJbVcrRliJ2QlJU+1ozI0BGLcUBhSfgIiG4uCbMSMjIf/7ahv\nNALPgWmvqRRr/sFVqyCfFf4PXBrE8PhKZzwz5wU1WtZ0s/nIbhvJUcqkXoKGGh9s\nYtzkhybM3Yl81A+wU9uo6Z0CgYEAv4tK+WBXX5eIgla+/bo39Opjr9LR6LEeLMnd\nV5Q7i1b3m8sswaK3vL29s8FfhUCgnwbUrH+gnjnt2Z8g85xgMc43n/wTRNW4n846\nhf3oHpnf/o8d0DmY5Lq7P0EbcFpLtHinnBQ1MRFOLe1EHQ0//XrOR9ttdx6ZwFVV\nHACQX8ECgYEAr//yXRr+uRFNVWN+DmS8RxC7X9Qyw29IGdZrF5v+sQGlH3vVhcrk\n3Bs+wSeHWbT8gVLEudylA/YUuk4NVjILoeuod4tBsoB2xuzYT4WpPbdOrEfWfC/8\n/6UJsE3vFty3JVNH2FyoKnw6rw6YJIE/VBU6nqdoBb8aPBnwNxaJ5J4=\n-----END RSA PRIVATE KEY-----\n"
process.env.GA_CLIENT_EMAIL = 'test@example.com'
process.env.GA_VIEW_ID = '12345678'
process.env.MACKEREL_API_KEY = "DUMMY_API_KEY"
process.env.MACKEREL_SERVICE_NAME = "analytics_test"
process.env.MACKEREL_METRIC_NAME = "GoogleAnalytics.activeUser"

import { run, getParams } from "../handlers/analytics";

describe('Google Analytics Handler', () => {

  before(() => {
    // mock google api
    nock('https://www.googleapis.com')
      .filteringRequestBody(body => '*')
      .post('/oauth2/v4/token', '*')
        .reply(200, {
          access_token: 'access_token',
          expiry_date: 0,
          id_token: undefined,
          refresh_token: 'jwt-placeholder'
        })
      .get('/analytics/v3/data/realtime')
        .query({
          'ids': 'ga:12345678',
          'start-date': 'today',
          'end-date': 'today',
          'metrics': 'rt:activeUsers'
        })
        .reply(200, {
          kind: 'analytics#realtimeData',
          id: 'https://www.googleapis.com/analytics/v3/data/realtime?ids=ga:12345678&metrics=rt:activeUsers',
          query: { ids: 'ga:12345678', metrics: [], 'max-results': 1000 },
          totalResults: 1,
          selfLink: 'https://www.googleapis.com/analytics/v3/data/realtime?ids=ga:12345678&metrics=rt:activeUsers',
          profileInfo: {
            profileName: 'すべてのウェブサイトのデータ',
            tableId: 'realtime:12345678'
          },
          totalsForAllResults: { 'rt:activeUsers': '123' },
        })

    // mock mackerel api
    const scope = nock('https://mackerel.io/')
      .filteringRequestBody(body => {
        let a = eval(body)[0]
        delete a.time
        return a
      })
      .post(`/api/v0/services/${process.env.MACKEREL_SERVICE_NAME}/tsdb`, {
        name: 'GoogleAnalytics.activeUser',
        value: 123
      })
      .reply(200, { success: true })
  })

  it('pass getParams', () => {
    const params = getParams()
    assert.equal(params.ids, 'ga:12345678')
  })

  it('run post active user', async () => {
    const context: Context = MockContext(),
          callback: Callback = () => {}

    const res = await run('test', context, callback)
    assert.strictEqual(res.status, 200)
    assert.strictEqual(res.data.success, true)
  })
})
