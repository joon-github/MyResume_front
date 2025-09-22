import { ChangeEvent } from 'react';
import { useEditorStore } from '../store/editorStore';
import { TemplateField } from '../types/template';

const resolveValue = (
  sectionId: string,
  fieldId: string,
  content: ReturnType<typeof useEditorStore.getState>['content']
) => content[sectionId]?.[fieldId] ?? '';

const normalizeListValue = (value: string | string[]) => {
  if (Array.isArray(value)) {
    return value.join('\n');
  }
  return value;
};

const parseListInput = (value: string) => value.split('\n').map((item) => item.trim()).filter(Boolean);

const FieldInput = ({
  sectionId,
  field,
  value,
  onChange
}: {
  sectionId: string;
  field: TemplateField;
  value: string | string[];
  onChange: (value: string | string[]) => void;
}) => {
  const commonProps = {
    id: `${sectionId}-${field.id}`,
    name: field.id,
    placeholder: field.placeholder,
    className:
      'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30',
    maxLength: field.maxLength
  } as const;

  if (field.type === 'textarea') {
    return (
      <textarea
        {...commonProps}
        rows={4}
        value={typeof value === 'string' ? value : normalizeListValue(value)}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)}
      />
    );
  }

  if (field.type === 'list') {
    return (
      <textarea
        {...commonProps}
        rows={5}
        value={normalizeListValue(value)}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange(parseListInput(event.target.value))}
      />
    );
  }

  return (
    <input
      {...commonProps}
      type="text"
      value={typeof value === 'string' ? value : normalizeListValue(value)}
      onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
    />
  );
};

export const ResumeEditor = () => {
  const template = useEditorStore((state) => state.template);
  const content = useEditorStore((state) => state.content);
  const updateField = useEditorStore((state) => state.updateField);

  if (!template) {
    return <p className="text-sm text-slate-600">템플릿을 선택하면 편집을 시작할 수 있습니다.</p>;
  }

  return (
    <div className="space-y-6">
      {template.sections.map((section) => (
        <section key={section.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-ink">{section.title}</h3>
              {section.description && (
                <p className="mt-1 text-xs text-slate-500">{section.description}</p>
              )}
            </div>
          </div>
          <div className="space-y-4">
            {section.fields.map((field) => {
              const value = resolveValue(section.id, field.id, content);

                return (
                  <div key={field.id} className="space-y-2">
                    <label htmlFor={`${section.id}-${field.id}`} className="text-xs font-medium text-slate-600">
                      {field.label}
                    </label>
                    <FieldInput
                      sectionId={section.id}
                      field={field}
                      value={value}
                      onChange={(nextValue) => updateField(section.id, field.id, nextValue)}
                    />
                    {field.helperText && (
                      <p className="text-xs text-slate-500">{field.helperText}</p>
                    )}
                  </div>
                );
              })}
            </div>
        </section>
      ))}
    </div>
  );
};
