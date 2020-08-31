/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  DefaultSearchCapabilities,
  AbstractSearchStrategy,
} from '../../../../../../src/plugins/vis_type_timeseries/server';
import { getRollupSearchStrategy } from './rollup_search_strategy';
import { getRollupSearchCapabilities } from './rollup_search_capabilities';

export const registerRollupSearchStrategy = (addSearchStrategy: (searchStrategy: any) => void) => {
  const RollupSearchCapabilities = getRollupSearchCapabilities(DefaultSearchCapabilities);
  const RollupSearchStrategy = getRollupSearchStrategy(
    AbstractSearchStrategy,
    RollupSearchCapabilities
  );

  addSearchStrategy(new RollupSearchStrategy());
};
