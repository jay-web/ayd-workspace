'use client'
import Link from "next/link";

export default function HomePage() {
   const scrollToFeatures = () => {
    const el = document.getElementById("features");
    if (!el) return;

    el.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
  return (
   <main className="relative bg-gradient-to-br from-white via-gray-50 to-emerald-50">
     <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-120px] top-[-100px] h-80 w-80 rounded-full bg-emerald-100/60 blur-3xl" />
        <div className="absolute bottom-[-140px] right-[-120px] h-96 w-96 rounded-full bg-gray-200/50 blur-3xl" />
      </div>

     

   <section className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-24">
  <div className="mx-auto max-w-3xl text-center">
    <div className="mb-6 flex justify-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-500 text-xl font-bold text-white shadow-md">
        AYD
      </div>
    </div>

    <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
      AI-powered document workspace
    </p>

    <h1 className="text-5xl font-semibold tracking-[-0.04em] text-gray-900 sm:text-6xl">
      Ask your documents.
      <br />
      Get answers you can trust.
    </h1>

    <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
      Upload your documents, search with AI-powered retrieval, and get
      grounded answers based on your own data — fast, secure, and built for
      real work.
    </p>

    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
      <Link
        href="/login"
        className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-black hover:shadow-lg"
      >
        Get Started
      </Link>

     <button
  type="button"
  onClick={scrollToFeatures}
  className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50"
>
  Learn More
</button>
    </div>
  </div>
</section>

      <section
        id="features"
        className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-24"
      >
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
            Features
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-gray-900">
            Built for real document workflows
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg leading-7 text-gray-600">
            Everything you need to upload, search, and get grounded answers from
            your own data.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="group rounded-2xl border border-gray-200 bg-white/70 p-6 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <h3 className="text-sm font-semibold text-gray-900 transition-colors duration-200 group-hover:text-emerald-700">
              Grounded Answers
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Get responses backed by your own documents — not generic AI
              outputs.
            </p>
          </div>

          <div className="group rounded-2xl border border-gray-200 bg-white/70 p-6 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <h3 className="text-sm font-semibold text-gray-900 transition-colors duration-200 group-hover:text-emerald-700">
              Secure Workspace
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Your data stays private and isolated — built for real-world usage.
            </p>
          </div>

          <div className="group rounded-2xl border border-gray-200 bg-white/70 p-6 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <h3 className="text-sm font-semibold text-gray-900 transition-colors duration-200 group-hover:text-emerald-700">
              Fast Retrieval
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Search across documents instantly and get precise answers in
              seconds.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}