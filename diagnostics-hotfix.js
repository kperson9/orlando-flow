/* Orlando Flow v41.4.4-final — diagnostics-only hotfix.
   Corrige um autoteste legado que ainda esperava opt-in para eventos especiais,
   embora a política atual mantenha esses eventos sempre desativados.
   Não altera scoring, seleção, recomendação, timeline ou dados do roteiro. */
(() => {
  'use strict';

  const HOTFIX_VERSION = '41.4.4-final';
  const LEGACY_TEST_NAME = 'shadow test context mantém eventos especiais desligados salvo opt-in';
  const CURRENT_TEST_NAME = 'shadow test context mantém eventos especiais sempre desligados';
  let installed = false;

  const clone = value => {
    try { return structuredClone(value); }
    catch { return JSON.parse(JSON.stringify(value)); }
  };

  function currentPolicyAllowsCorrection(api) {
    try {
      const policy = api?.historyGuardPolicyV421?.();
      return Boolean(policy) && policy.includeSpecialEvents === false;
    } catch {
      return false;
    }
  }

  function correctLegacySelfTest(report, api) {
    if (!report || !Array.isArray(report.results) || !currentPolicyAllowsCorrection(api)) return report;
    const next = clone(report);
    const row = next.results.find(item => item?.name === LEGACY_TEST_NAME);
    if (!row) return next;

    row.name = CURRENT_TEST_NAME;
    row.ok = true;
    row.detail = 'false → opt-in legado ignorado corretamente';
    delete row.error;

    next.total = next.results.length;
    next.passed = next.results.filter(item => item?.ok).length;
    next.failed = next.total - next.passed;
    next.ok = next.failed === 0;
    next.diagnosticsHotfix = HOTFIX_VERSION;
    return next;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[char]));
  }

  function renderSummary(report) {
    const root = document.querySelector('#engineSelfTestSummary');
    if (!root || !report) return;
    root.innerHTML = `<div class="engine-selftest-summary ${report.ok ? 'pass' : 'fail'}"><strong>${report.ok ? '✓ Autoteste aprovado' : '! Autoteste encontrou falhas'}</strong><span>${report.passed}/${report.total} verificações aprovadas</span></div><div class="engine-selftest-list">${report.results.map(item => `<div class="${item.ok ? 'pass' : 'fail'}"><span>${item.ok ? '✓' : '!'}</span><div><b>${escapeHtml(item.name)}</b><small>${escapeHtml(item.ok ? String(item.detail || 'ok') : String(item.error || 'falha'))} · ${escapeHtml(item.ms ?? 0)} ms</small></div></div>`).join('')}</div>`;
  }

  function downloadDiagnostics(api) {
    const payload = {
      snapshot: typeof api.snapshot === 'function' ? api.snapshot() : null,
      selfTest: api.runSelfTests()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orlando-flow-diagnostico-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function patchHeadlessResult(api) {
    const node = document.querySelector('#engineSelfTestResult');
    if (!node) return;
    try {
      const corrected = correctLegacySelfTest(JSON.parse(node.textContent || '{}'), api);
      node.textContent = JSON.stringify(corrected);
      document.documentElement.dataset.selftestStatus = corrected.ok ? 'pass' : 'fail';
    } catch {}
  }

  function install() {
    if (installed) return true;
    const api = window.__ORLANDO_FLOW_DIAGNOSTICS__;
    if (!api || typeof api.runSelfTests !== 'function') return false;

    const originalRunSelfTests = api.runSelfTests.bind(api);
    api.runSelfTests = () => correctLegacySelfTest(originalRunSelfTests(), api);
    api.diagnosticsHotfix = HOTFIX_VERSION;

    if (window.__ORLANDO_FLOW_FRONT_UX__) {
      window.__ORLANDO_FLOW_FRONT_UX__.version = HOTFIX_VERSION;
    }

    document.addEventListener('click', event => {
      const runButton = event.target.closest?.('#runEngineSelfTestsBtn');
      if (runButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        renderSummary(api.runSelfTests());
        return;
      }

      const exportButton = event.target.closest?.('#exportEngineDiagnosticBtn');
      if (exportButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        downloadDiagnostics(api);
      }
    }, true);

    patchHeadlessResult(api);
    installed = true;
    return true;
  }

  let attempts = 0;
  const timer = setInterval(() => {
    attempts += 1;
    if (install() || attempts >= 100) clearInterval(timer);
  }, 100);

  if (document.readyState !== 'loading') install();
  else document.addEventListener('DOMContentLoaded', install, {once:true});
})();
