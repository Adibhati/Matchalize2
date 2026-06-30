export const triggerHaptic = (pattern = 'medium') => {
  if (!navigator.vibrate) return;
  const patterns = {
    light: 10,
    medium: 20,
    heavy: 40,
    double: [20, 50, 20],
    triple: [15, 40, 15, 40, 15],
    swipe: 15,
    match: [30, 60, 50],
  };
  const vibe = patterns[pattern] || patterns.medium;
  navigator.vibrate(vibe);
};
