import { ChangeEvent } from 'react';
import {
  selectAutoPaginate,
  selectHeader,
  selectPagePadding,
  useEditorStore
} from '../store/editorStore';

export const PageLayoutPanel = () => {
  const pagePadding = useEditorStore(selectPagePadding);
  const updatePagePadding = useEditorStore((state) => state.updatePagePadding);
  const resetPagePadding = useEditorStore((state) => state.resetPagePadding);
  const autoPaginate = useEditorStore(selectAutoPaginate);
  const setAutoPaginate = useEditorStore((state) => state.setAutoPaginate);
  const header = useEditorStore(selectHeader);
  const updateHeader = useEditorStore((state) => state.updateHeader);

  const handleChange = (edge: 'top' | 'right' | 'bottom' | 'left') =>
    (event: ChangeEvent<HTMLInputElement>) => {
      updatePagePadding(edge, Number(event.target.value));
    };

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-accent">페이지 여백</p>
          <p className="mt-1 text-xs text-slate-500">전체 이력서의 상·하·좌·우 여백을 조절합니다.</p>
        </div>
        <button
          type="button"
          onClick={resetPagePadding}
          className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
        >
          기본값
        </button>
      </header>
      <div className="grid grid-cols-2 gap-3">
        {(['top', 'right', 'bottom', 'left'] as const).map((edge) => (
          <label key={edge} className="flex flex-col gap-1 text-xs text-slate-600">
            <span className="font-medium">{edge.toUpperCase()}</span>
            <input
              type="number"
              min={12}
              max={80}
              value={pagePadding[edge]}
              onChange={handleChange(edge)}
              className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40"
            />
          </label>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white px-3 py-3">
        <label className="flex items-center justify-between text-xs font-medium text-slate-600">
          <span>
            자동 페이지 추가
            <span className="ml-2 text-[11px] font-normal text-slate-500">
              페이지 높이를 넘으면 새 페이지를 생성합니다.
            </span>
          </span>
          <input
            type="checkbox"
            checked={autoPaginate}
            onChange={(event) => setAutoPaginate(event.target.checked)}
            className="h-4 w-4 cursor-pointer accent-accent"
          />
        </label>
      </div>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-white px-3 py-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">이력서 제목</span>
          <label className="flex items-center gap-2 text-[11px] text-slate-500">
            <input
              type="checkbox"
              checked={header.showHeader ?? true}
              onChange={(event) => updateHeader({ showHeader: event.target.checked })}
              className="h-4 w-4 cursor-pointer accent-accent"
            />
            표시
          </label>
        </div>
        <label className="flex flex-col gap-1 text-xs text-slate-600">
          제목
          <input
            type="text"
            value={header.title ?? ''}
            onChange={(event) => updateHeader({ title: event.target.value })}
            placeholder="예: 이력서"
            className="rounded border border-slate-300 px-2 py-1 text-xs text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-slate-600">
          설명
          <input
            type="text"
            value={header.subtitle ?? ''}
            onChange={(event) => updateHeader({ subtitle: event.target.value })}
            placeholder="예: 포트폴리오/직무 요약"
            className="rounded border border-slate-300 px-2 py-1 text-xs text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40"
          />
        </label>
      </div>
    </div>
  );
};

export default PageLayoutPanel;
