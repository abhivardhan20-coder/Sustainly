export function calculateStreak(
  currentStreak: number,
  lastLoggedDate: string | null,
  newLogDate: string
): { streak: number; lastLoggedDate: string } {
  let streak = currentStreak;

  if (lastLoggedDate) {
    const lastDate = new Date(lastLoggedDate);
    const logDate = new Date(newLogDate);
    // Standardize to UTC midnight to avoid timezone issues with pure dates
    const utcLastDate = Date.UTC(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
    const utcLogDate = Date.UTC(logDate.getFullYear(), logDate.getMonth(), logDate.getDate());
    
    const diffDays = Math.floor((utcLogDate - utcLastDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak += 1;
    } else if (diffDays > 1) {
      streak = 1;
    }
  } else {
    streak = 1;
  }

  return { streak, lastLoggedDate: newLogDate };
}
