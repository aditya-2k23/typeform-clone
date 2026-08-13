"use client";

interface ThankYouScreenProps {
  formTitle?: string;
}

export default function ThankYouScreen({ formTitle }: ThankYouScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white text-gray-900 px-6 text-center animate-in">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-900 text-white shadow-md">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        Thank you!
      </h1>

      <p className="max-w-md text-base text-gray-500 sm:text-lg">
        {formTitle ? (
          <>
            Your response for <span className="font-semibold text-gray-700">{formTitle}</span> has been successfully recorded.
          </>
        ) : (
          "Your response has been successfully recorded."
        )}
      </p>
    </div>
  );
}
