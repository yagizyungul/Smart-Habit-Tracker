/**
 * Verilen tarih dizisinden (YYYY-MM-DD string'leri) mevcut ve en uzun streak'i hesaplar.
 * frequency ve targetDays'e göre hedeflenen günler dışındaki boşlukları atlar.
 */
function calcStreak(completedDates, frequency = 'daily', targetDays = [0, 1, 2, 3, 4, 5, 6]) {
  if (!completedDates || completedDates.length === 0) return { currentStreak: 0, bestStreak: 0 };

  const dateSet = new Set(completedDates);
  const sorted = [...completedDates].sort((a, b) => (a < b ? 1 : -1)); // azalan sıra

  const isTargetDay = (dateStr) => {
    if (frequency === 'daily') return true;
    const dayOfWeek = new Date(dateStr + 'T00:00:00').getDay();
    return targetDays.includes(dayOfWeek);
  };

  const prevTargetDay = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    for (let i = 1; i <= 7; i++) {
      d.setDate(d.getDate() - 1);
      const prev = d.toISOString().split('T')[0];
      if (isTargetDay(prev)) return prev;
    }
    return null;
  };

  // Mevcut streak — bugünden veya dünden başla
  let today = new Date().toISOString().split('T')[0];
  let currentStreak = 0;
  let cursor = today;

  if (!isTargetDay(cursor)) cursor = prevTargetDay(cursor);

  while (cursor && dateSet.has(cursor)) {
    currentStreak++;
    cursor = prevTargetDay(cursor);
  }

  // En uzun streak — tüm geçmişi tara
  let bestStreak = 0;
  let tempStreak = 0;
  let prev = null;

  for (const dateStr of sorted) {
    if (!isTargetDay(dateStr)) continue;

    if (prev === null) {
      tempStreak = 1;
    } else {
      const expectedPrev = prevTargetDay(prev);
      if (expectedPrev === dateStr) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }

    if (tempStreak > bestStreak) bestStreak = tempStreak;
    prev = dateStr;
  }

  return { currentStreak, bestStreak };
}

/**
 * Verilen tarih listesinden belirli bir aralıktaki tamamlanma yüzdesini hesaplar.
 * @param {string[]} completedDates - YYYY-MM-DD formatında tamamlanan günler
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @param {string} frequency
 * @param {number[]} targetDays
 */
function calcCompletionRate(completedDates, startDate, endDate, frequency = 'daily', targetDays = [0, 1, 2, 3, 4, 5, 6]) {
  const dateSet = new Set(completedDates);
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');

  let expected = 0;
  let completed = 0;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay();

    const isTarget = frequency === 'daily' || targetDays.includes(dayOfWeek);
    if (!isTarget) continue;

    expected++;
    if (dateSet.has(dateStr)) completed++;
  }

  if (expected === 0) return { completionRate: 0, completedDays: 0, totalExpected: 0 };
  return {
    completionRate: Math.round((completed / expected) * 100),
    completedDays: completed,
    totalExpected: expected,
  };
}

module.exports = { calcStreak, calcCompletionRate };
