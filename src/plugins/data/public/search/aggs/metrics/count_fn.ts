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

import { i18n } from '@kbn/i18n';
import { ExpressionFunctionDefinition } from '../../../../../expressions/public';
import { AggExpressionType, AggExpressionFunctionArgs, METRIC_TYPES } from '../';
import { getParsedValue } from '../utils/get_parsed_value';

const fnName = 'aggCount';

type Input = any;
type AggArgs = AggExpressionFunctionArgs<typeof METRIC_TYPES.COUNT>;
type Output = AggExpressionType;
type FunctionDefinition = ExpressionFunctionDefinition<typeof fnName, Input, AggArgs, Output>;

export const aggCount = (): FunctionDefinition => ({
  name: fnName,
  help: i18n.translate('data.search.aggs.function.metrics.count.help', {
    defaultMessage: 'Generates a serialized agg config for a count agg',
  }),
  type: 'agg_type',
  args: {
    id: {
      types: ['string'],
      help: i18n.translate('data.search.aggs.metrics.count.id.help', {
        defaultMessage: 'ID for this aggregation',
      }),
    },
    enabled: {
      types: ['boolean'],
      default: true,
      help: i18n.translate('data.search.aggs.metrics.count.enabled.help', {
        defaultMessage: 'Specifies whether this aggregation should be enabled',
      }),
    },
    schema: {
      types: ['string'],
      help: i18n.translate('data.search.aggs.metrics.count.schema.help', {
        defaultMessage: 'Schema to use for this aggregation',
      }),
    },
    json: {
      types: ['string'],
      help: i18n.translate('data.search.aggs.metrics.count.json.help', {
        defaultMessage: 'Advanced json to include when the agg is sent to Elasticsearch',
      }),
    },
  },
  fn: (input, args) => {
    const { id, enabled, schema, ...rest } = args;

    return {
      type: 'agg_type',
      value: {
        id,
        enabled,
        schema,
        type: METRIC_TYPES.COUNT,
        params: {
          ...rest,
          json: getParsedValue(args, 'json'),
        },
      },
    };
  },
});
