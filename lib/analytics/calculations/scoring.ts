export function clampScore(score: number): number {
  if (score < 0) return 0;
  if (score > 10) return 10;
  return Number(score.toFixed(2));
}

export function averageScores(scores: Array<number | null | undefined>): number | null {
  const validScores = scores.filter(
    (score): score is number => typeof score === "number" && !Number.isNaN(score)
  );

  if (!validScores.length) {
    return null;
  }

  const total = validScores.reduce((sum, score) => sum + score, 0);
  return clampScore(total / validScores.length);
}