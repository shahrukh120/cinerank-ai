import { MediaItem } from './types';

export const calculateCineRank = (item: MediaItem) => {
  // 1. Get Counts
  const likes = item.likedBy?.length || 0;
  const dislikes = item.dislikedBy?.length || 0;
  
  const ratingsObj = item.starRatings || {};
  const ratingValues = Object.values(ratingsObj);
  const ratingCount = ratingValues.length;
  
  // Total Interactions (Votes)
  const totalVotes = likes + dislikes + ratingCount;

  // If nobody has interacted, score is 0
  if (totalVotes === 0) return 0;

  // 2. Calculate Like Score (0-100)
  // Formula: (Likes + 1) / (Likes + Dislikes + 2) * 100
  // We add +1/+2 for Laplace Smoothing (prevents 1/1 = 100% on first vote)
  const likeScore = ((likes + 1) / (likes + dislikes + 2)) * 100;

  // 3. Calculate Rating Score (0-100)
  let ratingScore = 0;
  if (ratingCount > 0) {
    const sumRatings = ratingValues.reduce((a, b) => a + b, 0);
    const avgRating = sumRatings / ratingCount;
    // Normalize 5 stars to 100
    ratingScore = (avgRating / 5) * 100;
  } else {
    // If no star ratings yet, fallback to Like Score or Neutral 50
    ratingScore = likeScore; 
  }

  // 4. Calculate Confidence Factor
  // As votes increase, confidence approaches 1. 
  // 6 votes ≈ 0.54 confidence. 600 votes ≈ 0.99 confidence.
  const confidence = totalVotes / (totalVotes + 5);

  // 5. Final Weighted Algo
  // 60% Weight to Stars, 40% Weight to Likes
  const weightedScore = (0.6 * ratingScore) + (0.4 * likeScore);

  return Math.round(weightedScore * confidence);
};