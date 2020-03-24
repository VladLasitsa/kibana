/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import Joi from 'joi';

/* eslint-disable @typescript-eslint/camelcase */
import { ids, exclude_export_details, file_name } from './schemas';
/* eslint-disable @typescript-eslint/camelcase */

export const exportTimelinesSchema = Joi.object({
  ids,
}).min(1);

export const exportTimelinesQuerySchema = Joi.object({
  file_name: file_name.default('export.ndjson'),
  exclude_export_details: exclude_export_details.default(false),
});
