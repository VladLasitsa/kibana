/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { kea, MakeLogicType } from 'kea';

import { FC } from 'react';
import { History } from 'history';
import { ApplicationStart, ChromeBreadcrumb } from 'src/core/public';
import { CloudSetup } from '../../../../../cloud/public';

import { HttpLogic } from '../http';
import { createHref, CreateHrefOptions } from '../react_router_helpers';

interface KibanaLogicProps {
  config: { host?: string };
  history: History;
  cloud: Partial<CloudSetup>;
  navigateToUrl: ApplicationStart['navigateToUrl'];
  setBreadcrumbs(crumbs: ChromeBreadcrumb[]): void;
  setDocTitle(title: string): void;
  renderHeaderActions(HeaderActions: FC): void;
}
export interface KibanaValues extends KibanaLogicProps {
  navigateToUrl(path: string, options?: CreateHrefOptions): Promise<void>;
}

export const KibanaLogic = kea<MakeLogicType<KibanaValues>>({
  path: ['enterprise_search', 'kibana_logic'],
  reducers: ({ props }) => ({
    config: [props.config || {}, {}],
    history: [props.history, {}],
    cloud: [props.cloud || {}, {}],
    navigateToUrl: [
      (url: string, options?: CreateHrefOptions) => {
        const deps = { history: props.history, http: HttpLogic.values.http };
        const href = createHref(url, deps, options);
        return props.navigateToUrl(href);
      },
      {},
    ],
    setBreadcrumbs: [props.setBreadcrumbs, {}],
    setDocTitle: [props.setDocTitle, {}],
    renderHeaderActions: [props.renderHeaderActions, {}],
  }),
});

export const mountKibanaLogic = (props: KibanaLogicProps) => {
  KibanaLogic(props);
  const unmount = KibanaLogic.mount();
  return unmount;
};
