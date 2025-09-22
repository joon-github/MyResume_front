import apiClient from './client';
import { TemplateDetail, TemplateSummary } from '../types/template';

interface TemplateListResponse {
  templates: TemplateSummary[];
}

export const fetchTemplates = async (): Promise<TemplateSummary[]> => {
  const { data } = await apiClient.get<TemplateListResponse>('/templates');
  return data.templates;
};

export const fetchTemplateDetail = async (templateId: string): Promise<TemplateDetail> => {
  const { data } = await apiClient.get<TemplateDetail>(`/templates/${templateId}`);
  return data;
};
