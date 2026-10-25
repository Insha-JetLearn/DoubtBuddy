import confetti from "canvas-confetti";

export const triggerPerfectScoreConfetti = () => {
  // Multiphase colorful confetti celebration
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ["#FBBF24", "#F59E0B", "#10B981", "#3B82F6", "#EC4899"],
  });
  fire(0.2, {
    spread: 60,
    colors: ["#FBBF24", "#F59E0B", "#10B981"],
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};

export const triggerStarBurst = (x = 0.5, y = 0.5) => {
  confetti({
    particleCount: 25,
    spread: 45,
    origin: { x, y },
    colors: ["#FBBF24", "#F59E0B", "#FEF08A"],
    ticks: 60,
    gravity: 1.2,
    scalar: 0.7,
  });
};
