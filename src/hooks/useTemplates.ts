import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { fetchTemplateDetail, fetchTemplates } from '../api/templates';
import { TemplateDetail, TemplateSummary } from '../types/template';

export const useTemplateList = (
  options?: UseQueryOptions<TemplateSummary[], Error, TemplateSummary[], ['templates']>
) =>
  useQuery({
    queryKey: ['templates'],
    queryFn: fetchTemplates,
    staleTime: 1000 * 60 * 5,
    ...options
  });

export const useTemplateDetail = (
  templateId?: string,
  options?: UseQueryOptions<TemplateDetail, Error, TemplateDetail, ['templates', string]>
) =>
  useQuery({
    queryKey: ['templates', templateId ?? ''],
    queryFn: () => {
      if (!templateId) {
        throw new Error('templateId is required');
      }
      return fetchTemplateDetail(templateId);
    },
    enabled: Boolean(templateId),
    ...options
  });
