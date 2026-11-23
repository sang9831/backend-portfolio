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

  // 2. Before / After Latency Bar Chart
  const latencyMetrics = [
    { name: "판매자 주문 목록 조회 (p95)", before: 2080, after: 49.44, unit: "ms", reduction: "97.6%", note: "페이지 우선 조회 · 단순 COUNT" },
    { name: "DROP 통계 조회 (p95)", before: 10770, after: 280.92, unit: "ms", reduction: "97.4%", note: "페이지 선별 후 통계 집계" },
    { name: "대시보드 요약 (p95)", before: 7500, after: 362.20, unit: "ms", reduction: "95.2%", note: "요약 쿼리 5회 → 단일 집계" },
    { name: "동시 주문 상세 조회 (p95)", before: 651.6, after: 39.77, unit: "ms", reduction: "93.9%", note: "목록 개선에 따른 DB 풀 경합 완화" },
    { name: "주문 생성 (p95)", before: 4080, after: 1360, unit: "ms", reduction: "66.7%", note: "동시 상한(20) · 단일 UPDATE" },
    { name: "Brevo SMTP 수신자 1명 추가 비용", before: 643, after: 134, unit: "ms", reduction: "79.2%", note: "개별 발송 → BCC 묶음 전송" }
  ];

  const chartContainer = document.getElementById("latencyChart");
  let scaleMode = "linear"; // 'linear' | 'log'

  function formatVal(val, unit) {
    if (val >= 1000 && unit === "ms") {
      return `${val.toLocaleString("en-US")}ms`;
    }
    return `${val}${unit}`;
  }

  function renderLatencyChart() {
    if (!chartContainer) return;
    const maxLinear = Math.max(...latencyMetrics.map((m) => m.before));
    const maxLog = Math.log10(maxLinear + 1);

    chartContainer.innerHTML = latencyMetrics
      .map((m) => {
        const beforePct =
          scaleMode === "log"
            ? (Math.log10(m.before + 1) / maxLog) * 100
            : (m.before / maxLinear) * 100;
        const afterPct =
          scaleMode === "log"
            ? (Math.log10(m.after + 1) / maxLog) * 100
            : Math.max((m.after / maxLinear) * 100, 1.2);

        return `
          <div class="bar-item">
            <div class="bar-meta">
              <span class="bar-name">${m.name} <span style="font-weight:400;color:var(--text-dim);font-size:0.78rem;">· ${m.note}</span></span>
              <span class="bar-values">
                <span class="num-before">${formatVal(m.before, m.unit)}</span>
                <span>→</span>
                <span class="num-after">${formatVal(m.after, m.unit)}</span>
                <span class="tag green">-${m.reduction}</span>
              </span>
            </div>
            <div class="bar-track" title="Before: ${m.before}ms → After: ${m.after}ms (-${m.reduction})">
              <div class="bar-before" style="width: ${beforePct.toFixed(1)}%"></div>
              <div class="bar-after" style="width: ${afterPct.toFixed(1)}%"></div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  document.querySelectorAll("[data-scale]").forEach((btn) => {
    btn.addEventListener("click", () => {
      scaleMode = btn.getAttribute("data-scale");
      document.querySelectorAll("[data-scale]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderLatencyChart();
    });
  });

  renderLatencyChart();

  // 3. Tabs (for GRAB modules)
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
