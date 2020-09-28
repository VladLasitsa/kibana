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

import './index.scss';

import {
  CoreSetup,
  CoreStart,
  Plugin,
  IUiSettingsClient,
  PluginInitializerContext,
} from 'kibana/public';

import { Plugin as ExpressionsPublicPlugin } from '../../expressions/public';
import { VisualizationsSetup } from '../../visualizations/public';
import { createVisTypeVislibVisFn } from './vis_type_vislib_vis_fn';
import { createPieVisFn } from './pie_fn';
import {
  createHistogramVisTypeDefinition,
  createLineVisTypeDefinition,
  createPieVisTypeDefinition,
  createAreaVisTypeDefinition,
  createHeatmapVisTypeDefinition,
  createHorizontalBarVisTypeDefinition,
  createGaugeVisTypeDefinition,
  createGoalVisTypeDefinition,
} from './vis_type_vislib_vis_types';
import { ChartsPluginSetup } from '../../charts/public';
import { DataPublicPluginStart } from '../../data/public';
import { setFormatService, setDataActions, setKibanaLegacy } from './services';
import { KibanaLegacyStart } from '../../kibana_legacy/public';
import { NEW_CHART_UI } from '../../vis_type_xy/public';

export interface VisTypeVislibDependencies {
  uiSettings: IUiSettingsClient;
  charts: ChartsPluginSetup;
}

/** @internal */
export interface VisTypeVislibPluginSetupDependencies {
  expressions: ReturnType<ExpressionsPublicPlugin['setup']>;
  visualizations: VisualizationsSetup;
  charts: ChartsPluginSetup;
}

/** @internal */
export interface VisTypeVislibPluginStartDependencies {
  data: DataPublicPluginStart;
  kibanaLegacy: KibanaLegacyStart;
}

type VisTypeVislibCoreSetup = CoreSetup<VisTypeVislibPluginStartDependencies, void>;

/** @internal */
export class VisTypeVislibPlugin implements Plugin<void, void> {
  constructor(public initializerContext: PluginInitializerContext) {}

  public async setup(
    core: VisTypeVislibCoreSetup,
    { expressions, visualizations, charts }: VisTypeVislibPluginSetupDependencies
  ) {
    const visualizationDependencies: Readonly<VisTypeVislibDependencies> = {
      uiSettings: core.uiSettings,
      charts,
    };

    if (core.uiSettings.get(NEW_CHART_UI)) {
      // Register only non-replaced vis types
      [
        createPieVisTypeDefinition,
        createHeatmapVisTypeDefinition,
        createGaugeVisTypeDefinition,
        createGoalVisTypeDefinition,
      ].forEach((vis) => visualizations.createBaseVisualization(vis(visualizationDependencies)));
      [createVisTypeVislibVisFn(), createPieVisFn()].forEach(expressions.registerFunction);
    } else {
      // Register all vis types
      [
        createHistogramVisTypeDefinition,
        createLineVisTypeDefinition,
        createPieVisTypeDefinition,
        createAreaVisTypeDefinition,
        createHeatmapVisTypeDefinition,
        createHorizontalBarVisTypeDefinition,
        createGaugeVisTypeDefinition,
        createGoalVisTypeDefinition,
      ].forEach((vis) => visualizations.createBaseVisualization(vis(visualizationDependencies)));
      [createVisTypeVislibVisFn(), createPieVisFn()].forEach(expressions.registerFunction);
    }
  }

  public start(core: CoreStart, { data, kibanaLegacy }: VisTypeVislibPluginStartDependencies) {
    setFormatService(data.fieldFormats);
    setDataActions(data.actions);
    setKibanaLegacy(kibanaLegacy);
  }
}
