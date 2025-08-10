'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Simple Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Pegasus Bot Dashboard
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            The ultimate Discord bot management platform. Control everything from one powerful dashboard.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <button className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors">
                Get Started
              </button>
            </Link>
            <Link href="/docs">
              <button className="px-8 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition-colors">
                Documentation
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Simple Stats Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-gray-900 rounded-lg">
            <div className="text-4xl font-bold text-purple-400 mb-2">1000+</div>
            <div className="text-gray-400">Active Servers</div>
          </div>
          <div className="text-center p-8 bg-gray-900 rounded-lg">
            <div className="text-4xl font-bold text-pink-400 mb-2">50K+</div>
            <div className="text-gray-400">Users Served</div>
          </div>
          <div className="text-center p-8 bg-gray-900 rounded-lg">
            <div className="text-4xl font-bold text-blue-400 mb-2">99.9%</div>
            <div className="text-gray-400">Uptime</div>
          </div>
        </div>
      </div>

      {/* Simple Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">Powerful Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: 'Moderation', desc: 'Advanced auto-moderation and warning system' },
            { title: 'Economy', desc: 'Full economy system with shop and gambling' },
            { title: 'XP & Levels', desc: 'Customizable leveling with role rewards' },
            { title: 'Tickets', desc: 'Support ticket system with panels' },
            { title: 'Giveaways', desc: 'Create and manage server giveaways' },
            { title: 'Security', desc: 'Advanced security and audit logging' },
          ].map((feature, i) => (
            <div key={i} className="p-6 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors">
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="border-t border-gray-800 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-400">
            <p>© 2024 Pegasus Bot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}