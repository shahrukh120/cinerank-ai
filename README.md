<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🎬 CineRank

![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

**CineRank.ai** is a community-driven entertainment library that ranks Movies, Series, and Anime based on genuine user engagement rather than critic reviews. 

Unlike traditional platforms that rely on static ratings, CineRank uses a custom weighted algorithm that combines **Star Ratings**, **Likes/Dislikes**, and **Vote Confidence** to generate a dynamic "CineRank Score."

🌐 **Live Site:** [https://www.cinerank.in](https://www.cinerank.in)

---

## ✨ Key Features

- **🏆 Dynamic Leaderboard:** Items are ranked by the proprietary **CineRank Score** (0-100%).
- **👑 Hall of Fame:** A live leaderboard showcasing top contributors who add content to the library.
- **🗳️ Community Voting:**
  - **Star Rating:** 5-star rating system.
  - **Like/Dislike:** Quick sentiment voting.
  - **Comments:** Real-time discussions on every title.
- **🔐 Google Authentication:** Secure login via Firebase Auth to prevent spam voting.
- **⚡ Admin Dashboard:**
  - Moderation tools to delete spam comments.
  - Ability to remove/anonymize contributors from the Hall of Fame.
  - Content management (Delete items).
- **🎬 Smart Metadata:** Automatically fetches posters, trailers, and streaming links via **TMDB API**.

---

## 🧠 The CineRank Algorithm

The core of this platform is the **CineRank Score**, calculated using a weighted formula that balances quality (Stars) with popularity (Likes) and reliability (Confidence).

```math
CineRank = (0.6 \times RatingScore + 0.4 \times LikeScore) \times ConfidenceFactor
