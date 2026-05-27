(function () {
  'use strict';

  var estimatorRoot = document.querySelector('[data-pricing-estimator]');
  if (!estimatorRoot) return;

  var pageLang = (document.documentElement.getAttribute('lang') || 'en').toLowerCase();
  var isItalian = pageLang.indexOf('it') === 0;
  var form = estimatorRoot.querySelector('.ai-estimator-form');
  var priceEl = estimatorRoot.querySelector('[data-estimator-price]');
  var summaryEl = estimatorRoot.querySelector('[data-estimator-summary]');
  var durationEl = estimatorRoot.querySelector('[data-estimator-duration]');
  var modelEl = estimatorRoot.querySelector('[data-estimator-model]');
  var ctaEl = estimatorRoot.querySelector('[data-estimator-cta]');
  var currencyFormatter = new Intl.NumberFormat(isItalian ? 'it-IT' : 'en-GB');

  if (!form || !priceEl || !summaryEl || !durationEl || !modelEl || !ctaEl) return;

  var activityConfig = {
    'prototype': { low: 4500, high: 6500, weeks: 1.2 },
    'automation': { low: 5800, high: 8200, weeks: 1.8 },
    'document-intelligence': { low: 6800, high: 9300, weeks: 2.2 },
    'integration': { low: 8200, high: 11000, weeks: 2.8 }
  };

  var timeframeConfig = {
    'standard': { multiplier: 1, durationFactor: 1 },
    'fast': { multiplier: 1.12, durationFactor: 0.88 },
    'urgent': { multiplier: 1.24, durationFactor: 0.76 }
  };

  var stackAdjustments = {
    'claude-code': { low: -150, high: 0, weeks: -0.1 },
    'cursor': { low: -100, high: 0, weeks: -0.05 },
    'github-copilot': { low: 75, high: 150, weeks: 0.05 },
    'custom-ai-stack': { low: 450, high: 950, weeks: 0.35 }
  };

  var labels = {
    activityType: {
      'prototype': isItalian ? 'Prototipo rapido / validazione concetto' : 'Rapid prototype / concept validation',
      'automation': isItalian ? 'Automazione workflow' : 'Workflow automation',
      'document-intelligence': isItalian ? 'Tender / analisi documentale con AI' : 'Tender / document intelligence',
      'integration': isItalian ? 'Integrazione workflow / tool interno' : 'Workflow integration / internal tool'
    },
    timeframe: {
      'standard': isItalian ? 'Sprint standard' : 'Standard sprint timeline',
      'fast': isItalian ? 'Delivery accelerata' : 'Accelerated delivery',
      'urgent': isItalian ? 'Finestra urgente / compressa' : 'Urgent / compressed window'
    },
    stack: {
      'claude-code': 'Claude Code',
      'cursor': 'Cursor',
      'github-copilot': 'GitHub Copilot',
      'custom-ai-stack': isItalian ? 'Custom AI / automation stack' : 'Custom AI / automation stack'
    },
    model: {
      sprint: isItalian ? 'Sprint focalizzato' : 'Focused sprint',
      rollout: isItalian ? 'Sprint + rollout' : 'Sprint + rollout path'
    },
    fallbackStack: isItalian ? 'Stack da definire' : 'Stack to be agreed'
  };

  function lowerFirst(text) {
    if (!text) return '';
    return text.charAt(0).toLowerCase() + text.slice(1);
  }

  function roundToHundreds(value) {
    return Math.round(value / 100) * 100;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function formatMoney(value) {
    return '\u00a3' + currencyFormatter.format(value);
  }

  function formatRange(low, high) {
    return formatMoney(low) + ' \u2013 ' + formatMoney(high);
  }

  function formatDuration(weeks) {
    if (weeks <= 1.2) return isItalian ? '1 settimana' : '1 week';
    if (weeks <= 1.8) return isItalian ? '1\u20132 settimane' : '1\u20132 weeks';
    if (weeks <= 2.4) return isItalian ? '2 settimane' : '2 weeks';
    if (weeks <= 3.1) return isItalian ? '2\u20133 settimane' : '2\u20133 weeks';
    if (weeks <= 3.8) return isItalian ? '3\u20134 settimane' : '3\u20134 weeks';
    return isItalian ? '4+ settimane' : '4+ weeks';
  }

  function getCheckedValues(name) {
    return Array.prototype.slice.call(form.querySelectorAll('input[name="' + name + '"]:checked')).map(function (input) {
      return input.value;
    });
  }

  function getState() {
    return {
      activityType: form.elements.activityType.value,
      timeframe: form.elements.timeframe.value,
      complexity: parseInt(form.elements.complexity.value, 10),
      integrations: parseInt(form.elements.integrations.value, 10),
      stack: getCheckedValues('stack'),
      handover: !!form.querySelector('input[name="handover"]:checked'),
      compliance: !!form.querySelector('input[name="compliance"]:checked')
    };
  }

  function getModelLabel(state, deliveryWeeks) {
    if (state.activityType === 'integration' || deliveryWeeks >= 3.2 || state.integrations >= 3) {
      return labels.model.rollout;
    }
    return labels.model.sprint;
  }

  function getComplexityDescriptor(level) {
    if (isItalian) {
      if (level <= 2) return 'un perimetro snello';
      if (level === 3) return 'una complessit\u00e0 intermedia';
      return 'una delivery pi\u00f9 articolata';
    }

    if (level <= 2) return 'a tight scope';
    if (level === 3) return 'moderate delivery complexity';
    return 'a heavier delivery shape';
  }

  function getIntegrationDescriptor(count) {
    if (isItalian) {
      if (count === 0) return 'nessuna integrazione';
      if (count === 1) return 'un punto di contatto con un altro sistema';
      if (count === 2) return 'pi\u00f9 passaggi tra sistemi';
      return 'una catena di handoff tra pi\u00f9 sistemi';
    }

    if (count === 0) return 'no system integration';
    if (count === 1) return 'one system touchpoint';
    if (count === 2) return 'multiple system touchpoints';
    return 'a multi-system handoff';
  }

  function getSummary(state, durationText) {
    var activity = lowerFirst(labels.activityType[state.activityType]);
    var complexity = getComplexityDescriptor(state.complexity);
    var integrations = getIntegrationDescriptor(state.integrations);
    var summary = '';

    if (isItalian) {
      summary = 'Buon fit per uno sprint di trasformazione su ' + activity + ', con ' + complexity + ' e ' + integrations + '.';
      summary += ' Di solito sta in ' + durationText;
      if (state.handover) {
        summary += ' con handover incluso';
      }
      if (state.compliance) {
        summary += state.handover ? ' e un passaggio extra su riservatezza e compliance' : ' con un passaggio extra su riservatezza e compliance';
      }
      return summary + '.';
    }

    summary = 'Best fit for an AEC transformation sprint around ' + activity + ', with ' + complexity + ' and ' + integrations + '.';
    summary += ' Most teams land in ' + durationText;
    if (state.handover) {
      summary += ' with handover included';
    }
    if (state.compliance) {
      summary += state.handover ? ' and an extra compliance pass' : ' with an extra compliance pass';
    }
    return summary + '.';
  }

  function buildPrefillMessage(state, priceText, durationText, stackNames) {
    var stackText = stackNames.length ? stackNames.join(', ') : labels.fallbackStack;
    if (isItalian) {
      return [
        'Vorrei discutere questo sprint AI:',
        '',
        'Tipo di attivit\u00e0: ' + labels.activityType[state.activityType],
        'Timeframe: ' + labels.timeframe[state.timeframe],
        'Complessit\u00e0: ' + state.complexity + '/5',
        'Integrazioni: ' + state.integrations,
        'Stack: ' + stackText,
        'Handover al team: ' + (state.handover ? 'S\u00ec' : 'No'),
        'Vincoli di riservatezza / compliance: ' + (state.compliance ? 'S\u00ec' : 'No'),
        'Range indicativo: ' + priceText,
        'Durata indicativa: ' + durationText,
        '',
        'Contesto / workflow da automatizzare:'
      ].join('\n');
    }

    return [
      'I\'d like to discuss this AI sprint:',
      '',
      'Activity type: ' + labels.activityType[state.activityType],
      'Timeframe: ' + labels.timeframe[state.timeframe],
      'Complexity: ' + state.complexity + '/5',
      'Integrations: ' + state.integrations,
      'Stack: ' + stackText,
      'Team handover: ' + (state.handover ? 'Yes' : 'No'),
      'Confidentiality / compliance constraints: ' + (state.compliance ? 'Yes' : 'No'),
      'Indicative range: ' + priceText,
      'Indicative duration: ' + durationText,
      '',
      'Context / workflow to automate:'
    ].join('\n');
  }

  function updateEstimate() {
    var state = getState();
    var base = activityConfig[state.activityType] || activityConfig.prototype;
    var timeframe = timeframeConfig[state.timeframe] || timeframeConfig.standard;
    var low = base.low;
    var high = base.high;
    var effortWeeks = base.weeks;
    var stackNames = [];

    low += (state.complexity - 1) * 450;
    high += (state.complexity - 1) * 700;
    low += state.integrations * 325;
    high += state.integrations * 575;
    effortWeeks += (state.complexity - 1) * 0.32;
    effortWeeks += state.integrations * 0.24;

    if (state.handover) {
      low += 450;
      high += 700;
      effortWeeks += 0.2;
    }

    if (state.compliance) {
      low += 700;
      high += 1150;
      effortWeeks += 0.35;
    }

    state.stack.forEach(function (stackKey) {
      var adjustment = stackAdjustments[stackKey];
      if (!adjustment) return;
      low += adjustment.low;
      high += adjustment.high;
      effortWeeks += adjustment.weeks;
      stackNames.push(labels.stack[stackKey]);
    });

    low = roundToHundreds(low * timeframe.multiplier);
    high = roundToHundreds(high * timeframe.multiplier);
    if (high <= low) high = low + 600;

    effortWeeks = clamp(effortWeeks * timeframe.durationFactor, 1, 4.4);

    var priceText = formatRange(low, high);
    var durationText = formatDuration(effortWeeks);
    var summaryText = getSummary(state, durationText);
    var modelText = getModelLabel(state, effortWeeks);
    var contactParams = new URLSearchParams();

    priceEl.textContent = priceText;
    summaryEl.textContent = summaryText;
    durationEl.textContent = durationText;
    modelEl.textContent = modelText;

    contactParams.set('service', 'Rapid AI Prototyping & Automation');
    contactParams.set('prefill', buildPrefillMessage(state, priceText, durationText, stackNames));
    ctaEl.href = 'contact.html?' + contactParams.toString() + '#message-panel';
  }

  Array.prototype.slice.call(form.querySelectorAll('.estimator-input')).forEach(function (input) {
    input.addEventListener('input', updateEstimate);
    input.addEventListener('change', updateEstimate);
  });

  updateEstimate();
})();
