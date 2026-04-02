import React from 'react';
import { useStore } from '../store/useStore';

const Home = () => {
    const { count, increment } = useStore();

    return (
        <div className="relative isolate px-6 pt-14 lg:px-8">
            <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 text-center">
                <div className="mb-8 flex justify-center">
                    <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-zinc-400 ring-1 ring-zinc-800 hover:ring-zinc-700">
                        Announcing our next-gen stack.{' '}
                        <a href="#" className="font-semibold text-indigo-400">
                            <span className="absolute inset-0" aria-hidden="true" />
                            Read more <span aria-hidden="true">&rarr;</span>
                        </a>
                    </div>
                </div>
                <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl bg-linear-to-b from-white to-zinc-500 bg-clip-text text-transparent">
                    Modern Web Development Redefined
                </h1>
                <p className="mt-6 text-lg leading-8 text-zinc-400">
                    Experience the power of Vite, React Router, Axios, Zustand, and Tailwind CSS v4 in one seamless, high-performance starter kit.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <button
                        onClick={increment}
                        className="rounded-xl bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-indigo-600 active:scale-95"
                    >
                        Counter: {count}
                    </button>
                    <a href="#" className="text-sm font-semibold leading-6 text-white transition-colors hover:text-indigo-400">
                        Learn more <span aria-hidden="true">→</span>
                    </a>
                </div>
            </div>

            <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-linear-to-tr from-indigo-500 to-purple-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
            </div>
        </div>
    );
};

export default Home;
