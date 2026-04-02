import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const Layout = () => {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30">
            <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20" />
                        <span className="text-xl font-bold tracking-tight text-white">Getyovo</span>
                    </div>
                    <div className="hidden space-x-8 md:flex">
                        <Link to="/" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">Home</Link>
                        <Link to="/features" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">Features</Link>
                        <Link to="/about" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">About</Link>
                    </div>
                    <button className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition-transform hover:scale-105 active:scale-95">
                        Get Started
                    </button>
                </div>
            </nav>
            <main>
                <Outlet />
            </main>
            <footer className="border-t border-zinc-900 bg-zinc-950 py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-sm text-zinc-500">
                        &copy; {new Date().getFullYear()} Getyovo. Built with React, Vite, and Tailwind 4.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
