/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import Hapi from 'hapi';
import { DETECTION_ENGINE_SIGNALS_STATUS_URL } from '../../../../../common/constants';
import { LegacyServices } from '../../../../types';
import { GetScopedClients } from '../../../../services';
import { SignalsStatusRequest } from '../../signals/types';
import { setSignalsStatusSchema } from '../schemas/set_signal_status_schema';
import { transformError, getIndex } from '../utils';

export const setSignalsStatusRouteDef = (
  config: LegacyServices['config'],
  getClients: GetScopedClients
): Hapi.ServerRoute => {
  return {
    method: 'POST',
    path: DETECTION_ENGINE_SIGNALS_STATUS_URL,
    options: {
      tags: ['access:siem'],
      validate: {
        options: {
          abortEarly: false,
        },
        payload: setSignalsStatusSchema,
      },
    },
    async handler(request: SignalsStatusRequest) {
      const { signal_ids: signalIds, query, status } = request.payload;
      const { clusterClient, spacesClient } = await getClients(request);
      const index = getIndex(spacesClient.getSpaceId, config);

      let queryObject;
      if (signalIds) {
        queryObject = { ids: { values: signalIds } };
      }
      if (query) {
        queryObject = {
          bool: {
            filter: query,
          },
        };
      }
      try {
        return clusterClient.callAsCurrentUser('updateByQuery', {
          index,
          body: {
            script: {
              source: `ctx._source.signal.status = '${status}'`,
              lang: 'painless',
            },
            query: queryObject,
          },
        });
      } catch (exc) {
        // error while getting or updating signal with id: id in signal index .siem-signals
        return transformError(exc);
      }
    },
  };
};

export const setSignalsStatusRoute = (
  route: LegacyServices['route'],
  config: LegacyServices['config'],
  getClients: GetScopedClients
) => {
  route(setSignalsStatusRouteDef(config, getClients));
};
