interface SurveyPlaceholderPageProps {
  title: string;
  description: string;
}

export default function SurveyPlaceholderPage({
  title,
  description,
}: SurveyPlaceholderPageProps) {
  return (
    <div className="bg-card rounded-lg border p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-2 text-sm">{description}</p>
    </div>
  );
}
