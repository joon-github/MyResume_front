import {
  CSSProperties,
  MouseEvent as ReactMouseEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  resolveOverride,
  selectAutoPaginate,
  selectContent,
  selectOverrides,
  selectPagePadding,
  selectSelectedBlockId,
  selectHeader,
  selectTemplate,
  useEditorStore
} from '../store/editorStore';
import type { StyleOverride } from '../store/editorStore';
import { TemplateField, TemplateSection } from '../types/template';

const MM_TO_PX = 96 / 25.4;
const PAGE_HEIGHT_PX = 297 * MM_TO_PX;
interface BlockMeta {
  blockId: string;
  section: TemplateSection;
  field: TemplateField;
  override: StyleOverride;
}


type PageBlocks = BlockMeta[][];


interface SelectionBox {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  active: boolean;
  pageRect: DOMRect;
  pageIndex: number;
  pageElement: HTMLElement;
}

interface HighlightRect {
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

const resolveValue = (
  sectionId: string,
  field: TemplateField,
  content: ReturnType<typeof useEditorStore.getState>['content']
) => {
  const sectionContent = content[sectionId] ?? {};
  const value = sectionContent[field.id];
  if (field.type === 'list') {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string') {
      return value
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  }
  if (typeof value === 'string') {
    return value;
  }
  return '';
};

const buildBlockStyle = (override: StyleOverride): CSSProperties => {
  return {
    ['--block-font-scale' as any]: override.fontScale.toString(),
    ['--block-text-color' as any]: override.textColor,
    marginTop: `${override.spacing.top}px`,
    marginBottom: `${override.spacing.bottom}px`
  };
};

const Block = ({
  blockId,
  field,
  section: _section,
  value,
  override,
  isSelected,
  isMeasurement
}: BlockMeta & { value: string | string[]; isSelected: boolean; isMeasurement?: boolean }) => {
  const style = buildBlockStyle(override);

  if (field.type === 'list' && Array.isArray(value)) {
    return (
      <div
        data-block-id={blockId}
        data-measure-block={isMeasurement ? blockId : undefined}
        className={`section-block ${isSelected ? 'section-block--selected' : ''}`}
        style={style}
      >
        <h3 className="block-title">{field.label}</h3>
        <ul className="block-list">
          {value.map((item, index) => (
            <li key={`${blockId}-${index}`}>{item}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
      <div
        data-block-id={blockId}
        data-measure-block={isMeasurement ? blockId : undefined}
        className={`section-block ${isSelected ? 'section-block--selected' : ''}`}
        style={style}
      >
        <h3 className="block-title">{field.label}</h3>
        <p className="block-text">{value as string}</p>
    </div>
  );
};

interface PreviewPaneProps {
  setRightPanelViewType?: (view: 'editor' | 'style') => void;
}

export const PreviewPane = ({ setRightPanelViewType }: PreviewPaneProps) => {
  const template = useEditorStore(selectTemplate);
  const content = useEditorStore(selectContent);
  const overrides = useEditorStore(selectOverrides);
  const selectedBlockId = useEditorStore(selectSelectedBlockId);
  const setSelectedBlock = useEditorStore((state) => state.setSelectedBlock);
  const pagePadding = useEditorStore(selectPagePadding);
  const autoPaginate = useEditorStore(selectAutoPaginate);
  const header = useEditorStore(selectHeader);

  const containerRef = useRef<HTMLDivElement>(null);
  const measurementRef = useRef<HTMLDivElement>(null);
  const firstPageRef = useRef<HTMLDivElement>(null);
  const firstContentRef = useRef<HTMLDivElement>(null);

  const [pageBlocks, setPageBlocks] = useState<PageBlocks>([]);
  const [dragState, setDragState] = useState<SelectionBox | null>(null);
  const [highlightRect, setHighlightRect] = useState<HighlightRect | null>(null);
  const [overflowPx, setOverflowPx] = useState(0);

  const blocks: BlockMeta[] = useMemo(() => {
    if (!template) {
      return [];
    }
    return template.sections.flatMap((section) =>
      section.fields.map((field) => ({
        blockId: `${section.id}.${field.id}`,
        section,
        field,
        override: resolveOverride(overrides, `${section.id}.${field.id}`)
      }))
    );
  }, [template]);

  const headerTitle = header.title?.trim() || template?.meta?.headerTitle || template?.name || '';
  const headerSubtitle = header.subtitle?.trim() ?? template?.meta?.headerSubtitle ?? template?.description ?? '';
  const showHeader = header.showHeader ?? template?.meta?.showHeader ?? true;

  useLayoutEffect(() => {
    if (!template || !autoPaginate) {
      setPageBlocks([]);
      return;
    }

    const measurement = measurementRef.current;
    if (!measurement) {
      return;
    }

    if (!measurement.querySelector<HTMLElement>('[data-measure-content]')) {
      return;
    }

    const available = Math.max(0, PAGE_HEIGHT_PX - (pagePadding.top + pagePadding.bottom));

    const blockElements = Array.from(
      measurement.querySelectorAll<HTMLElement>('[data-measure-block]')
    );

    const pages: PageBlocks = [];
    let current: BlockMeta[] = [];
    let currentHeight = 0;

    blockElements.forEach((element, index) => {
      const blockMeta = blocks[index];
      if (!blockMeta) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const styles = window.getComputedStyle(element);
      const marginTop = Number.parseFloat(styles.marginTop || '0');
      const marginBottom = Number.parseFloat(styles.marginBottom || '0');
      const blockHeight = rect.height + marginTop + marginBottom;
      const override = resolveOverride(overrides, blockMeta.blockId);

      const wouldOverflow = current.length > 0 && currentHeight + blockHeight > available + 0.5;
      if (wouldOverflow) {
        pages.push(current);
        current = [];
        currentHeight = 0;
      }

      current.push(blockMeta);
      currentHeight += blockHeight;

      if (override.forcePageBreak) {
        pages.push(current);
        current = [];
        currentHeight = 0;
      }
    });

    if (current.length > 0) {
      pages.push(current);
    }

    setPageBlocks(pages);
  }, [autoPaginate, blocks, pagePadding, template, content, overrides]);

  useLayoutEffect(() => {
    if (autoPaginate) {
      setOverflowPx(0);
      return;
    }

    const available = Math.max(0, PAGE_HEIGHT_PX - (pagePadding.top + pagePadding.bottom));
    const inner = firstContentRef.current;
    if (!inner) {
      setOverflowPx(0);
      return;
    }

    setOverflowPx(Math.max(0, inner.scrollHeight - available));
  }, [autoPaginate, blocks, content, overrides, pagePadding]);

  useEffect(() => {
    if (!selectedBlockId) {
      setHighlightRect(null);
      return;
    }
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const blockElement = container.querySelector<HTMLElement>(`[data-block-id="${selectedBlockId}"]`);
    if (!blockElement) {
      setHighlightRect(null);
      return;
    }
    const pageElement = blockElement.closest<HTMLElement>('[data-page-index]');
    if (!pageElement) {
      setHighlightRect(null);
      return;
    }
    const rect = blockElement.getBoundingClientRect();
    const pageRect = pageElement.getBoundingClientRect();
    const pageIndex = Number(pageElement.dataset.pageIndex ?? '0');

    setHighlightRect({
      pageIndex,
      x: rect.left - pageRect.left,
      y: rect.top - pageRect.top,
      width: rect.width,
      height: rect.height
    });
  }, [autoPaginate, pageBlocks, selectedBlockId, overrides, pagePadding, content]);

  useEffect(() => {
    if (!dragState?.active) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      setDragState((current) =>
        current
          ? {
              ...current,
              currentX: event.clientX,
              currentY: event.clientY
            }
          : null
      );
    };

    const handleMouseUp = (event: MouseEvent) => {
      const state = dragState;
      setDragState(null);
      if (!state) {
        return;
      }

      const { startX, startY, pageElement } = state;
      const endX = event.clientX;
      const endY = event.clientY;

      const width = Math.abs(endX - startX);
      const height = Math.abs(endY - startY);
      const isClick = width < 4 && height < 4;
      let targetBlockId: string | undefined;

      if (isClick) {
        const element = event.target instanceof HTMLElement ? event.target : null;
        const blockElement = element?.closest<HTMLElement>('[data-block-id]');
        targetBlockId = blockElement?.dataset.blockId;
      } else {
        const bounds = {
          left: Math.min(startX, endX),
          right: Math.max(startX, endX),
          top: Math.min(startY, endY),
          bottom: Math.max(startY, endY)
        };

        const blockElements = Array.from(pageElement.querySelectorAll<HTMLElement>('[data-block-id]'));
        const found = blockElements.find((block) => {
          const rect = block.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          return (
            centerX >= bounds.left &&
            centerX <= bounds.right &&
            centerY >= bounds.top &&
            centerY <= bounds.bottom
          );
        });

        targetBlockId = found?.dataset.blockId;
      }
      setSelectedBlock(targetBlockId);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp, { once: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, setSelectedBlock]);

  const pagesToRender: PageBlocks = useMemo(() => {
    if (!template) {
      return [];
    }
    if (autoPaginate && pageBlocks.length > 0) {
      return pageBlocks;
    }
    return [blocks];
  }, [autoPaginate, pageBlocks, blocks, template]);

  if (!template) {
    return <p className="text-sm text-slate-600">미리보기는 템플릿을 선택한 이후 활성화됩니다.</p>;
  }

  const handleMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    const pageElement = (event.target as HTMLElement).closest<HTMLElement>('[data-page-index]');
    if (!pageElement) {
      return;
    }

    const pageRect = pageElement.getBoundingClientRect();
    const pageIndex = Number(pageElement.dataset.pageIndex ?? '0');

    setDragState({
      startX: event.clientX,
      startY: event.clientY,
      currentX: event.clientX,
      currentY: event.clientY,
      active: true,
      pageRect,
      pageIndex,
      pageElement
    });

    if (event.target instanceof HTMLElement) {
      const blockElement = event.target.closest<HTMLElement>('[data-block-id]');
      if (blockElement) {
        setSelectedBlock(blockElement.dataset.blockId);
      }
    }

    event.preventDefault();
  };

  const renderSelectionOverlay = (pageIndex: number) => {
    if (!dragState?.active || dragState.pageIndex !== pageIndex) {
      return null;
    }

    const { pageRect, startX, startY, currentX, currentY } = dragState;
    const left = Math.min(startX, currentX) - pageRect.left;
    const top = Math.min(startY, currentY) - pageRect.top;
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    return <div className="selection-overlay" style={{ left, top, width, height }} />;
  };

  const overflowNotice =
    !autoPaginate && overflowPx > 0 ? (
      <div className="overflow-warning">
        페이지 높이를 약 {Math.ceil(overflowPx)}px 초과했습니다. 텍스트 크기나 여백을 조정해 주세요.
      </div>
    ) : null;

  return (
    <div className="preview-shell">
      <style>{template.styles}</style>

      {autoPaginate && template && (
        <div
          ref={measurementRef}
          aria-hidden
          style={{
            position: 'absolute',
            visibility: 'hidden',
            pointerEvents: 'none',
            width: '210mm',
            left: '-9999px',
            top: 0
          }}
        >
          <div
            className="print-page"
            style={{
              paddingTop: `${pagePadding.top}px`,
              paddingRight: `${pagePadding.right}px`,
              paddingBottom: `${pagePadding.bottom}px`,
              paddingLeft: `${pagePadding.left}px`,
              boxSizing: 'border-box',
              height: 'auto',
              overflow: 'visible',
              boxShadow: 'none'
            }}
          >
            <main className="print-content" data-measure-content>
              {template.sections.map((section) => (
                <div className="print-section" key={`measure-sec-${section.id}`}>
                  <h2 className="section-title">{section.title}</h2>
                  <div className="section-body">
                    {section.fields.map((field) => {
                      const blockId = `${section.id}.${field.id}`;
                      const override = resolveOverride(overrides, blockId);
                      const value = resolveValue(section.id, field, content);
                      return (
                        <Block
                          key={`measure-${blockId}`}
                          blockId={blockId}
                          field={field}
                          value={value}
                          override={override}
                          isSelected={false}
                          section={section}
                          isMeasurement
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </main>
          </div>
        </div>
      )}

      <div ref={containerRef} className="flex flex-col items-center gap-6">
        {pagesToRender.map((page, pageIndex) => (
          <div className="preview-wrapper" key={`page-${pageIndex}`}>
            <div
              ref={!autoPaginate && pageIndex === 0 ? firstPageRef : undefined}
              className="print-page"
              data-page-index={pageIndex}
              onMouseDown={handleMouseDown}
              style={{
                paddingTop: `${pagePadding.top}px`,
                paddingRight: `${pagePadding.right}px`,
                paddingBottom: `${pagePadding.bottom}px`,
                paddingLeft: `${pagePadding.left}px`
              }}
            >
              {pageIndex === 0 ? (
                showHeader ? (
                  <header className="print-header">
                    <div>
                      <p className="print-title">{headerTitle}</p>
                      {headerSubtitle && <p className="print-subtitle">{headerSubtitle}</p>}
                    </div>
                    <span className="print-page-number">Page {pageIndex + 1}</span>
                  </header>
                ) : (
                  <div className="print-page-number-secondary">Page {pageIndex + 1}</div>
                )
              ) : (
                <div className="print-page-number-secondary">Page {pageIndex + 1}</div>
              )}
              <main ref={!autoPaginate && pageIndex === 0 ? firstContentRef : undefined} className="print-content">
                {(() => {
                  const sectionsOnPage: JSX.Element[] = [];
                  let currentSectionId: string | null = null;
                  let currentFields: JSX.Element[] = [];

                  let currentSectionMeta: TemplateSection | null = null;

                  const flushSection = () => {
                    if (!currentSectionId || !currentSectionMeta || currentFields.length === 0) {
                      return;
                    }
                    sectionsOnPage.push(
                      <div className="print-section" key={`${pageIndex}-${currentSectionId}-${sectionsOnPage.length}`}>
                        <h2 className="section-title">{currentSectionMeta.title}</h2>
                        <div className="section-body">{currentFields}</div>
                      </div>
                    );
                  };

                  page.forEach((block) => {
                    const override = resolveOverride(overrides, block.blockId);
                    const value = resolveValue(block.section.id, block.field, content);
                    const fieldNode = (
                      <Block
                        key={block.blockId}
                        blockId={block.blockId}
                        field={block.field}
                        value={value}
                        override={override}
                        isSelected={selectedBlockId === block.blockId}
                        section={block.section}
                      />
                    );

                    if (block.section.id !== currentSectionId) {
                      flushSection();
                      currentSectionId = block.section.id;
                      currentSectionMeta = block.section;
                      currentFields = [fieldNode];
                    } else {
                      currentFields.push(fieldNode);
                    }
                  });

                  flushSection();

                  return sectionsOnPage;
                })()}
              </main>
              {highlightRect && highlightRect.pageIndex === pageIndex && (
                <div
                  className="selection-highlight"
                  style={{
                    left: highlightRect.x,
                    top: highlightRect.y,
                    width: highlightRect.width,
                    height: highlightRect.height
                  }}
                />
              )}
              {renderSelectionOverlay(pageIndex)}
              {pageIndex === 0 && overflowNotice}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
