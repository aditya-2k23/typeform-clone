import ResultsClient from "@/components/results/ResultsClient";

export default async function ResultsPage(props: PageProps<"/forms/[id]/results">) {
  const { id } = await props.params;

  return <ResultsClient formId={id} />;
}
