
import { Link } from "react-router-dom"

function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200/80 mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-forest)] flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-[var(--color-forest)]">MedLink</span>
            </div>
            <p className="text-slate-500 leading-relaxed max-w-sm text-sm">
              AI-guided healthcare platform connecting patients with verified doctors. Know who to see, before you walk in.
            </p>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-slate-400 mb-4 font-semibold">
              Company
            </h4>
            <div className="space-y-3">
              <Link to="/" className="block text-sm text-slate-600 hover:text-[var(--color-forest)] transition">
                About Us
              </Link>
              <Link to="/doctors" className="block text-sm text-slate-600 hover:text-[var(--color-forest)] transition">
                Find Doctors
              </Link>
              <Link to="/feed" className="block text-sm text-slate-600 hover:text-[var(--color-forest)] transition">
                Community
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-slate-400 mb-4 font-semibold">
              Resources
            </h4>
            <div className="space-y-3">
              <Link to="/symptom-checker" className="block text-sm text-slate-600 hover:text-[var(--color-forest)] transition">
                AI Symptom Checker
              </Link>
              <Link to="/login" className="block text-sm text-slate-600 hover:text-[var(--color-forest)] transition">
                Log in
              </Link>
              <Link to="/register" className="block text-sm text-slate-600 hover:text-[var(--color-forest)] transition">
                Sign up
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            © 2026 MedLink Healthcare. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-400">
            <span className="hover:text-slate-600 cursor-pointer transition">Privacy Policy</span>
            <span className="hover:text-slate-600 cursor-pointer transition">Terms of Service</span>
            <span className="hover:text-slate-600 cursor-pointer transition">Help Center</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
