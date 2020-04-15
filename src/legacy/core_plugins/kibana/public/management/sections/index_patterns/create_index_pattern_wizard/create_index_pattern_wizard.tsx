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

import React, { ReactElement, Component } from 'react';

import { EuiGlobalToastList, EuiGlobalToastListToast } from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n/react';
import { i18n } from '@kbn/i18n';

import { StepIndexPattern } from './components/step_index_pattern';
import { StepTimeField } from './components/step_time_field';
import { Header } from './components/header';
import { LoadingState } from './components/loading_state';
import { EmptyState } from './components/empty_state';

import { MAX_SEARCH_SIZE } from './constants';
import { ensureMinimumTime, getIndices } from './lib';
import {
  SavedObjectsClient,
  IUiSettingsClient,
  OverlayStart,
} from '../../../../../../../../core/public';
import { DataPublicPluginStart } from '../../../../../../../../plugins/data/public';
import { IndexPatternCreationConfig } from '../../../../../../../../plugins/index_pattern_management/public';
import { MatchedIndex } from './types';

interface CreateIndexPatternWizardProps {
  initialQuery: string;
  services: {
    indexPatternCreationType: IndexPatternCreationConfig;
    es: DataPublicPluginStart['search']['__LEGACY']['esClient'];
    indexPatterns: DataPublicPluginStart['indexPatterns'];
    savedObjectsClient: SavedObjectsClient;
    uiSettings: IUiSettingsClient;
    changeUrl: (url: string) => void;
    openConfirm: OverlayStart['openConfirm'];
  };
}

interface CreateIndexPatternWizardState {
  step: number;
  indexPattern: string;
  allIndices: MatchedIndex[];
  remoteClustersExist: boolean;
  isInitiallyLoadingIndices: boolean;
  isIncludingSystemIndices: boolean;
  toasts: EuiGlobalToastListToast[];
  indexPatternCreationType: IndexPatternCreationConfig;
}

export class CreateIndexPatternWizard extends Component<
  CreateIndexPatternWizardProps,
  CreateIndexPatternWizardState
> {
  state = {
    step: 1,
    indexPattern: '',
    allIndices: [],
    remoteClustersExist: false,
    isInitiallyLoadingIndices: true,
    isIncludingSystemIndices: false,
    toasts: [],
    indexPatternCreationType: {} as IndexPatternCreationConfig,
  };

  constructor(props: CreateIndexPatternWizardProps) {
    super(props);
    this.state.indexPatternCreationType = this.props.services.indexPatternCreationType;
  }

  async UNSAFE_componentWillMount() {
    this.fetchData();
  }

  catchAndWarn = async (
    asyncFn: Promise<MatchedIndex[]>,
    errorValue: [] | string[],
    errorMsg: ReactElement
  ) => {
    try {
      return await asyncFn;
    } catch (errors) {
      this.setState(prevState => ({
        toasts: prevState.toasts.concat([
          {
            title: errorMsg,
            id: errorMsg.props.id,
            color: 'warning',
            iconType: 'alert',
          },
        ]),
      }));
      return errorValue;
    }
  };

  fetchData = async () => {
    const { services } = this.props;

    this.setState({
      allIndices: [],
      isInitiallyLoadingIndices: true,
      remoteClustersExist: false,
    });

    const indicesFailMsg = (
      <FormattedMessage
        id="kbn.management.createIndexPattern.loadIndicesFailMsg"
        defaultMessage="Failed to load indices"
      />
    );

    const clustersFailMsg = (
      <FormattedMessage
        id="kbn.management.createIndexPattern.loadClustersFailMsg"
        defaultMessage="Failed to load remote clusters"
      />
    );

    // query local and remote indices, updating state independently
    ensureMinimumTime(
      this.catchAndWarn(
        getIndices(services.es, this.state.indexPatternCreationType, `*`, MAX_SEARCH_SIZE),
        [],
        indicesFailMsg
      )
    ).then((allIndices: MatchedIndex[]) =>
      this.setState({ allIndices, isInitiallyLoadingIndices: false })
    );

    this.catchAndWarn(
      // if we get an error from remote cluster query, supply fallback value that allows user entry.
      // ['a'] is fallback value
      getIndices(services.es, this.state.indexPatternCreationType, `*:*`, 1),
      ['a'],
      clustersFailMsg
    ).then((remoteIndices: string[] | MatchedIndex[]) =>
      this.setState({ remoteClustersExist: !!remoteIndices.length })
    );
  };

  createIndexPattern = async (timeFieldName: string | undefined, indexPatternId: string) => {
    const { services } = this.props;
    const { indexPattern, indexPatternCreationType } = this.state;

    const emptyPattern = await services.indexPatterns.make();

    Object.assign(emptyPattern, {
      id: indexPatternId,
      title: indexPattern,
      timeFieldName,
      ...indexPatternCreationType.getIndexPatternMappings(),
    });

    const createdId = await emptyPattern.create();
    if (!createdId) {
      const confirmMessage = i18n.translate('kbn.management.indexPattern.titleExistsLabel', {
        values: { title: emptyPattern.title },
        defaultMessage: "An index pattern with the title '{title}' already exists.",
      });

      const isConfirmed = await services.openConfirm(confirmMessage, {
        confirmButtonText: i18n.translate('kbn.management.indexPattern.goToPatternButtonLabel', {
          defaultMessage: 'Go to existing pattern',
        }),
      });

      if (isConfirmed) {
        return services.changeUrl(`/management/kibana/index_patterns/${indexPatternId}`);
      } else {
        return false;
      }
    }

    if (!services.config.get('defaultIndex')) {
      await services.config.set('defaultIndex', createdId);
    }

    services.indexPatterns.clearCache(createdId);
    services.changeUrl(`/management/kibana/index_patterns/${createdId}`);
  };

  goToTimeFieldStep = (indexPattern: string) => {
    this.setState({ step: 2, indexPattern });
  };

  goToIndexPatternStep = () => {
    this.setState({ step: 1 });
  };

  onChangeIncludingSystemIndices = () => {
    this.setState(prevState => ({
      isIncludingSystemIndices: !prevState.isIncludingSystemIndices,
    }));
  };

  renderHeader() {
    const { isIncludingSystemIndices, indexPatternCreationType } = this.state;

    return (
      <Header
        prompt={indexPatternCreationType.renderPrompt()}
        showSystemIndices={indexPatternCreationType.getShowSystemIndices()}
        isIncludingSystemIndices={isIncludingSystemIndices}
        onChangeIncludingSystemIndices={this.onChangeIncludingSystemIndices}
        indexPatternName={indexPatternCreationType.getIndexPatternName()}
        isBeta={indexPatternCreationType.getIsBeta()}
      />
    );
  }

  renderContent() {
    const {
      allIndices,
      isInitiallyLoadingIndices,
      isIncludingSystemIndices,
      step,
      indexPattern,
      remoteClustersExist,
      indexPatternCreationType,
    } = this.state;

    if (isInitiallyLoadingIndices) {
      return <LoadingState />;
    }

    const hasDataIndices = allIndices.some(({ name }: MatchedIndex) => !name.startsWith('.'));
    if (!hasDataIndices && !isIncludingSystemIndices && !remoteClustersExist) {
      return <EmptyState onRefresh={this.fetchData} />;
    }

    if (step === 1) {
      const { services, initialQuery } = this.props;
      return (
        <StepIndexPattern
          allIndices={allIndices}
          initialQuery={indexPattern || initialQuery}
          isIncludingSystemIndices={isIncludingSystemIndices}
          esService={services.es}
          savedObjectsClient={services.savedObjectsClient}
          indexPatternCreationType={indexPatternCreationType}
          goToNextStep={this.goToTimeFieldStep}
          uiSettings={services.uiSettings}
        />
      );
    }

    if (step === 2) {
      const { services } = this.props;
      return (
        <StepTimeField
          indexPattern={indexPattern}
          indexPatternsService={services.indexPatterns}
          goToPreviousStep={this.goToIndexPatternStep}
          createIndexPattern={this.createIndexPattern}
          indexPatternCreationType={indexPatternCreationType}
        />
      );
    }

    return null;
  }

  removeToast = (id: string) => {
    this.setState(prevState => ({
      toasts: prevState.toasts.filter(toast => toast.id !== id),
    }));
  };

  render() {
    const header = this.renderHeader();
    const content = this.renderContent();

    return (
      <React.Fragment>
        <div>
          {header}
          {content}
        </div>
        <EuiGlobalToastList
          toasts={this.state.toasts}
          dismissToast={({ id }) => {
            this.removeToast(id);
          }}
          toastLifeTimeMs={6000}
        />
      </React.Fragment>
    );
  }
}
