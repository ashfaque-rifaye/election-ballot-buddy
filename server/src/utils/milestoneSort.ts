/**
 * Milestone Sorting Utility
 * Built with Google Antigravity & Vertex AI
 *
 * Sorts election milestones in chronological order.
 * Property 3: Output list has each date <= the next date.
 */
import { Milestone } from '../../shared/types';

/**
 * Sort milestones by date in ascending (chronological) order.
 * Returns a new array — does not mutate the input.
 */
export function sortMilestones(milestones: Milestone[]): Milestone[] {
  return [...milestones].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateA - dateB;
  });
}
