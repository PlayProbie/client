import { useQuery } from '@tanstack/react-query';

import { getVersionSurveys } from '../api';

import { versionKeys } from './keys';

export function useVersionSurveysQuery(versionUuid: string) {
  return useQuery({
    queryKey: versionKeys.surveys(versionUuid),
    queryFn: () => getVersionSurveys(versionUuid),
    enabled: !!versionUuid,
  });
}
