import PublicFormClient from "@/components/public/PublicFormClient";

export default async function PublicFormPage(props: PageProps<"/public/forms/[slug]">) {
  const { slug } = await props.params;

  return <PublicFormClient slug={slug} />;
}
