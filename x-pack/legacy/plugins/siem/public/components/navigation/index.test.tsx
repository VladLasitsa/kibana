/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { mount } from 'enzyme';
import React from 'react';

import { CONSTANTS } from '../url_state/constants';
import { SiemNavigationComponent } from './';
import { setBreadcrumbs } from './breadcrumbs';
import { navTabs } from '../../pages/home/home_navigations';
import { HostsTableType } from '../../store/hosts/model';
import { RouteSpyState } from '../../utils/route/types';
import { SiemNavigationProps, SiemNavigationComponentProps } from './types';

jest.mock('ui/new_platform');
jest.mock('./breadcrumbs', () => ({
  setBreadcrumbs: jest.fn(),
}));

describe('SIEM Navigation', () => {
  const mockProps: SiemNavigationComponentProps & SiemNavigationProps & RouteSpyState = {
    pageName: 'hosts',
    pathName: '/hosts',
    detailName: undefined,
    search: '',
    tabName: HostsTableType.authentications,
    navTabs,
    urlState: {
      [CONSTANTS.timerange]: {
        global: {
          [CONSTANTS.timerange]: {
            from: 1558048243696,
            fromStr: 'now-24h',
            kind: 'relative',
            to: 1558134643697,
            toStr: 'now',
          },
          linkTo: ['timeline'],
        },
        timeline: {
          [CONSTANTS.timerange]: {
            from: 1558048243696,
            fromStr: 'now-24h',
            kind: 'relative',
            to: 1558134643697,
            toStr: 'now',
          },
          linkTo: ['global'],
        },
      },
      [CONSTANTS.appQuery]: { query: '', language: 'kuery' },
      [CONSTANTS.filters]: [],
      [CONSTANTS.timeline]: {
        id: '',
        isOpen: false,
      },
    },
  };
  const wrapper = mount(<SiemNavigationComponent {...mockProps} />);
  test('it calls setBreadcrumbs with correct path on mount', () => {
    expect(setBreadcrumbs).toHaveBeenNthCalledWith(
      1,
      {
        detailName: undefined,
        navTabs: {
          case: {
            disabled: true,
            href: '#/link-to/case',
            id: 'case',
            name: 'Case',
            urlKey: 'case',
          },
          detections: {
            disabled: false,
            href: '#/link-to/detections',
            id: 'detections',
            name: 'Detections',
            urlKey: 'detections',
          },
          hosts: {
            disabled: false,
            href: '#/link-to/hosts',
            id: 'hosts',
            name: 'Hosts',
            urlKey: 'host',
          },
          network: {
            disabled: false,
            href: '#/link-to/network',
            id: 'network',
            name: 'Network',
            urlKey: 'network',
          },
          overview: {
            disabled: false,
            href: '#/link-to/overview',
            id: 'overview',
            name: 'Overview',
            urlKey: 'overview',
          },
          timelines: {
            disabled: false,
            href: '#/link-to/timelines',
            id: 'timelines',
            name: 'Timelines',
            urlKey: 'timeline',
          },
        },
        pageName: 'hosts',
        pathName: '/hosts',
        search: '',
        tabName: 'authentications',
        query: { query: '', language: 'kuery' },
        filters: [],
        savedQuery: undefined,
        timeline: {
          id: '',
          isOpen: false,
        },
        timerange: {
          global: {
            linkTo: ['timeline'],
            timerange: {
              from: 1558048243696,
              fromStr: 'now-24h',
              kind: 'relative',
              to: 1558134643697,
              toStr: 'now',
            },
          },
          timeline: {
            linkTo: ['global'],
            timerange: {
              from: 1558048243696,
              fromStr: 'now-24h',
              kind: 'relative',
              to: 1558134643697,
              toStr: 'now',
            },
          },
        },
      },
      undefined
    );
  });
  test('it calls setBreadcrumbs with correct path on update', () => {
    wrapper.setProps({
      pageName: 'network',
      pathName: '/network',
      tabName: undefined,
    });
    wrapper.update();
    expect(setBreadcrumbs).toHaveBeenNthCalledWith(
      1,
      {
        detailName: undefined,
        filters: [],
        navTabs: {
          case: {
            disabled: true,
            href: '#/link-to/case',
            id: 'case',
            name: 'Case',
            urlKey: 'case',
          },
          detections: {
            disabled: false,
            href: '#/link-to/detections',
            id: 'detections',
            name: 'Detections',
            urlKey: 'detections',
          },
          hosts: {
            disabled: false,
            href: '#/link-to/hosts',
            id: 'hosts',
            name: 'Hosts',
            urlKey: 'host',
          },
          network: {
            disabled: false,
            href: '#/link-to/network',
            id: 'network',
            name: 'Network',
            urlKey: 'network',
          },
          overview: {
            disabled: false,
            href: '#/link-to/overview',
            id: 'overview',
            name: 'Overview',
            urlKey: 'overview',
          },
          timelines: {
            disabled: false,
            href: '#/link-to/timelines',
            id: 'timelines',
            name: 'Timelines',
            urlKey: 'timeline',
          },
        },
        pageName: 'hosts',
        pathName: '/hosts',
        query: { language: 'kuery', query: '' },
        savedQuery: undefined,
        search: '',
        state: undefined,
        tabName: 'authentications',
        timeline: { id: '', isOpen: false },
        timerange: {
          global: {
            linkTo: ['timeline'],
            timerange: {
              from: 1558048243696,
              fromStr: 'now-24h',
              kind: 'relative',
              to: 1558134643697,
              toStr: 'now',
            },
          },
          timeline: {
            linkTo: ['global'],
            timerange: {
              from: 1558048243696,
              fromStr: 'now-24h',
              kind: 'relative',
              to: 1558134643697,
              toStr: 'now',
            },
          },
        },
      },
      undefined
    );
  });
});
