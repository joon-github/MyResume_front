import { TemplateSummary } from '../types/template';

interface TemplateListProps {
  templates?: TemplateSummary[];
  selectedId?: string;
  onSelect: (templateId: string) => void;
  isLoading?: boolean;
}

const LoadingItem = () => (
  <div className="animate-pulse rounded-lg border border-slate-200 bg-slate-100 p-4">
    <div className="mb-2 h-5 w-1/2 rounded bg-slate-300" />
    <div className="h-4 w-2/3 rounded bg-slate-200" />
  </div>
);

export const TemplateList = ({ templates, selectedId, onSelect, isLoading }: TemplateListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <LoadingItem />
        <LoadingItem />
        <LoadingItem />
      </div>
    );
  }

  if (!templates || templates.length === 0) {
    return <p className="text-sm text-slate-600">등록된 템플릿이 없습니다.</p>;
  }

  return (
    <div className="space-y-3">
      {templates.map((template) => {
        const isActive = template.id === selectedId;

        return (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template.id)}
            className={`w-full rounded-lg border p-4 text-left transition hover:shadow-sm ${
              isActive
                ? 'border-accent bg-accent/10 shadow-sm'
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-ink">{template.name}</h3>
                <p className="mt-1 text-xs text-slate-600">{template.description}</p>
              </div>
              {template.previewColors && template.previewColors.length > 0 && (
                <div className="flex gap-1">
                  {template.previewColors.map((color) => (
                    <span
                      key={color}
                      className="inline-block h-4 w-4 rounded-full border border-white shadow"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              )}
            </div>
            {template.tags && template.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {template.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
