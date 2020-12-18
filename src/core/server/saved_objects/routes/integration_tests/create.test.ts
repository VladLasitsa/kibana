/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import supertest from 'supertest';
import { UnwrapPromise } from '@kbn/utility-types';
import { registerCreateRoute } from '../create';
import { savedObjectsClientMock } from '../../service/saved_objects_client.mock';
import { CoreUsageStatsClient } from '../../../core_usage_data';
import { coreUsageStatsClientMock } from '../../../core_usage_data/core_usage_stats_client.mock';
import { coreUsageDataServiceMock } from '../../../core_usage_data/core_usage_data_service.mock';
import { setupServer } from '../test_utils';

type SetupServerReturn = UnwrapPromise<ReturnType<typeof setupServer>>;

describe('POST /api/saved_objects/{type}', () => {
  let server: SetupServerReturn['server'];
  let httpSetup: SetupServerReturn['httpSetup'];
  let handlerContext: SetupServerReturn['handlerContext'];
  let savedObjectsClient: ReturnType<typeof savedObjectsClientMock.create>;
  let coreUsageStatsClient: jest.Mocked<CoreUsageStatsClient>;

  const clientResponse = {
    id: 'logstash-*',
    type: 'index-pattern',
    title: 'logstash-*',
    version: 'foo',
    references: [],
    attributes: {},
  };

  beforeEach(async () => {
    ({ server, httpSetup, handlerContext } = await setupServer());
    savedObjectsClient = handlerContext.savedObjects.client;
    savedObjectsClient.create.mockImplementation(() => Promise.resolve(clientResponse));

    const router = httpSetup.createRouter('/api/saved_objects/');
    coreUsageStatsClient = coreUsageStatsClientMock.create();
    coreUsageStatsClient.incrementSavedObjectsCreate.mockRejectedValue(new Error('Oh no!')); // intentionally throw this error, which is swallowed, so we can assert that the operation does not fail
    const coreUsageData = coreUsageDataServiceMock.createSetupContract(coreUsageStatsClient);
    registerCreateRoute(router, { coreUsageData });

    await server.start();
  });

  afterEach(async () => {
    await server.stop();
  });

  it('formats successful response and records usage stats', async () => {
    const result = await supertest(httpSetup.server.listener)
      .post('/api/saved_objects/index-pattern')
      .send({
        attributes: {
          title: 'Testing',
        },
      })
      .expect(200);

    expect(result.body).toEqual(clientResponse);
    expect(coreUsageStatsClient.incrementSavedObjectsCreate).toHaveBeenCalledWith({
      request: expect.anything(),
    });
  });

  it('requires attributes', async () => {
    const result = await supertest(httpSetup.server.listener)
      .post('/api/saved_objects/index-pattern')
      .send({})
      .expect(400);

    // expect(response.validation.keys).toContain('attributes');
    expect(result.body.message).toMatchInlineSnapshot(
      `"[request body.attributes]: expected value of type [object] but got [undefined]"`
    );
  });

  it('calls upon savedObjectClient.create', async () => {
    await supertest(httpSetup.server.listener)
      .post('/api/saved_objects/index-pattern')
      .send({
        attributes: {
          title: 'Testing',
        },
      })
      .expect(200);

    expect(savedObjectsClient.create).toHaveBeenCalledTimes(1);
    expect(savedObjectsClient.create).toHaveBeenCalledWith(
      'index-pattern',
      { title: 'Testing' },
      { overwrite: false, id: undefined, migrationVersion: undefined }
    );
  });

  it('can specify an id', async () => {
    await supertest(httpSetup.server.listener)
      .post('/api/saved_objects/index-pattern/logstash-*')
      .send({
        attributes: {
          title: 'Testing',
        },
      })
      .expect(200);

    expect(savedObjectsClient.create).toHaveBeenCalledTimes(1);

    const args = savedObjectsClient.create.mock.calls[0];
    expect(args).toEqual([
      'index-pattern',
      { title: 'Testing' },
      { overwrite: false, id: 'logstash-*' },
    ]);
  });
});
