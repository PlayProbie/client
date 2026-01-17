import { Button } from '@/components/ui/button';

type Tab = 'overview' | 'questions' | 'details';

type QuestionAnalysisTabsProps = {
  readonly onTabChange: (tab: Tab) => void;
  readonly activeTab: Tab;
};

const tabs: { id: Tab; label: string }[] = [
  { id: 'overview', label: '설문 개요' },
  { id: 'questions', label: '질문별 분석' },
  { id: 'details', label: '세부 데이터' },
];

/**
 * 설문 분석 탭 네비게이션
 */
function QuestionAnalysisTabs({
  onTabChange,
  activeTab,
}: QuestionAnalysisTabsProps) {
  return (
    <div className="border-b border-border">
      <nav className="-mb-px flex gap-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            onClick={() => onTabChange(tab.id)}
            className={`rounded-none border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
            }`}
          >
            {tab.label}
          </Button>
        ))}
      </nav>
    </div>
  );
}

export { QuestionAnalysisTabs };
export type { Tab };
