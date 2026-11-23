(function () {
  // 1. Copy to Clipboard Toast
  const toastEl = document.getElementById("toast");
  let toastTimer = null;

  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2000);
  }

  document.querySelectorAll("[data-copy]").forEach((el) => {
    el.addEventListener("click", () => {
      const val = el.getAttribute("data-copy");
      if (navigator.clipboard && val) {
        navigator.clipboard.writeText(val).then(() => {
          showToast(`복사됨: ${val}`);
        });
      }
    });
  });

  // 2. Tabs (for GRAB modules)
  document.querySelectorAll("[data-tab-group]").forEach((group) => {
    const buttons = group.querySelectorAll(".tab-btn");
    const panels = group.querySelectorAll(".tab-panel");

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-tab");
        buttons.forEach((b) => b.classList.remove("active"));
        panels.forEach((p) => p.classList.remove("active"));
        btn.classList.add("active");
        const activePanel = group.querySelector(`[data-panel="${target}"]`);
        if (activePanel) activePanel.classList.add("active");
      });
    });
  });

  // 5. Interactive Cosine Similarity Curve (마주한끼)
  const simSlider = document.getElementById("simSlider");
  const simValueEl = document.getElementById("simValue");
  const simScoreEl = document.getElementById("simScore");
  const simTierEl = document.getElementById("simTier");
  const simDot = document.getElementById("simDot");
  const simGuideX = document.getElementById("simGuideX");
  const simGuideY = document.getElementById("simGuideY");

  function calcSimilarityScore(s) {
    if (s <= 0.2) {
      return Math.max(0, (s / 0.2) * 30);
    } else if (s <= 0.5) {
      return 30 + ((s - 0.2) / 0.3) * 40;
    } else {
      return 70 + ((s - 0.5) / 0.5) * 30;
    }
  }

  function updateSimilarityWidget() {
    if (!simSlider) return;
    const s = parseFloat(simSlider.value);
    const score = calcSimilarityScore(s);
    const rounded = Math.round(score);

    if (simValueEl) simValueEl.textContent = s.toFixed(2);
    if (simScoreEl) simScoreEl.textContent = `${rounded}점`;

    if (simTierEl) {
      if (s <= 0.2) {
        simTierEl.textContent = "구간 1 (s ≤ 0.20): max(0, (s / 0.20) × 30)";
      } else if (s <= 0.5) {
        simTierEl.textContent = "구간 2 (0.20 < s ≤ 0.50): 30 + ((s − 0.20) / 0.30) × 40";
      } else {
        simTierEl.textContent = "구간 3 (0.50 < s ≤ 1.00): 70 + ((s − 0.50) / 0.50) × 30";
      }
    }

    // SVG coordinate mapping: x in [40, 380], y in [180, 20]
    const cx = 40 + s * 340;
    const cy = 180 - (score / 100) * 160;

    if (simDot) {
      simDot.setAttribute("cx", cx.toFixed(1));
      simDot.setAttribute("cy", cy.toFixed(1));
    }
    if (simGuideX) {
      simGuideX.setAttribute("x1", cx.toFixed(1));
      simGuideX.setAttribute("x2", cx.toFixed(1));
      simGuideX.setAttribute("y1", cy.toFixed(1));
      simGuideX.setAttribute("y2", "180");
    }
    if (simGuideY) {
      simGuideY.setAttribute("x1", "40");
      simGuideY.setAttribute("x2", cx.toFixed(1));
      simGuideY.setAttribute("y1", cy.toFixed(1));
      simGuideY.setAttribute("y2", cy.toFixed(1));
    }
  }

  if (simSlider) {
    simSlider.addEventListener("input", updateSimilarityWidget);
    updateSimilarityWidget();
  }
})();
