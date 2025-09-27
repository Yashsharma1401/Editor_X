export default function CompletionMessage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 flex items-center justify-center p-6 animate-in fade-in duration-1000">
      <div className="relative w-full max-w-5xl">
        {/* glow */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500/30 via-fuchsia-500/30 to-emerald-500/30 blur-2xl animate-pulse" />
        <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-10 animate-in zoom-in-95 duration-1000">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-wider animate-in slide-in-from-top duration-500">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Demo Ready
              </div>
              <h1 className="mt-4 text-4xl md:text-5xl font-black leading-tight animate-in slide-in-from-left duration-700">
                Stateless 2D Editor — Mini Canva with Shareable Links
              </h1>
              <p className="mt-4 text-slate-300 text-base md:text-lg leading-relaxed animate-in slide-in-from-left duration-700 delay-200">
                Built with React, Fabric.js, and Firebase Firestore. Create shapes, draw with a pen,
                edit colors and text, auto-save to scene URLs, and share instantly—no login required.
              </p>

              <ul className="mt-6 grid sm:grid-cols-2 gap-3 text-sm animate-in slide-in-from-left duration-700 delay-300">
                <li className="flex items-center gap-2 transition-all duration-300 hover:translate-x-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Canvas tools: Rectangle, Circle, Text, Pen, Delete
                </li>
                <li className="flex items-center gap-2 transition-all duration-300 hover:translate-x-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Edit selected: Fill color, text content
                </li>
                <li className="flex items-center gap-2 transition-all duration-300 hover:translate-x-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  Stateless routing: /canvas/:id with auto-generate on /
                </li>
                <li className="flex items-center gap-2 transition-all duration-300 hover:translate-x-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  Firestore autosave + load with debounce
                </li>
                <li className="flex items-center gap-2 transition-all duration-300 hover:translate-x-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
                  Share button copies live URL
                </li>
                <li className="flex items-center gap-2 transition-all duration-300 hover:translate-x-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
                  Full-viewport canvas with smooth resize
                </li>
              </ul>
            </div>

            {/* action card */}
            <div className="w-full md:w-80 shrink-0">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="text-sm text-slate-300">
                  Quick Actions
                </div>
                <div className="mt-4 grid gap-3">
                  <a href="/" className="inline-flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 font-medium transition">
                    New Canvas
                  </a>
                  <a href="http://localhost:5175/" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 font-medium transition">
                    View Live Demo
                  </a>
                  <div className="text-xs text-slate-400 mt-4">
                    <strong>Note:</strong> For cross-device sharing, deploy Firestore rules in Firebase Console → Firestore → Rules:
                    <pre className="mt-2 p-2 bg-black/20 rounded text-xs overflow-x-auto">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scenes/{sceneId} {
      allow read, write: if true;
    }
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* footer badges */}
          <div className="mt-8 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1">React</span>
            <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1">Fabric.js</span>
            <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1">Firebase Firestore</span>
            <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1">Tailwind CSS</span>
          </div>
        </div>
      </div>
    </div>
  )
}
