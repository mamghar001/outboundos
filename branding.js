/* ============================================================
   OutboundOS — dynamic per-domain branding
   ============================================================
   - Reads window.location.hostname
   - Looks up an override in BRAND_MAP (domain -> { name, tagline, ctaLabel })
   - Falls back to a smart-derive of the domain's first label
   - Replaces all .js-brand text + .js-year year + document.title
   ============================================================ */
(function () {
  'use strict';

  // Manual override map — extend freely.
  // key: hostname (no protocol, no www.). value: { name, tagline?, ctaLabel? }
  var BRAND_MAP = {
    'moescale.site':           { name: 'MoeScale',          tagline: 'Outbound that scales' },
    'moescale.store':          { name: 'MoeScale',          tagline: 'Outbound that scales' },
    'moescale.xyz':            { name: 'MoeScale',          tagline: 'Outbound that scales' },
    'moescale.space':          { name: 'MoeScale',          tagline: 'Outbound that scales' },
    'moescalesystem.shop':     { name: 'MoeScale System',   tagline: 'Outbound that scales' },
    'moescalesystem.online':   { name: 'MoeScale System',   tagline: 'Outbound that scales' },
    'moescalesystem.pro':      { name: 'MoeScale System',   tagline: 'Outbound that scales' },
    'moescalesystem.site':     { name: 'MoeScale System',   tagline: 'Outbound that scales' },
    'moescalesystem.xyz':      { name: 'MoeScale System',   tagline: 'Outbound that scales' },
    'aioutbound.shop':         { name: 'AI Outbound',       tagline: 'AI agents that book meetings' },
    'aioutboundb2b.shop':      { name: 'AI Outbound B2B',   tagline: 'AI agents that book meetings' },
    'aioutreach.shop':         { name: 'AI Outreach',       tagline: 'AI agents that book meetings' },
    'aioutboundagents.shop':   { name: 'AI Outbound Agents',tagline: 'AI agents that book meetings' },
    'aiemail.shop':            { name: 'AI Email',          tagline: 'AI that writes & sends' },
    'aiemailagents.shop':      { name: 'AI Email Agents',   tagline: 'AI that writes & sends' },
    'b2baioutbound.shop':      { name: 'B2B AI Outbound',   tagline: 'B2B pipeline on autopilot' },
    'b2bgrowth.shop':          { name: 'B2B Growth',        tagline: 'B2B pipeline on autopilot' },
    'b2bgrowth.store':         { name: 'B2B Growth',        tagline: 'B2B pipeline on autopilot' },
    'b2baigrowth.site':        { name: 'B2B AI Growth',     tagline: 'B2B pipeline on autopilot' },
    'b2baigrowth.online':      { name: 'B2B AI Growth',     tagline: 'B2B pipeline on autopilot' },
    'outboundb2b.shop':        { name: 'Outbound B2B',      tagline: 'B2B pipeline on autopilot' },
    'affiliategrowth.shop':    { name: 'Affiliate Growth',  tagline: 'Affiliate revenue on tap' },
    'affiliatehighticket.shop':{ name: 'Affiliate High Ticket', tagline: 'Affiliate revenue on tap' },
    'affiliatehighticketsales.shop': { name: 'Affiliate High Ticket Sales', tagline: 'Affiliate revenue on tap' },
    'afiliatemarketing.shop':  { name: 'Affiliate Marketing',  tagline: 'Affiliate revenue on tap' },
    'affilliatemarketing.shop':{ name: 'Affiliate Marketing',  tagline: 'Affiliate revenue on tap' },
    'salesassociate.shop':     { name: 'Sales Associate',   tagline: 'Your 24/7 sales hire' },
    'salespartner.shop':       { name: 'Sales Partner',     tagline: 'Your 24/7 sales hire' },
    'salesreferral.shop':      { name: 'Sales Referral',    tagline: 'Your 24/7 sales hire' },
    'sponsorsales.shop':       { name: 'Sponsor Sales',     tagline: 'Your 24/7 sales hire' },
    'unlawyered.io':           { name: 'Unlawyered',        tagline: 'Legal docs without the lawyer bill' }
  };

  // ---- helpers ----
  function stripWww(host) { return host.replace(/^www\./, ''); }

  function titleCase(s) {
    return s.replace(/[-_]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function deriveFromHost(host) {
    var label = host.split('.')[0];                 // e.g. "aioutbound" from "aioutbound.shop"
    var tld = host.split('.').slice(-1)[0];         // e.g. "shop"
    var name = titleCase(label);
    // If host has >2 labels and the middle is a known word, include it
    // e.g. "ai.outbound.shop" -> "AI Outbound"
    var parts = host.split('.');
    if (parts.length > 2 && parts[0] !== 'www') {
      name = parts.slice(0, -1).map(titleCase).join(' ');
    }
    var tagline;
    if (/outbound|outreach|email|b2b/i.test(label)) {
      tagline = 'B2B pipeline on autopilot';
    } else if (/affiliate|growth/i.test(label)) {
      tagline = 'Affiliate revenue on tap';
    } else if (/sale|partner|sponsor|associate/i.test(label)) {
      tagline = 'Your 24/7 sales hire';
    } else if (/law/i.test(label)) {
      tagline = 'Legal docs without the lawyer bill';
    } else if (/ai|agent/i.test(label)) {
      tagline = 'AI agents that book meetings';
    } else if (/scale/i.test(label)) {
      tagline = 'Outbound that scales';
    } else {
      tagline = 'Outbound that scales';
    }
    return { name: name, tagline: tagline };
  }

  function getBrand() {
    var host = stripWww(location.hostname.toLowerCase());
    if (BRAND_MAP[host]) return BRAND_MAP[host];
    return deriveFromHost(host);
  }

  function applyBrand() {
    var brand = getBrand();

    // Replace all <span class="js-brand"> ... </span>
    var brandEls = document.querySelectorAll('.js-brand');
    brandEls.forEach(function (el) { el.textContent = brand.name; });

    // Replace all <span class="js-tagline"> ... </span> if any
    var tagEls = document.querySelectorAll('.js-tagline');
    tagEls.forEach(function (el) { el.textContent = brand.tagline || ''; });

    // Replace all <span class="js-year"> with current year
    var yearEls = document.querySelectorAll('.js-year');
    var year = String(new Date().getFullYear());
    yearEls.forEach(function (el) { el.textContent = year; });

    // Update page title if it contains a {{brand}} or {{year}} token, else just prefix brand
    if (document.title) {
      document.title = document.title
        .replace(/\{\{brand\}\}/gi, brand.name)
        .replace(/\{\{year\}\}/gi, year);
    }
    if (document.querySelector('meta[name="description"]')) {
      var desc = document.querySelector('meta[name="description"]').getAttribute('content');
      document.querySelector('meta[name="description"]').setAttribute('content',
        desc.replace(/\{\{brand\}\}/gi, brand.name).replace(/\{\{year\}\}/gi, year));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyBrand);
  } else {
    applyBrand();
  }
})();
