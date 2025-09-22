export type TemplateFieldType = 'text' | 'textarea' | 'list';

export interface TemplateField {
  id: string;
  label: string;
  type: TemplateFieldType;
  placeholder?: string;
  maxLength?: number;
  helperText?: string;
}

export interface TemplateSection {
  id: string;
  title: string;
  description?: string;
  layout?: 'single' | 'split';
  fields: TemplateField[];
}

export interface TemplateSummary {
  id: string;
  name: string;
  description: string;
  tags?: string[];
  previewColors?: string[];
  updatedAt?: string;
}

export type TemplateContent = Record<string, Record<string, string | string[]>>;

export interface TemplateMeta {
  page?: {
    size?: string;
    margin?: string;
  };
  layoutDefaults?: {
    fontScale?: number;
    contentSpacing?: number;
    pagePadding?: number;
  };
  headerTitle?: string;
  headerSubtitle?: string;
  showHeader?: boolean;
  [key: string]: unknown;
}

export interface TemplateHeaderSettings {
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
}

export interface TemplateDetail extends TemplateSummary {
  sections: TemplateSection[];
  defaultContent: TemplateContent;
  styles: string;
  meta?: TemplateMeta;
}

export interface TemplateRenderPayload {
  templateId: string;
  content: TemplateContent;
  overrides?: Record<string, BlockStyleOverride>;
  pagePadding?: PagePadding;
  header?: TemplateHeaderSettings;
  html?: string;
}

export interface BlockSpacing {
  top: number;
  bottom: number;
}

export interface BlockStyleOverride {
  fontScale?: number;
  textColor?: string;
  spacing?: BlockSpacing;
}

export interface PagePadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface TemplateRenderResponse {
  status: 'ok' | 'pending';
  message?: string;
  pdfBase64?: string;
}
