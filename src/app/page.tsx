import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4">
      
      {/* Title */}
      <h1 className="text-4xl font-bold text-gray-900">
        AYD Workspace
      </h1>

      {/* Subtitle */}
      <p className="mt-4 max-w-xl text-center text-gray-600">
        Upload your documents and ask questions using AI-powered retrieval.
        Get accurate answers grounded in your own data.
      </p>

      {/* CTA Buttons */}
      <div className="mt-8 flex gap-4">
        <Link
          href="/login"
          className="rounded-lg bg-black px-6 py-3 text-white hover:bg-gray-800">
            Get Started
        </Link>

        <button className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-200">
          Learn More
        </button>
      </div>

    </main>
  )
}
