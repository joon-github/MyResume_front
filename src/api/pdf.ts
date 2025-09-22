import apiClient from './client';
import { TemplateRenderPayload, TemplateRenderResponse } from '../types/template';

export const exportResumeToPdf = async (
  payload: TemplateRenderPayload
): Promise<TemplateRenderResponse> => {
  const { data } = await apiClient.post<TemplateRenderResponse>('/render/pdf', payload);
  return data;
};
