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
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { CoreSetup, Plugin, AppMountParameters } from 'src/core/public';
import { UiActionsStart } from '../../../../../../../src/plugins/ui_actions/public';
import { createHelloWorldAction } from '../../../../../../../src/plugins/ui_actions/public/tests/test_samples';

import {
  Start as InspectorStartContract,
  Setup as InspectorSetupContract,
} from '../../../../../../../src/plugins/inspector/public';

import { CONTEXT_MENU_TRIGGER } from './embeddable_api';

import { SayHelloAction, createSendMessageAction } from './embeddable_api';
import { App } from './app';
import { getSavedObjectFinder } from '../../../../../../../src/plugins/saved_objects/public';
import {
  EmbeddableStart,
  EmbeddableSetup,
} from '.../../../../../../../src/plugins/embeddable/public';

export interface SetupDependencies {
  embeddable: EmbeddableSetup;
  inspector: InspectorSetupContract;
}

interface StartDependencies {
  embeddable: EmbeddableStart;
  uiActions: UiActionsStart;
  inspector: InspectorStartContract;
}

export type EmbeddableExplorerSetup = Promise<void>;
export type EmbeddableExplorerStart = void;

export class EmbeddableExplorerPublicPlugin
  implements
    Plugin<EmbeddableExplorerSetup, EmbeddableExplorerStart, SetupDependencies, StartDependencies> {
  public async setup(core: CoreSetup, setupDeps: SetupDependencies): EmbeddableExplorerSetup {
    const [coreStart, plugins] = await core.getStartServices();
    const helloWorldAction = createHelloWorldAction(core.getStartServices);
    const sayHelloAction = new SayHelloAction(alert);
    const sendMessageAction = createSendMessageAction(core.getStartServices);

    const startPlugins = plugins as StartDependencies;

    startPlugins.uiActions.registerAction(helloWorldAction);
    startPlugins.uiActions.registerAction(sayHelloAction);
    startPlugins.uiActions.registerAction(sendMessageAction);

    startPlugins.uiActions.attachAction(CONTEXT_MENU_TRIGGER, helloWorldAction);

    core.application.register({
      id: 'topNavMenu',
      title: 'Top nav menu example',
      async mount(params: AppMountParameters) {
        render(
          <App
            getActions={startPlugins.uiActions.getTriggerCompatibleActions}
            getAllEmbeddableFactories={startPlugins.embeddable.getEmbeddableFactories}
            getEmbeddableFactory={startPlugins.embeddable.getEmbeddableFactory}
            notifications={coreStart.notifications}
            overlays={coreStart.overlays}
            inspector={startPlugins.inspector}
            SavedObjectFinder={getSavedObjectFinder(coreStart.savedObjects, core.uiSettings)}
            I18nContext={coreStart.i18n.Context}
          />,
          params.element
        );

        return () => unmountComponentAtNode(params.element);
      },
    });
  }

  public start() {}
  public stop() {}
}
