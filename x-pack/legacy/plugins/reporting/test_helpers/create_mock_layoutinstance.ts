/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { LayoutTypes } from '../export_types/common/constants';
import { createLayout } from '../export_types/common/layouts';
import { LayoutInstance } from '../export_types/common/layouts/layout';
import { CaptureConfig } from '../server/types';

export const createMockLayoutInstance = (captureConfig: CaptureConfig) => {
  const mockLayout = createLayout(captureConfig, {
    id: LayoutTypes.PRESERVE_LAYOUT,
    dimensions: { height: 12, width: 12 },
  }) as LayoutInstance;
  mockLayout.selectors = {
    renderComplete: 'renderedSelector',
    itemsCountAttribute: 'itemsSelector',
    screenshot: 'screenshotSelector',
    timefilterDurationAttribute: 'timefilterDurationSelector',
  };
  return mockLayout;
};
