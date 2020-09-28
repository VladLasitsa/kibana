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

import { ExpressionFunctionDefinition, KibanaDatatable, Render } from '../../expressions/public';

import { ChartType } from '../common';
import { VisParams } from './types';

const name = 'xy';

interface Arguments {
  type: ChartType;
  visConfig: string;
}
interface RenderValue {
  visType: string;
  visConfig: VisParams;
}

export type VisTypeXyExpressionFunctionDefinition = ExpressionFunctionDefinition<
  typeof name,
  KibanaDatatable,
  Arguments,
  Render<RenderValue>
>;

export const createVisTypeXyVisFn = (): VisTypeXyExpressionFunctionDefinition => ({
  name,
  type: 'render',
  context: {
    types: ['kibana_datatable'],
  },
  help: i18n.translate('visTypeXy.functions.vislib.help', {
    defaultMessage: 'Vislib visualization',
  }),
  args: {
    type: {
      types: ['string'],
      default: '""',
      help: 'xy vis type',
    },
    visConfig: {
      types: ['string'],
      default: '"{}"',
      help: 'xy vis config',
    },
  },
  fn(context, args) {
    const visConfig = JSON.parse(args.visConfig) as VisParams;

    return {
      type: 'render',
      as: 'visualization',
      value: {
        context,
        visData: context,
        visType: args.type,
        visConfig,
        params: {
          listenOnChange: true,
        },
      },
    };
  },
});
