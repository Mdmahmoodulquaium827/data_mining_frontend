
import Link from "next/link";

const features = [
  {
    number: "01",
    title: "Automated Web Scraping",
    description:
      "Enter a target website URL to collect product information and organize the extracted data for further analysis.",
  },
  {
    number: "02",
    title: "Data Overview & Cleaning",
    description:
      "Inspect the collected dataset, analyze missing values, identify duplicate records, and understand data types and quality.",
  },
  {
    number: "03",
    title: "Machine Learning",
    description:
      "Apply regression, classification, and clustering techniques to discover patterns and generate useful predictions.",
  },
  {
    number: "04",
    title: "Data Visualization",
    description:
      "Explore product distributions, model performance, classification results, and clustering patterns through charts.",
  },
];

const technologies = [
  {
    category: "Frontend",
    items: [
      "Next.js",
      "React",
      "Redux Toolkit",
      "Tailwind CSS",
      "Recharts",
    ],
  },
  {
    category: "Backend",
    items: ["Node.js", "Express.js"],
  },
  {
    category: "Data Processing",
    items: ["Python", "Pandas", "NumPy"],
  },
  {
    category: "Machine Learning",
    items: [
      "Scikit-learn",
      "Regression",
      "Classification",
      "K-Means",
    ],
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-slate-800">

      {/* Hero Section */}
      <section className="bg-slate-50 border-b border-gray-100 px-5 py-20 md:py-28">
        <div className="max-w-5xl mx-auto text-center">

          <p className="text-sm font-semibold tracking-[0.2em] text-gray-500 uppercase mb-5">
            About Our Platform
          </p>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
            Turning Web Data into
            <span className="block text-gray-500">
              Meaningful Insights
            </span>
          </h1>

          <p className="max-w-2xl mx-auto mt-7 text-gray-600 text-base md:text-lg leading-8">
            DATA MINING is a web-based platform designed to collect,
            process, analyze, and visualize product data from target
            e-commerce websites using automated web technologies,
            data processing, and machine learning techniques.
          </p>

          <div className="mt-9">
            <Link
              href="/"
              className="inline-flex bg-black text-white px-7 py-3.5 rounded-full font-semibold text-sm hover:bg-gray-800 transition"
            >
              Start New Mining
            </Link>
          </div>

        </div>
      </section>

      {/* Introduction */}
      <section className="max-w-6xl mx-auto px-5 py-20">

        <div className="grid md:grid-cols-2 gap-12 items-center">

          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
              Who We Are
            </p>

            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
              Making Product Data More Useful
            </h2>

            <p className="text-gray-600 mt-6 leading-8">
              E-commerce websites contain large amounts of product
              information, including product names, prices, categories,
              brands, ratings, and other attributes.
            </p>

            <p className="text-gray-600 mt-4 leading-8">
              DATA MINING provides a structured workflow for collecting
              this information, preparing the dataset, and applying
              analytical methods to extract meaningful patterns.
            </p>

            <p className="text-gray-600 mt-4 leading-8">
              The platform uses a Next.js frontend and an Express.js
              backend, while Python-based tools support data processing
              and machine learning operations.
            </p>
          </div>

          <div className="bg-slate-50 border border-gray-200 rounded-2xl p-8 md:p-10">
            <h3 className="text-xl font-semibold mb-6">
              Our Main Workflow
            </h3>

            <div className="space-y-5">
              {[
                ["01", "Enter Target Website URL"],
                ["02", "Collect Product Information"],
                ["03", "Clean and Prepare Dataset"],
                ["04", "Apply Machine Learning"],
                ["05", "Analyze and Visualize Results"],
              ].map(([number, title]) => (
                <div key={number} className="flex items-center gap-4">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold">
                    {number}
                  </div>

                  <p className="font-medium text-slate-700">
                    {title}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-20 px-5">

        <div className="max-w-6xl mx-auto">

          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
              What We Offer
            </p>

            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Platform Features
            </h2>

            <p className="text-gray-500 mt-4 leading-7">
              A complete workflow for collecting, preparing, and
              analyzing e-commerce product information.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">

            {features.map((feature) => (
              <div
                key={feature.number}
                className="bg-white border border-gray-200 rounded-xl p-7 hover:shadow-md transition"
              >
                <div className="flex justify-between items-center mb-6">
                  <span className="text-3xl">
                    {feature.icon}
                  </span>

                  <span className="text-sm font-semibold text-gray-400">
                    {feature.number}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-slate-900">
                  {feature.title}
                </h3>

                <p className="text-gray-500 mt-3 leading-7 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* Technologies */}
      <section className="max-w-6xl mx-auto px-5 py-20">

        <div className="text-center">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
            Technology
          </p>

          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Technologies Behind the Platform
          </h2>

          <p className="max-w-2xl mx-auto text-gray-500 mt-5 leading-7">
            The platform combines modern frontend development,
            backend technologies, data processing, and machine
            learning tools.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mt-12">

          {technologies.map((technology) => (
            <div
              key={technology.category}
              className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-5">
                {technology.category}
              </h3>

              <div className="flex flex-wrap gap-3">
                {technology.items.map((item) => (
                  <span
                    key={item}
                    className="bg-slate-50 border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}

        </div>
      </section>

      {/* Mission */}
      <section className="bg-black text-white px-5 py-20">

        <div className="max-w-4xl mx-auto text-center">

          <p className="text-sm text-gray-400 font-semibold uppercase tracking-widest mb-4">
            Our Mission
          </p>

          <h2 className="text-3xl md:text-5xl font-bold leading-tight">
            Transforming Raw Web Data into Actionable Knowledge
          </h2>

          <p className="text-gray-300 mt-6 max-w-2xl mx-auto leading-8">
            Our goal is to make product data collection and analysis
            more organized, accessible, and useful by combining
            automated data collection, backend technologies,
            data processing, and machine learning techniques.
          </p>

          <Link
            href="/"
            className="inline-flex mt-9 bg-white text-black px-7 py-3.5 rounded-full font-semibold text-sm hover:bg-gray-200 transition"
          >
            Start New Mining
          </Link>

        </div>
      </section>

    </main>
  );
}
