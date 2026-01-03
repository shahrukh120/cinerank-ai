import React from 'react';

/* =========================
   ABOUT
========================= */
export const About = () => (
  <div className="max-w-4xl mx-auto text-zinc-300 p-8 animate-fade-in">
    <h1 className="text-4xl font-bold text-white mb-6">
      About CineRank Entertainments
    </h1>

    <p className="mb-4">
      CineRank is a community-driven library dedicated to uncovering hidden gems
      in Movies, Series, and Anime.
    </p>

    <p className="mb-4">
      Unlike standard databases, our rankings are democratic. Users vote on what
      they truly love, creating a leaderboard that reflects genuine fan favorites
      rather than critic reviews.
    </p>

    {/* TMDB Attribution */}
    <p className="mt-6 text-sm text-zinc-500">
      CineRank uses third-party APIs for movie and TV metadata.
      This product uses the TMDB API but is not endorsed or certified by TMDB.
    </p>
  </div>
);

/* =========================
   PRIVACY POLICY
========================= */
export const Privacy = () => (
  <div className="max-w-4xl mx-auto text-zinc-300 p-8 animate-fade-in">
    <h1 className="text-4xl font-bold text-white mb-6">
      Privacy Policy
    </h1>

    <p className="mb-4 text-sm text-zinc-400">
      Last Updated: January 2026
    </p>

    <p className="mb-4">
      <strong>1. Data Collection:</strong> We collect only the minimum information
      required to operate CineRank. This includes your email address and profile
      photo when you sign in using Google Login, which helps authenticate users
      and prevent spam voting.
    </p>

    <p className="mb-4">
      <strong>2. Usage of Data:</strong> Your data is never sold or shared with
      unauthorized parties. It is used solely to manage authentication, prevent
      abuse, and track your contributions to the leaderboard.
    </p>

    <p className="mb-4">
      <strong>3. Cookies & Analytics:</strong> CineRank may use cookies and
      analytics tools to understand user behavior, improve performance, and
      enhance overall user experience.
    </p>

    <p className="mb-4">
      <strong>4. Third-Party Services:</strong> We rely on third-party services
      such as authentication providers, analytics tools, and content APIs to
      operate the platform effectively.
    </p>

    <p className="mb-4">
      <strong>5. Advertising:</strong> CineRank may also display advertisements in the
      future. Advertising partners may use cookies or similar technologies in
      accordance with their own privacy policies.
    </p>

    <p className="mb-4">
      <strong>6. User Rights:</strong> You may request deletion of your account and
      associated data at any time by contacting us.
    </p>
    <p className="mb-4">
     CineRank focuses on discovery and community discussion and does not aim to replace any official rating platforms.
     </p>
  </div>
);

/* =========================
   TERMS OF SERVICE
========================= */
export const Terms = () => (
  <div className="max-w-4xl mx-auto text-zinc-300 p-8 animate-fade-in">
    <h1 className="text-4xl font-bold text-white mb-6">
      Terms of Service
    </h1>

    <p className="mb-4">
      By using CineRank Entertainments, you agree to the following terms:
    </p>

    <ul className="list-disc pl-5 space-y-2 mb-6">
      <li>Do not use hate speech, abusive language, or offensive content.</li>
      <li>Do not spam the platform or misuse the "Add New" feature.</li>
      <li>Respect the integrity of the community-driven voting system.</li>
      <li>Do not attempt to manipulate rankings or exploit platform features.</li>
    </ul>

    {/* Legal protection line */}
    <p className="text-sm text-zinc-500">
      CineRank does not host, stream, or distribute movies or TV shows.
      All content metadata is displayed strictly for informational purposes.
    </p>
  </div>
);

/* =========================
   CONTACT
========================= */
export const Contact = () => (
  <div className="max-w-4xl mx-auto text-zinc-300 p-8 animate-fade-in">
    <h1 className="text-4xl font-bold text-white mb-6">
      Contact Us
    </h1>

    <p className="mb-4">
      Have a suggestion, feature request, or found a bug?
    </p>

    <p className="text-xl text-purple-400 font-bold">
      khanshahrukh00988@gmail.com
    </p>

    <p className="mt-4 text-sm text-zinc-500">
      We usually respond within 24 hours.
    </p>
  </div>
);
