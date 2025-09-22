import { create } from 'zustand';
import {
  BlockSpacing,
  BlockStyleOverride,
  PagePadding,
  TemplateContent,
  TemplateDetail,
  TemplateHeaderSettings
} from '../types/template';

const DEFAULT_TEXT_COLOR = '#1b1d21';

export interface StyleOverride extends BlockStyleOverride {
  spacing: BlockSpacing;
  fontScale: number;
  textColor: string;
  forcePageBreak: boolean;
}

export type BlockOverrides = Record<string, StyleOverride>;

interface EditorState {
  selectedTemplateId?: string;
  template?: TemplateDetail;
  content: TemplateContent;
  overrides: BlockOverrides;
  selectedBlockId?: string;
  pagePadding: PagePadding;
  autoPaginate: boolean;
  header: TemplateHeaderSettings;
  setSelectedTemplateId: (templateId: string) => void;
  setTemplate: (template: TemplateDetail) => void;
  updateField: (sectionId: string, fieldId: string, value: string | string[]) => void;
  setSelectedBlock: (blockId: string | undefined) => void;
  updateOverride: (blockId: string, override: Partial<StyleOverride>) => void;
  resetOverride: (blockId: string) => void;
  updatePagePadding: (edge: keyof PagePadding, value: number) => void;
  resetPagePadding: () => void;
  setAutoPaginate: (value: boolean) => void;
  updateHeader: (patch: Partial<TemplateHeaderSettings>) => void;
  reset: () => void;
  setOverrides: (overrides: BlockOverrides) => void;
}

const cloneContent = (content: TemplateContent) =>
  JSON.parse(JSON.stringify(content ?? {})) as TemplateContent;

const defaultBlockSpacing = (): BlockSpacing => ({ top: 8, bottom: 8 });
const defaultPagePadding = (): PagePadding => ({ top: 36, right: 36, bottom: 36, left: 36 });
const defaultHeader = (): TemplateHeaderSettings => ({ title: '', subtitle: '', showHeader: true });

export const createDefaultOverride = (): StyleOverride => ({
  fontScale: 1,
  textColor: DEFAULT_TEXT_COLOR,
  spacing: defaultBlockSpacing(),
  forcePageBreak: false
});

const mergeOverride = (base: StyleOverride, patch: Partial<StyleOverride>): StyleOverride => ({
  fontScale: patch.fontScale ?? base.fontScale,
  textColor: patch.textColor ?? base.textColor,
  spacing: {
    top: patch.spacing?.top ?? base.spacing.top,
    bottom: patch.spacing?.bottom ?? base.spacing.bottom
  },
  forcePageBreak: patch.forcePageBreak ?? base.forcePageBreak
});

export const useEditorStore = create<EditorState>((set) => ({
  selectedTemplateId: undefined,
  template: undefined,
  content: {},
  overrides: {},
  selectedBlockId: undefined,
  pagePadding: defaultPagePadding(),
  autoPaginate: true,
  header: defaultHeader(),
  setOverrides: (overrides: BlockOverrides) => set({ overrides }),
  setSelectedTemplateId: (templateId) =>
    set({
      selectedTemplateId: templateId,
      template: undefined,
      content: {},
      overrides: {},
      selectedBlockId: undefined,
      pagePadding: defaultPagePadding(),
      autoPaginate: false,
      header: defaultHeader()
    }),
  setTemplate: (template) =>
    set((state) => {
      if (state.template?.id === template.id) {
        return state;
      }

      const headerFromMeta: TemplateHeaderSettings = {
        title: template.meta?.headerTitle ?? template.name,
        subtitle: template.meta?.headerSubtitle ?? template.description,
        showHeader: template.meta?.showHeader ?? true
      };

      return {
        template,
        content: cloneContent(template.defaultContent),
        overrides: {},
        selectedBlockId: undefined,
        pagePadding: defaultPagePadding(),
        autoPaginate: false,
        header: headerFromMeta
      };
    }),
  updateField: (sectionId, fieldId, value) =>
    set((state) => {
      const nextSection = { ...(state.content[sectionId] ?? {}) };
      nextSection[fieldId] = value;

      return {
        content: {
          ...state.content,
          [sectionId]: nextSection
        }
      };
    }),
  setSelectedBlock: (blockId) => set({ selectedBlockId: blockId }),
  updateOverride: (blockId, override) =>
    set((state) => {
      const nextOverrides = { ...state.overrides };
      const existing = nextOverrides[blockId] ?? createDefaultOverride();
      nextOverrides[blockId] = mergeOverride(existing, override);
      return { overrides: nextOverrides };
    }),
  resetOverride: (blockId) =>
    set((state) => {
      const nextOverrides = { ...state.overrides };
      delete nextOverrides[blockId];
      return { overrides: nextOverrides };
    }),
  updatePagePadding: (edge, value) =>
    set((state) => ({
      pagePadding: {
        ...state.pagePadding,
        [edge]: value
      }
    })),
  resetPagePadding: () => set({ pagePadding: defaultPagePadding() }),
  setAutoPaginate: (value) => set({ autoPaginate: value }),
  updateHeader: (patch) =>
    set((state) => ({
      header: {
        ...state.header,
        ...patch
      }
    })),
  reset: () =>
    set({
      selectedTemplateId: undefined,
      template: undefined,
      content: {},
      overrides: {},
      selectedBlockId: undefined,
      pagePadding: defaultPagePadding(),
      autoPaginate: false,
      header: defaultHeader()
    })
}));

export const selectSelectedTemplateId = (state: EditorState) => state.selectedTemplateId;
export const selectTemplate = (state: EditorState) => state.template;
export const selectContent = (state: EditorState) => state.content;
export const selectOverrides = (state: EditorState) => state.overrides;
export const selectSelectedBlockId = (state: EditorState) => state.selectedBlockId;
export const selectPagePadding = (state: EditorState) => state.pagePadding;
export const selectAutoPaginate = (state: EditorState) => state.autoPaginate;
export const selectHeader = (state: EditorState) => state.header;

export const resolveOverride = (overrides: BlockOverrides, blockId: string): StyleOverride =>
  mergeOverride(createDefaultOverride(), overrides[blockId] ?? {});
