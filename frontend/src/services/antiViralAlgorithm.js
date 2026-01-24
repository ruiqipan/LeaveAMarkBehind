/**
 * Anti-Viral Algorithm for Mark Selection
 * Prioritizes content with lower engagement to prevent viral spread
 * and ensure diverse discovery experiences
 */

/**
 * Select a mark using inverse probability based on view count
 * Lower engagement = higher probability of selection
 * @param {Array} marks - Array of marks at a location
 * @returns {object|null} Selected mark or null if no marks
 */
export const selectMark = (marks) => {
  if (!marks || marks.length === 0) {
    return null;
  }

  // If only one mark, return it
  if (marks.length === 1) {
    return marks[0];
  }

  // Calculate inverse probability based on view count
  const maxViews = Math.max(...marks.map((m) => m.view_count || 0), 1);

  // Assign weights (inverse to view count)
  // Lower view count = higher weight = higher probability
  const weights = marks.map((mark) => {
    const viewCount = mark.view_count || 0;
    // Ensure minimum weight of 1 for marks with max views
    const baseWeight = maxViews - viewCount + 1;
    return baseWeight;
  });

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  // Weighted random selection
  let random = Math.random() * totalWeight;
  for (let i = 0; i < marks.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return marks[i];
    }
  }

  // Fallback to last mark (should never reach here)
  return marks[marks.length - 1];
};

/**
 * Select mark with combined engagement metric (views + adds)
 * @param {Array} marks - Array of marks at a location
 * @param {number} viewWeight - Weight for view count (default 1.0)
 * @param {number} addWeight - Weight for add count (default 0.5)
 * @returns {object|null} Selected mark or null if no marks
 */
export const selectMarkByEngagement = (marks, viewWeight = 1.0, addWeight = 0.5) => {
  if (!marks || marks.length === 0) {
    return null;
  }

  if (marks.length === 1) {
    return marks[0];
  }

  // Calculate combined engagement score
  const marksWithEngagement = marks.map((mark) => ({
    ...mark,
    engagementScore:
      (mark.view_count || 0) * viewWeight + (mark.add_count || 0) * addWeight,
  }));

  const maxEngagement = Math.max(
    ...marksWithEngagement.map((m) => m.engagementScore),
    1
  );

  // Assign weights inversely proportional to engagement
  const weights = marksWithEngagement.map((mark) => {
    return maxEngagement - mark.engagementScore + 1;
  });

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  // Weighted random selection
  let random = Math.random() * totalWeight;
  for (let i = 0; i < marksWithEngagement.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return marksWithEngagement[i];
    }
  }

  return marksWithEngagement[marksWithEngagement.length - 1];
};

/**
 * Select mark with recency bias
 * Newer marks with low engagement get even higher priority
 * @param {Array} marks - Array of marks at a location
 * @param {number} recencyBonus - Bonus multiplier for recent marks (default 2.0)
 * @returns {object|null} Selected mark or null if no marks
 */
export const selectMarkWithRecency = (marks, recencyBonus = 2.0) => {
  if (!marks || marks.length === 0) {
    return null;
  }

  if (marks.length === 1) {
    return marks[0];
  }

  const now = Date.now();
  const maxViews = Math.max(...marks.map((m) => m.view_count || 0), 1);

  // Assign weights with recency bonus
  const weights = marks.map((mark) => {
    const viewCount = mark.view_count || 0;
    const baseWeight = maxViews - viewCount + 1;

    // Calculate age in hours
    const createdAt = new Date(mark.created_at).getTime();
    const ageHours = (now - createdAt) / (1000 * 60 * 60);

    // Apply recency bonus (stronger for newer marks)
    // Marks less than 6 hours old get full bonus
    // Bonus decreases linearly over 24 hours
    const recencyMultiplier =
      ageHours < 6 ? recencyBonus : Math.max(1, recencyBonus - (ageHours - 6) / 18);

    return baseWeight * recencyMultiplier;
  });

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  // Weighted random selection
  let random = Math.random() * totalWeight;
  for (let i = 0; i < marks.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return marks[i];
    }
  }

  return marks[marks.length - 1];
};

/**
 * Sort marks by anti-viral ranking
 * Lower engagement first, with randomization
 * @param {Array} marks - Array of marks
 * @returns {Array} Sorted marks
 */
export const sortByAntiViral = (marks) => {
  if (!marks || marks.length === 0) {
    return [];
  }

  // Add small random factor to prevent deterministic ordering
  return [...marks].sort((a, b) => {
    const engagementA = (a.view_count || 0) + (a.add_count || 0) * 0.5;
    const engagementB = (b.view_count || 0) + (b.add_count || 0) * 0.5;

    // Add random noise (±10% of engagement)
    const noiseA = engagementA * (Math.random() * 0.2 - 0.1);
    const noiseB = engagementB * (Math.random() * 0.2 - 0.1);

    return engagementA + noiseA - (engagementB + noiseB);
  });
};

/**
 * Calculate probability of selection for a mark
 * @param {object} mark - Mark to calculate probability for
 * @param {Array} marks - All marks at the location
 * @returns {number} Probability between 0 and 1
 */
export const getSelectionProbability = (mark, marks) => {
  if (!marks || marks.length === 0) return 0;
  if (marks.length === 1) return 1;

  const maxViews = Math.max(...marks.map((m) => m.view_count || 0), 1);
  const weights = marks.map((m) => maxViews - (m.view_count || 0) + 1);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  const markIndex = marks.findIndex((m) => m.id === mark.id);
  if (markIndex === -1) return 0;

  return weights[markIndex] / totalWeight;
};

export default {
  selectMark,
  selectMarkByEngagement,
  selectMarkWithRecency,
  sortByAntiViral,
  getSelectionProbability,
};
