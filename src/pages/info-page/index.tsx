import React from 'react';
import { Link } from 'react-router-dom';

interface InfoPageProps {
  title: string;
  description: string;
}

const InfoPage: React.FC<InfoPageProps> = ({ title, description }) => {
  return (
    <div className="min-h-screen bg-white px-4 py-16">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">LiqLearns</p>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl">{title}</h1>
        <p className="mt-4 text-base text-gray-600 sm:text-lg">{description}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            className="rounded-full border border-orange-500 px-6 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
            to="/"
          >
            Back to Home
          </Link>
          <Link
            className="rounded-full bg-orange-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
            to="/login"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;