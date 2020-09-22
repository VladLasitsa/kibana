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

import React, { FC } from 'react';

import {
  Direction,
  Settings,
  DomainRange,
  Position,
  PartialTheme,
  ElementClickListener,
  BrushEndListener,
  LegendAction,
  LegendColorPicker,, TooltipProps
} from '@elastic/charts';

import { renderEndzoneTooltip } from '../../../charts/public';

import { getThemeService } from '../services';
import { VisConfig } from '../types';

type XYSettingsProps = Pick<
  VisConfig,
  | 'markSizeRatio'
  | 'rotation'
  | 'enableHistogramMode'
  | 'tooltip'
  | 'isTimeChart'
  | 'xAxis'
  | 'orderBucketsBySum'
> & {
  xDomain: DomainRange;
  adjustedXDomain: DomainRange;
  showLegend: boolean;
  onElementClick: ElementClickListener;
  onBrushEnd: BrushEndListener;
  legendAction?: LegendAction;
  legendColorPicker: LegendColorPicker;
  legendPosition: Position;
};

export const XYSettings: FC<XYSettingsProps> = ({
  markSizeRatio,
  rotation,
  enableHistogramMode,
  tooltip,
  isTimeChart,
  xAxis,
  orderBucketsBySum,
  xDomain,
  adjustedXDomain,
  showLegend,
  onElementClick,
  onBrushEnd,
  legendAction,
  legendColorPicker,
  legendPosition,
}) => {
  const themeService = getThemeService();
  const theme = themeService.useChartsTheme();
  const baseTheme = themeService.useChartsBaseTheme();
  const themeOverrides: PartialTheme = {
    markSizeRatio,
    chartMargins:
      legendPosition === Position.Top || legendPosition === Position.Right
        ? {
            bottom: 10,
          }
        : {
            right: 10,
          },
  };
  const headerFormatter = isTimeChart
    ? renderEndzoneTooltip(
        adjustedXDomain.minInterval,
        'min' in xDomain ? xDomain.min : undefined,
        'max' in xDomain ? xDomain.max : undefined,
        xAxis.ticks?.formatter,
        !tooltip.detailedTooltip
      )
    : undefined;
  const tooltipProps: TooltipProps = tooltip.detailedTooltip
    ? {
        customTooltip: tooltip.detailedTooltip(headerFormatter ?? xAxis.ticks?.formatter),
        headerFormatter: undefined,
      }
    : { headerFormatter };

  return (
    <Settings
      // @ts-ignore
      enableVislibSeriesSort
      xDomain={adjustedXDomain}
      rotation={rotation}
      theme={[themeOverrides, theme]}
      baseTheme={baseTheme}
      showLegend={showLegend}
      legendPosition={legendPosition}
      allowBrushingLastHistogramBucket={isTimeChart}
      roundHistogramBrushValues={enableHistogramMode && !isTimeChart}
      legendColorPicker={legendColorPicker}
      onElementClick={onElementClick}
      onBrushEnd={onBrushEnd}
      legendAction={legendAction}
      tooltip={tooltipProps}
      orderOrdinalBinsBy={
        orderBucketsBySum
          ? {
              direction: Direction.Descending,
            }
          : undefined
      }
    />
  );
};
