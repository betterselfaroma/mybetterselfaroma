"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-cream-100 px-4 text-center">
      <p className="max-w-sm text-sm leading-relaxed text-taupe-600">
        出现错误，请稍后再试，或通过 WhatsApp 联系我们。
        <br />
        Something went wrong. Please try again or contact us on WhatsApp.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-sage-700 px-6 py-3 text-sm font-medium text-cream-50 transition-colors hover:bg-sage-800"
        >
          重试 · Try again
        </button>
        <a
          href="https://wa.me/60124761919"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-sage-300 bg-cream-50 px-6 py-3 text-sm font-medium text-sage-700 transition-colors hover:border-sage-500"
        >
          WhatsApp 联系我们
        </a>
      </div>
    </div>
  );
}
