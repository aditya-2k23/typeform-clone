import Link from "next/link";

export default async function BuilderPage(props: PageProps<"/forms/[id]/builder">) {
  const { id } = await props.params;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold text-gray-900">Form Builder</h1>
      <p className="text-gray-500">
        Builder for form <code className="rounded bg-gray-100 px-2 py-0.5 text-sm">{id}</code> — coming soon.
      </p>
      <Link
        href="/"
        className="mt-4 rounded-full bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
      >
        ← Back to Dashboard
      </Link>
    </div>
  );
}
