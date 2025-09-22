import { useNavigate } from 'react-router-dom';
import { TemplateList } from '../components/TemplateList';
import { useTemplateList } from '../hooks/useTemplates';

const Home = () => {
  const navigate = useNavigate();
  const { data: templates, isLoading } = useTemplateList();

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <header className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-accent">My Resume</p>
          <h1 className="mt-3 text-3xl font-semibold text-ink">페이지 보정이 가능한 이력서 퍼블리셔</h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            템플릿을 선택하고 바로 편집을 시작하세요. 편집 화면에서는 보이는 그대로의 이력서를 직접 드래그해
            여백과 텍스트 스타일을 조절하고, PDF로 변환할 수 있습니다.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-ink">이력서 템플릿 선택</h2>
            <p className="mt-1 text-xs text-slate-500">템플릿을 클릭하면 편집 화면으로 이동합니다.</p>
          </div>
          <TemplateList
            templates={templates}
            selectedId={undefined}
            onSelect={(templateId) => navigate(`/template/${templateId}`)}
            isLoading={isLoading}
          />
        </section>
      </div>
    </div>
  );
};

export default Home;
