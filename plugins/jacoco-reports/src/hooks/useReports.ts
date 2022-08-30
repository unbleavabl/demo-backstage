import { useApi, configApiRef } from '@backstage/core-plugin-api';
import { readGitHubIntegrationConfigs } from '@backstage/integration';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useCallback, useMemo } from 'react';
import useAsync from 'react-use/lib/useAsync';
import { jacocoReportsApiRef } from '../apiRefs/jacocoReports';
import { Entity } from '@backstage/catalog-model';

export type CoverageItemType = {
  label: string;
  value: number;
};

export type Coverage = Array<CoverageItemType>;

const GITHUB_ACTIONS_ANNOTATION = 'github.com/project-slug';

const getProjectNameFromEntity = (entity: Entity) =>
  entity?.metadata.annotations?.[GITHUB_ACTIONS_ANNOTATION] ?? '';

export const useReports = () => {
  const config = useApi(configApiRef);
  const api = useApi(jacocoReportsApiRef);

  const { entity } = useEntity();
  const hostname = useMemo(
    () =>
      readGitHubIntegrationConfigs(
        config.getOptionalConfigArray('integration.github') ?? [],
      )[0].host,
    [config],
  );

  const projectName = useMemo(() => getProjectNameFromEntity(entity), [entity]);
  const [owner, repo] = useMemo(
    () => (projectName && projectName.split('/')) || [],
    [projectName],
  );

  const { value, error, loading } = useAsync(async () => {
    if (!repo && !owner) {
      return undefined;
    }
    const res = await api.getJacocoReportList({
      hostname,
      owner,
      repo,
    });

    const latestCsvArtifact = res.data.artifacts.find(artifact =>
      artifact.name.includes('xml'),
    );
    const downloadedArtifact = await api.downloadArtifact({
      hostname,
      owner,
      repo,
      artifact_id: latestCsvArtifact?.id || 0,
      archive_format: 'zip',
    });

    const reportDetails = await api.getArtifactDetails({
      url: downloadedArtifact.url,
    });
    return reportDetails;
  }, [repo, owner]);

  return {
    value,
    error,
    loading,
  };
};
