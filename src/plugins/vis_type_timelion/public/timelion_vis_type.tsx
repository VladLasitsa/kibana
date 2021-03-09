/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { lazy } from 'react';
import { i18n } from '@kbn/i18n';

import { DefaultEditorSize } from '../../vis_default_editor/public';
import { IndexPattern } from '../../data/public';
import { TimelionOptionsProps } from './timelion_options';
import { TimelionVisDependencies } from './plugin';
import { toExpressionAst } from './to_ast';
import { getIndexPatterns } from './helpers/plugin_services';

import { extractIndexesFromExpression } from '../common/utils';

import { VIS_EVENT_TO_TRIGGER, VisParams } from '../../visualizations/public';

const TimelionOptions = lazy(() => import('./timelion_options'));

export const TIMELION_VIS_NAME = 'timelion';

export function getTimelionVisDefinition(dependencies: TimelionVisDependencies) {
  // return the visType object, which kibana will use to display and configure new
  // Vis object of this type.
  return {
    name: TIMELION_VIS_NAME,
    title: 'Timelion',
    icon: 'visTimelion',
    description: i18n.translate('timelion.timelionDescription', {
      defaultMessage: 'Show time series data on a graph.',
    }),
    visConfig: {
      defaults: {
        expression: '.es(*)',
        interval: 'auto',
      },
    },
    editorConfig: {
      optionsTemplate: (props: TimelionOptionsProps) => (
        <TimelionOptions services={dependencies} {...props} />
      ),
      defaultSize: DefaultEditorSize.MEDIUM,
    },
    toExpressionAst,
    inspectorAdapters: {},
    getSupportedTriggers: () => {
      return [VIS_EVENT_TO_TRIGGER.applyFilter];
    },
    getUsedIndexPattern: async (params: VisParams) => {
      try {
        let indexPatterns: IndexPattern[] = [];
        const indexes = await extractIndexesFromExpression(params.expression);

        for (const index of indexes) {
          const foundIndexPatterns = await getIndexPatterns().find(index);
          indexPatterns = indexPatterns.concat(foundIndexPatterns);
        }

        return indexPatterns;
      } catch {
        // timelion expression is invalid
      }
      return [];
    },
    options: {
      showIndexSelection: false,
      showQueryBar: false,
      showFilterBar: false,
    },
    requiresSearch: true,
  };
}
