import { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { PreviewPane } from "../components/PreviewPane";
import { ResumeEditor } from "../components/ResumeEditor";
import { BlockStylePanel } from "../components/BlockStylePanel";
import { PageLayoutPanel } from "../components/PageLayoutPanel";
import { useTemplateDetail } from "../hooks/useTemplates";
import { usePdfExport } from "../hooks/usePdfExport";
import {
  selectContent,
  selectOverrides,
  selectPagePadding,
  selectHeader,
  selectTemplate,
  useEditorStore,
} from "../store/editorStore";

const TemplateWorkspace = () => {
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId: string }>();
  const setSelectedTemplateId = useEditorStore(
    (state) => state.setSelectedTemplateId
  );
  const setTemplate = useEditorStore((state) => state.setTemplate);
  const template = useEditorStore(selectTemplate);
  const content = useEditorStore(selectContent);
  const overrides = useEditorStore(selectOverrides);
  const pagePadding = useEditorStore(selectPagePadding);
  const header = useEditorStore(selectHeader);
  const exportMutation = usePdfExport();
  const [rightPanelViewType, setRightPanelViewType] = useState<'editor' | 'style'>('editor');
  useEffect(() => {
    if (templateId) {
      setSelectedTemplateId(templateId);
    }
  }, [templateId, setSelectedTemplateId]);

  const {
    data: templateDetail,
    isFetching,
    error: templateError,
  } = useTemplateDetail(templateId);

  useEffect(() => {
    if (templateDetail) {
      setTemplate(templateDetail);
    }
  }, [templateDetail, setTemplate]);

  const handleExport = async () => {
    if (!template) {
      return;
    }

    try {
      const response = await exportMutation.mutateAsync({
        templateId: template.id,
        content,
        overrides,
        pagePadding,
        header,
      });
      if (response.pdfBase64) {
        const cleaned = response.pdfBase64.trim();
        const binaryString = window.atob(cleaned);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i += 1) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes.buffer], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const safeName = template.name.replace(/\s+/g, "-").toLowerCase();
        const link = document.createElement("a");
        link.href = url;
        link.download = `${safeName}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 0);
      } else {
        window.alert(
          response.message ?? "PDF 변환 기능은 곧 제공될 예정입니다."
        );
      }
    } catch (error) {
      console.error(error);
      window.alert(
        "PDF 변환 중 오류가 발생했습니다. 나중에 다시 시도해주세요."
      );
    }
  };

  if (!templateId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        {templateError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            템플릿을 불러오는 중 문제가 발생했습니다. 다시 시도하거나 다른
            템플릿을 선택하세요.
          </div>
        )}
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-fit border border-slate-200 px-3 py-1 text-xs text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              ← 템플릿 목록으로
            </button>
          </div>
          <div className="flex flex-col items-stretch gap-2 md:w-48">
            <button
              type="button"
              onClick={handleExport}
              disabled={!template || exportMutation.isPending}
              className="inline-flex items-center justify-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {exportMutation.isPending ? "PDF 변환 중..." : "PDF 변환"}
            </button>
          </div>
        </header>
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-ink">이력서 미리보기</h2>
              <p className="mt-1 text-xs text-slate-500">영역을 클릭하거나 드래그해 선택하면 오른쪽에서 스타일을 조정할 수 있습니다.</p>
            </div>
            <div className="flex justify-center overflow-hidden pb-4">
              {isFetching && !template ? (
                <p className="text-sm text-slate-600">미리보기를 불러오는 중입니다...</p>
              ) : (
                <PreviewPane setRightPanelViewType={setRightPanelViewType} />
              )}
            </div>
          </div>

          <aside className="flex h-fit flex-col gap-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-accent">편집 도구</h3>
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setRightPanelViewType('editor')}
                    className={`rounded-full px-3 py-1 transition ${
                      rightPanelViewType === 'editor'
                        ? 'bg-accent text-white'
                        : 'border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    페이지 설정
                  </button>
                  <button
                    type="button"
                    onClick={() => setRightPanelViewType('style')}
                    className={`rounded-full px-3 py-1 transition ${
                      rightPanelViewType === 'style'
                        ? 'bg-accent text-white'
                        : 'border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    블록 스타일
                  </button>
                </div>
              </div>

              {rightPanelViewType === 'editor' ? (
                <div className="space-y-4">
                  <PageLayoutPanel />
                  <div className="max-h-[50vh] overflow-y-auto pr-1">
                    <ResumeEditor />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <BlockStylePanel setRightPanelViewType={setRightPanelViewType} />
                </div>
              )}
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
};

export default TemplateWorkspace;
