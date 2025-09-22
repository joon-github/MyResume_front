import { ChangeEvent } from 'react';
import {
  resolveOverride,
  selectOverrides,
  selectSelectedBlockId,
  selectTemplate,
  useEditorStore
} from '../store/editorStore';
import type { TemplateSection } from '../types/template';

const formatBlockLabel = (blockId: string | undefined, templateSections?: TemplateSection[]) => {
  if (!blockId || !templateSections) {
    return undefined;
  }
  const [sectionId, fieldId] = blockId.split('.');
  const section = templateSections.find((item) => item.id === sectionId);
  const field = section?.fields.find((item) => item.id === fieldId);
  if (!section || !field) {
    return undefined;
  }
  return {
    title: section.title,
    label: field.label,
    sectionId,
    fieldId
  };
};
interface BlockStylePanelProps {
  setRightPanelViewType?: (viewType: 'editor' | 'style') => void;
}

export const BlockStylePanel = ({ setRightPanelViewType }: BlockStylePanelProps) => {
  const template = useEditorStore(selectTemplate);
  const selectedBlockId = useEditorStore(selectSelectedBlockId);
  const overrides = useEditorStore(selectOverrides);
  const updateOverride = useEditorStore((state) => state.updateOverride);
  const resetOverride = useEditorStore((state) => state.resetOverride);
  const setAutoPaginate = useEditorStore((state) => state.setAutoPaginate);
  const setSelectedBlock = useEditorStore((state) => state.setSelectedBlock);
  const setOverrides = useEditorStore((state) => state.setOverrides);

  if (!selectedBlockId) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
        <p className="text-sm font-medium text-slate-600">편집할 영역을 선택하세요.</p>
        <p className="mt-2 text-xs text-slate-500">왼쪽 미리보기에서 드래그하거나 클릭하면 이곳에서 속성을 조절할 수 있습니다.</p>
      </div>
    );
  }

  const meta = formatBlockLabel(selectedBlockId, template?.sections);
  const override = resolveOverride(overrides, selectedBlockId);

  const handleFontScaleChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateOverride(selectedBlockId, { fontScale: Number(event.target.value) });
  };

  const handleColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateOverride(selectedBlockId, { textColor: event.target.value });
  };

  const handleSpacingChange = (edge: 'top' | 'bottom') =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = Number(event.target.value);
      setOverrides({
        ...overrides,
        [selectedBlockId]: {
          ...override,
          spacing: {
            ...override.spacing,
            [edge]: value
          }
        }
      });
      updateOverride(selectedBlockId, {
        spacing: {
          ...override.spacing,
          [edge]: value
        }
      });
    };

  const handleForcePageBreakChange = (event: ChangeEvent<HTMLInputElement>) => {
    if(event.target.checked) {
      setAutoPaginate(true);
    }
    updateOverride(selectedBlockId, { forcePageBreak: event.target.checked });
  };

  const handleReset = () => {
    resetOverride(selectedBlockId);
  };

  return (
    <div className="space-y-5">
      <header>
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-accent">선택된 영역</p>
          {setRightPanelViewType && (
            <button
              type="button"
              onClick={() => {
                setRightPanelViewType('editor');
                setSelectedBlock(undefined);
              }}
              className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
            >
              닫기
            </button>
          )}
        </div>
        <h3 className="mt-1 text-lg font-semibold text-ink">
          {meta ? `${meta.title} · ${meta.label}` : selectedBlockId}
        </h3>
      </header>

      <section className="space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-600" htmlFor="fontScale">
              폰트 크기
            </label>
            <span className="text-xs font-semibold text-accent">{Math.round(override.fontScale * 100)}%</span>
          </div>
          <input
            id="fontScale"
            type="range"
            min={0.7}
            max={1.6}
            step={0.01}
            value={override.fontScale}
            onChange={handleFontScaleChange}
            className="mt-2 w-full accent-accent"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-600" htmlFor="textColor">
              텍스트 색상
            </label>
            <span className="text-xs text-slate-500">{override.textColor}</span>
          </div>
          <input
            id="textColor"
            type="color"
            value={override.textColor}
            onChange={handleColorChange}
            className="mt-2 h-9 w-full cursor-pointer rounded border border-slate-200 bg-white"
          />
        </div>

        <div>
          <p className="text-xs font-medium text-slate-600">블록 간 간격 (px)</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {(['top', 'bottom'] as const).map((edge) => (
              <label key={edge} className="flex flex-col gap-1 text-xs text-slate-500">
                <span className="font-medium text-slate-600">{edge === 'top' ? '위 간격' : '아래 간격'}</span>
                <input
                  type="number"
                  min={0}
                  max={64}
                  value={override.spacing[edge]}
                  onChange={handleSpacingChange(edge)}
                  className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-3">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-600">여기서 페이지 나누기</span>
            <span className="text-[11px] text-slate-500">이 블록 이후의 콘텐츠를 새 페이지에서 시작합니다.</span>
          </div>
          <input
            type="checkbox"
            checked={override.forcePageBreak}
            onChange={handleForcePageBreakChange}
            className="h-4 w-4 cursor-pointer accent-accent"
          />
        </div>
      </section>

      <button
        type="button"
        onClick={handleReset}
        className="w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
      >
        기본값으로 돌아가기
      </button>
    </div>
  );
};
