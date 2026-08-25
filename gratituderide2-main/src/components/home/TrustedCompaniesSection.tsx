"use client";

import { trustedCompanies } from "@/data/dummy/homepage";

export function TrustedCompaniesSection() {
  return (
    <section className="py-14 sm:py-16 bg-white border-b border-border">
      <div className="container-app mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-muted tracking-wide mb-10">
          Trusted by leading companies across Nigeria
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
          {trustedCompanies.map((company) => (
            <div
              key={company.name}
              className="flex items-center gap-3 opacity-70"
            >
              <div className="h-11 w-11 rounded-xl bg-dark/[0.04] flex items-center justify-center text-sm font-bold text-muted">
                {company.logo}
              </div>
              <span className="text-sm font-semibold text-dark/70 hidden sm:block">
                {company.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
