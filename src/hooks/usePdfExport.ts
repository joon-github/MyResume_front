import { useMutation } from '@tanstack/react-query';
import { exportResumeToPdf } from '../api/pdf';
import { TemplateRenderPayload, TemplateRenderResponse } from '../types/template';

export const usePdfExport = () =>
  useMutation<TemplateRenderResponse, Error, TemplateRenderPayload>({
    mutationFn: exportResumeToPdf
  });
