import Link from "next/link"
import { Facebook, Twitter, Linkedin, Instagram, Github } from "lucide-react"

export function Footer() {
  const jobCategories = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "AI/ML Engineer",
    "DevOps Engineer",
    "Blockchain Developer",
    "Mobile Developer",
    "Data Scientist"
  ]

  const locations = [
    "Remote Jobs",
    "USA Jobs",
    "Europe Jobs",
    "Asia Jobs",
    "Global Jobs"
  ]

  const experienceLevels = [
    "Intern",
    "Junior",
    "Mid Level",
    "Senior",
    "Lead"
  ]

  return (
    <footer className="bg-gray-50 border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="h-6 w-6 bg-gradient-primary rounded"></div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Aipplify
              </span>
            </Link>
            <p className="text-gray-600 mb-4">
              AI-powered job board connecting talented professionals with top companies worldwide.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Job Categories */}
          <div>
            <h3 className="font-semibold mb-4">Job Categories</h3>
            <ul className="space-y-2">
              {jobCategories.map((category) => (
                <li key={category}>
                  <Link 
                    href={`/jobs?category=${category.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Locations */}
          <div>
            <h3 className="font-semibold mb-4">Locations</h3>
            <ul className="space-y-2">
              {locations.map((location) => (
                <li key={location}>
                  <Link 
                    href={`/jobs?location=${location.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    {location}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Experience Levels */}
          <div>
            <h3 className="font-semibold mb-4">Experience</h3>
            <ul className="space-y-2">
              {experienceLevels.map((level) => (
                <li key={level}>
                  <Link 
                    href={`/jobs?experience=${level.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    {level}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              <Link href="/about" className="hover:text-primary transition-colors">
                About Us
              </Link>
              <Link href="/blog" className="hover:text-primary transition-colors">
                Blog
              </Link>
              <Link href="/contact" className="hover:text-primary transition-colors">
                Contact
              </Link>
              <Link href="/for-recruiters" className="hover:text-primary transition-colors">
                For Recruiters
              </Link>
              <Link href="/privacy" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Aipplify. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
