import Link from "next/link"
import { Twitter, Linkedin, Github } from "lucide-react"

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-gray-950 to-gray-900 text-gray-400 mt-auto overflow-hidden">
      {/* Grid pattern */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg
          className="absolute w-[200%] h-[200%] -left-1/2 -top-1/4 opacity-30"
          style={{
            transform: "perspective(600px) rotateX(60deg)",
            transformOrigin: "center top",
          }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="footer-grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#footer-grid)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="h-7 w-7 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg" />
              <span className="text-xl font-bold text-white">Aipplify</span>
            </Link>
            <p className="text-sm leading-relaxed mb-5 max-w-xs">
              AI-powered job board for crypto, Web3, and artificial intelligence careers.
              Every listing is scored for quality and safety.
            </p>
            <div className="flex gap-3">
              <a href="https://twitter.com/aipplify" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:border-primary/40 transition-all">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="https://linkedin.com/company/aipplify" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:border-primary/40 transition-all">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="https://github.com/aipplify" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:border-primary/40 transition-all">
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Popular Searches */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Popular Searches</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Remote Jobs", q: "remote" },
                { label: "AI Engineer Jobs", q: "ai+engineer" },
                { label: "Crypto Jobs", q: "crypto" },
                { label: "Web3 Developer", q: "web3+developer" },
                { label: "Solidity Jobs", q: "solidity" },
                { label: "Data Scientist", q: "data+scientist" },
                { label: "ML Engineer", q: "machine+learning" },
                { label: "DeFi Jobs", q: "defi" },
              ].map((item) => (
                <li key={item.q}>
                  <Link href={`/jobs?search=${item.q}`} className="text-sm hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* By Skill */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">By Skill</h4>
            <ul className="space-y-2.5">
              {[
                { label: "React / Next.js", q: "react" },
                { label: "Python", q: "python" },
                { label: "Rust", q: "rust" },
                { label: "TypeScript", q: "typescript" },
                { label: "Smart Contracts", q: "smart+contract" },
                { label: "DevOps / Infra", q: "devops" },
                { label: "Product Manager", q: "product+manager" },
                { label: "Security Audit", q: "security+audit" },
              ].map((item) => (
                <li key={item.q}>
                  <Link href={`/jobs?search=${item.q}`} className="text-sm hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Companies */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Top Companies</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Binance", slug: "binance" },
                { label: "Coinbase", slug: "coinbase" },
                { label: "BitMEX", slug: "bitmex" },
                { label: "Tether", slug: "tether-operations-limited" },
                { label: "BrainRocket", slug: "brainrocket" },
                { label: "10ARX", slug: "10arx" },
              ].map((c) => (
                <li key={c.slug}>
                  <Link href={`/companies/${c.slug}`} className="text-sm hover:text-white transition-colors">
                    {c.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/companies" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                  All companies &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Resources</h4>
            <ul className="space-y-2.5">
              {[
                { label: "About Aipplify", href: "/about" },
                { label: "Blog", href: "/blog" },
                { label: "For Recruiters", href: "/for-recruiters" },
                { label: "Companies", href: "/companies" },
                { label: "Contact", href: "/contact" },
                { label: "Saved Jobs", href: "/saved-jobs" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-gray-500">
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
            <Link href="/jobs" className="hover:text-gray-300 transition-colors">Browse Jobs</Link>
            <Link href="/blog" className="hover:text-gray-300 transition-colors">Blog</Link>
          </div>
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} Aipplify. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
