// infrastructure/research-scraper/src/viral-score.js
// Logic for calculating virality score

function calculateViralityScore(likes, retweets, replies) {
  return likes + (2 * retweets) + (3 * replies);
}

module.exports = { calculateViralityScore };
