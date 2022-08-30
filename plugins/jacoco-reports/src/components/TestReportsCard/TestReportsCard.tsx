import React from 'react';
import { Typography, Grid, CircularProgress } from '@material-ui/core';
import Happy from '@material-ui/icons/SentimentSatisfied';
import Sad from '@material-ui/icons/SentimentDissatisfied';
import { InfoCard } from '@backstage/core-components';
import { CoverageItemType, useReports } from '../../hooks/useReports';

const getColor = (percentage: number) => {
  if (percentage >= 85) {
    return 'lightgreen';
  }
  return 'darkorange';
};

const getIcon = (percentage: number) => {
  if (percentage >= 85) {
    return <Happy fontSize="small" style={{ color: getColor(percentage) }} />;
  }
  return <Sad fontSize="small" style={{ color: getColor(percentage) }} />;
};

const CoverageItem = ({ coverageItem }: { coverageItem: CoverageItemType }) => (
  <Grid item container>
    <Grid item style={{ minWidth: '120px' }}>
      <Typography variant="body1" component="p">
        {coverageItem.label}:
      </Typography>
    </Grid>
    <Grid item>
      <Typography
        variant="body1"
        component="p"
        style={{ color: getColor(coverageItem.value) }}
      >
        {coverageItem.value}%
      </Typography>
    </Grid>
    <Grid item>{getIcon(coverageItem.value)}</Grid>
  </Grid>
);

export const TestReportsCard = () => {
  const { value, loading, error } = useReports();

  return (
    <Grid>
      <InfoCard
        title="Test Coverage"
        deepLink={
          window.location.href.includes('jacoco-reports')
            ? undefined
            : { link: 'jacoco-reports', title: 'More Details' }
        }
      >
        <Grid container style={{ padding: '16px' }}>
          {loading && (
            <Grid container justifyContent="center">
              <CircularProgress />
            </Grid>
          )}
          {!loading && error && (
            <Grid container>
              <Typography variant="body1" component="p">
                Error while getting test reports
              </Typography>
            </Grid>
          )}
          {!loading && value && (
            <Grid container>
              {value.map((item: CoverageItemType, index: number) => (
                <CoverageItem key={index} coverageItem={item} />
              ))}
            </Grid>
          )}
        </Grid>
      </InfoCard>
    </Grid>
  );
};
