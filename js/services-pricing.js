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
  var complexityLabelEl = estimatorRoot.querySelector('[data-estimator-complexity-label]');
  var integrationsLabelEl = estimatorRoot.querySelector('[data-estimator-integrations-label]');
  var assumptionsSummaryEl = estimatorRoot.querySelector('[data-estimator-assumptions-summary]');
  var breakdownEl = estimatorRoot.querySelector('[data-estimator-breakdown]');
  var breakdownSummaryEl = estimatorRoot.querySelector('[data-estimator-breakdown-summary]');
  var multiplierEl = estimatorRoot.querySelector('[data-estimator-multiplier]');
  var subtotalEl = estimatorRoot.querySelector('[data-estimator-subtotal]');
  var totalEl = estimatorRoot.querySelector('[data-estimator-total]');
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

  var breakdownLabels = {
    base: isItalian ? 'Base sprint' : 'Base sprint',
    complexity: isItalian ? 'Complessita delivery' : 'Delivery complexity',
    integrations: isItalian ? 'Sistemi / handoff' : 'Systems / handoffs',
    stack: isItalian ? 'Adeguamento stack' : 'Build stack adjustment',
    handover: isItalian ? 'Onboarding e handover' : 'Team onboarding and handover',
    compliance: isItalian ? 'Riservatezza / compliance' : 'Confidentiality / compliance'
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

  function formatSignedMoney(value) {
    var absolute = formatMoney(Math.abs(value));
    if (value < 0) return '\u2212' + absolute;
    if (value > 0) return '+' + absolute;
    return absolute;
  }

  function formatSignedRange(low, high) {
    return formatSignedMoney(low) + ' \u2013 ' + formatSignedMoney(high);
  }

  function formatMultiplier(value) {
    return 'x' + value.toFixed(2);
  }

  function getToolCountLabel(count) {
    if (isItalian) {
      return count + ' ' + (count === 1 ? 'strumento' : 'strumenti');
    }

    return count + ' ' + (count === 1 ? 'tool' : 'tools');
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

  function getComplexityLabel(level) {
    if (isItalian) {
      if (level <= 1) return 'Livello 1 \u00b7 Task mirato';
      if (level === 2) return 'Livello 2 \u00b7 Workflow di team';
      if (level === 3) return 'Livello 3 \u00b7 Workflow cross-team';
      if (level === 4) return 'Livello 4 \u00b7 Delivery multi-stakeholder';
      return 'Livello 5 \u00b7 Rollout governato';
    }

    if (level <= 1) return 'Level 1 \u00b7 Tightly scoped task';
    if (level === 2) return 'Level 2 \u00b7 One-team workflow';
    if (level === 3) return 'Level 3 \u00b7 Cross-team workflow';
    if (level === 4) return 'Level 4 \u00b7 Multi-stakeholder delivery';
    return 'Level 5 \u00b7 Governed rollout';
  }

  function getIntegrationLabel(count) {
    if (isItalian) {
      if (count <= 0) return 'Livello 0 \u00b7 Pilot standalone';
      if (count === 1) return 'Livello 1 \u00b7 Un sistema collegato';
      if (count === 2) return 'Livello 2 \u00b7 Due handoff tra sistemi';
      if (count === 3) return 'Livello 3 \u00b7 Catena CDE o reporting';
      return 'Livello 4 \u00b7 Thread multi-sistema';
    }

    if (count <= 0) return 'Level 0 \u00b7 Standalone pilot';
    if (count === 1) return 'Level 1 \u00b7 One connected system';
    if (count === 2) return 'Level 2 \u00b7 Two system handoffs';
    if (count === 3) return 'Level 3 \u00b7 CDE or reporting chain';
    return 'Level 4 \u00b7 Multi-system thread';
  }

  function setBreakdownItems(items) {
    if (!breakdownEl) return;

    while (breakdownEl.firstChild) {
      breakdownEl.removeChild(breakdownEl.firstChild);
    }

    items.forEach(function (item) {
      var row = document.createElement('div');
      var copy = document.createElement('div');
      var title = document.createElement('strong');
      var amount = document.createElement('div');

      row.className = 'ai-breakdown-item' + (item.isNegative ? ' ai-breakdown-item--negative' : '');
      copy.className = 'ai-breakdown-copy';
      amount.className = 'ai-breakdown-amount';

      title.textContent = item.label;
      amount.textContent = item.amount;

      copy.appendChild(title);

      if (item.note) {
        var note = document.createElement('span');
        note.textContent = item.note;
        copy.appendChild(note);
      }

      row.appendChild(copy);
      row.appendChild(amount);
      breakdownEl.appendChild(row);
    });
  }

  function getAssumptionsSummary(state) {
    return [
      getToolCountLabel(state.stack.length),
      state.handover ? (isItalian ? 'handover si' : 'handover on') : (isItalian ? 'handover no' : 'handover off'),
      state.compliance ? (isItalian ? 'dati riservati' : 'regulated data') : (isItalian ? 'dati standard' : 'standard data')
    ].join(' \u00b7 ');
  }

  function getBreakdownSummary(itemCount, multiplierText) {
    if (isItalian) {
      return itemCount + ' driver \u00b7 fattore ' + multiplierText;
    }

    return itemCount + ' ' + (itemCount === 1 ? 'driver' : 'drivers') + ' \u00b7 factor ' + multiplierText;
  }

  function getSummary(state, durationText) {
    var activity = labels.activityType[state.activityType];
    var complexity = getComplexityDescriptor(state.complexity);
    var integrations = getIntegrationDescriptor(state.integrations);
    var summary = '';

    if (isItalian) {
      summary = 'Sprint su ' + lowerFirst(activity) + ' con ' + complexity + ' e ' + integrations + '.';
      summary += ' Finestra tipica: ' + durationText;
      if (state.handover) {
        summary += ', handover incluso';
      }
      if (state.compliance) {
        summary += ', dati regolati';
      }
      return summary + '.';
    }

    summary = activity + ' sprint with ' + complexity + ' and ' + integrations + '.';
    summary += ' Typical window: ' + durationText;
    if (state.handover) {
      summary += ', handover included';
    }
    if (state.compliance) {
      summary += ', regulated data';
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
        'Complessit\u00e0: ' + state.complexity + '/5 (' + getComplexityLabel(state.complexity) + ')',
        'Integrazioni: ' + state.integrations + ' (' + getIntegrationLabel(state.integrations) + ')',
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
      'Complexity: ' + state.complexity + '/5 (' + getComplexityLabel(state.complexity) + ')',
      'Integrations: ' + state.integrations + ' (' + getIntegrationLabel(state.integrations) + ')',
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
    var baseLow = base.low;
    var baseHigh = base.high;
    var complexityLow = (state.complexity - 1) * 450;
    var complexityHigh = (state.complexity - 1) * 700;
    var integrationsLow = state.integrations * 325;
    var integrationsHigh = state.integrations * 575;
    var handoverLow = state.handover ? 450 : 0;
    var handoverHigh = state.handover ? 700 : 0;
    var complianceLow = state.compliance ? 700 : 0;
    var complianceHigh = state.compliance ? 1150 : 0;
    var stackLow = 0;
    var stackHigh = 0;
    var effortWeeks = base.weeks;
    var stackNames = [];
    var breakdownItems = [];
    var subtotalLow;
    var subtotalHigh;
    var low;
    var high;
    var subtotalText;

    effortWeeks += (state.complexity - 1) * 0.32;
    effortWeeks += state.integrations * 0.24;

    if (state.handover) {
      effortWeeks += 0.2;
    }

    if (state.compliance) {
      effortWeeks += 0.35;
    }

    state.stack.forEach(function (stackKey) {
      var adjustment = stackAdjustments[stackKey];
      if (!adjustment) return;
      stackLow += adjustment.low;
      stackHigh += adjustment.high;
      effortWeeks += adjustment.weeks;
      stackNames.push(labels.stack[stackKey]);
    });

    subtotalLow = baseLow + complexityLow + integrationsLow + handoverLow + complianceLow + stackLow;
    subtotalHigh = baseHigh + complexityHigh + integrationsHigh + handoverHigh + complianceHigh + stackHigh;

    low = roundToHundreds(subtotalLow * timeframe.multiplier);
    high = roundToHundreds(subtotalHigh * timeframe.multiplier);

    if (high <= low) high = low + 600;

    effortWeeks = clamp(effortWeeks * timeframe.durationFactor, 1, 4.4);

    var priceText = formatRange(low, high);
    var durationText = formatDuration(effortWeeks);
    var summaryText = getSummary(state, durationText);
    var modelText = getModelLabel(state, effortWeeks);
    var contactParams = new URLSearchParams();
    var multiplierText = formatMultiplier(timeframe.multiplier);

    breakdownItems.push({
      label: breakdownLabels.base,
      note: labels.activityType[state.activityType],
      amount: formatRange(baseLow, baseHigh)
    });

    if (complexityLow || complexityHigh) {
      breakdownItems.push({
        label: breakdownLabels.complexity,
        note: getComplexityLabel(state.complexity),
        amount: formatSignedRange(complexityLow, complexityHigh)
      });
    }

    if (integrationsLow || integrationsHigh) {
      breakdownItems.push({
        label: breakdownLabels.integrations,
        note: getIntegrationLabel(state.integrations),
        amount: formatSignedRange(integrationsLow, integrationsHigh)
      });
    }

    if (stackLow || stackHigh) {
      breakdownItems.push({
        label: breakdownLabels.stack,
        note: stackNames.length ? stackNames.join(', ') : labels.fallbackStack,
        amount: formatSignedRange(stackLow, stackHigh),
        isNegative: stackLow < 0 || stackHigh < 0
      });
    }

    if (handoverLow || handoverHigh) {
      breakdownItems.push({
        label: breakdownLabels.handover,
        note: isItalian ? 'Trasferimento operativo al team incluso' : 'Operational handover into the team',
        amount: formatSignedRange(handoverLow, handoverHigh)
      });
    }

    if (complianceLow || complianceHigh) {
      breakdownItems.push({
        label: breakdownLabels.compliance,
        note: isItalian ? 'Passaggio aggiuntivo per dati riservati o regolati' : 'Extra pass for confidential or regulated delivery data',
        amount: formatSignedRange(complianceLow, complianceHigh)
      });
    }

    subtotalText = formatRange(subtotalLow, subtotalHigh);

    priceEl.textContent = priceText;
    summaryEl.textContent = summaryText;
    durationEl.textContent = durationText;
    modelEl.textContent = modelText;
    if (complexityLabelEl) complexityLabelEl.textContent = getComplexityLabel(state.complexity);
    if (integrationsLabelEl) integrationsLabelEl.textContent = getIntegrationLabel(state.integrations);
    if (assumptionsSummaryEl) assumptionsSummaryEl.textContent = getAssumptionsSummary(state);
    if (breakdownSummaryEl) breakdownSummaryEl.textContent = getBreakdownSummary(breakdownItems.length, multiplierText);
    if (multiplierEl) multiplierEl.textContent = multiplierText;
    if (subtotalEl) subtotalEl.textContent = subtotalText;
    if (totalEl) totalEl.textContent = priceText;
    setBreakdownItems(breakdownItems);

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
