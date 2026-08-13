import BuilderClient from "@/components/builder/BuilderClient";

export default async function BuilderPage(props: PageProps<"/forms/[id]/builder">) {
  const { id } = await props.params;

  return <BuilderClient formId={id} />;
}
