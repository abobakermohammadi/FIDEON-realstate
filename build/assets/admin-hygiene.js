(() => {
  const PROP_KEY = 'fideon.properties.v2';
  const PLACEHOLDER = '/assets/property-placeholder.svg';
  const RETIRED_PLACEHOLDERS = new Set(['/assets/property-palm.svg']);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  let saveTimer = null;

  function readProperties() {
    try {
      const value = JSON.parse(localStorage.getItem(PROP_KEY));
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function writeProperties(items) {
    try {
      localStorage.setItem(PROP_KEY, JSON.stringify(items));
      return true;
    } catch {
      return false;
    }
  }

  function cleanMediaValue(value) {
    const text = String(value || '').trim();
    return RETIRED_PLACEHOLDERS.has(text) ? PLACEHOLDER : text;
  }

  function migrateStoredMedia() {
    const properties = readProperties();
    let changed = false;
    const next = properties.map(property => {
      const image = cleanMediaValue(property.image);
      const hero = cleanMediaValue(property.hero);
      const media = Array.isArray(property.media) ? property.media.map(cleanMediaValue).filter(Boolean) : [];
      if (image !== String(property.image || '').trim() || hero !== String(property.hero || '').trim() || JSON.stringify(media) !== JSON.stringify(property.media || [])) changed = true;
      return {...property, image:image || (media[0] || PLACEHOLDER), hero:hero || (media[0] || PLACEHOLDER), media};
    });
    if (changed) writeProperties(next);
    return next;
  }

  function normalizeRoomPlan(value) {
    return String(value || '').trim().replace(/\s+/g, '').replace(/\++/g, '+').slice(0, 18);
  }

  function roomPlanToBeds(value) {
    const match = normalizeRoomPlan(value).match(/^(\d+)/);
    return match ? match[1] : '';
  }

  function editorForm() {
    return $('#property-editor form');
  }

  function syncRoomPlanIntoLegacyField() {
    const form = editorForm();
    if (!form) return;
    const manual = form.elements.roomPlanManual;
    const beds = form.elements.beds;
    if (!manual || !beds) return;
    manual.value = normalizeRoomPlan(manual.value);
    beds.value = roomPlanToBeds(manual.value);
  }

  function patchSavedRoomPlan() {
    const form = editorForm();
    const id = form?.elements.id?.value || form?.dataset.editing;
    const manual = normalizeRoomPlan(form?.elements.roomPlanManual?.value);
    if (!id) return;
    const properties = migrateStoredMedia();
    const beds = roomPlanToBeds(manual);
    let changed = false;
    const next = properties.map(property => {
      if (String(property.id) !== String(id)) return property;
      const nextBeds = beds === '' ? null : Number(beds);
      if (String(property.roomPlan || '') === manual && property.beds === nextBeds) return property;
      changed = true;
      return {...property, roomPlan:manual, beds:nextBeds};
    });
    if (changed) writeProperties(next);
  }

  function hydrateRoomPlan(id) {
    const form = editorForm();
    if (!form || !form.elements.roomPlanManual) return;
    const property = readProperties().find(item => String(item.id) === String(id));
    form.elements.roomPlanManual.value = property?.roomPlan || (property?.beds != null ? `${property.beds}+1` : '');
  }

  function guardImage(img) {
    if (!(img instanceof HTMLImageElement) || img.dataset.adminMediaGuard === '1') return;
    img.dataset.adminMediaGuard = '1';
    const raw = img.getAttribute('src') || '';
    if (RETIRED_PLACEHOLDERS.has(raw)) img.src = PLACEHOLDER;
    img.addEventListener('error', () => {
      if (!img.src.endsWith('/property-placeholder.svg')) img.src = PLACEHOLDER;
    });
  }

  function guardImages(scope = document) {
    if (scope instanceof HTMLImageElement) guardImage(scope);
    $$('img', scope).forEach(guardImage);
  }

  function mediaCount() {
    const count = $$('[data-media-previews] .media-preview').length;
    let chip = $('[data-admin-media-count]');
    if (!chip) {
      const box = $('[data-media-previews]');
      if (!box) return;
      chip = document.createElement('div');
      chip.dataset.adminMediaCount = '';
      chip.className = 'admin-media-count';
      box.before(chip);
    }
    const label = count ? `${count} / 16 fotoğraf` : 'Fotoğraf eklenmedi';
    if (chip.textContent !== label) chip.textContent = label;
    chip.classList.toggle('has-media', count > 0);
  }

  function ensurePreviewLink() {
    const form = editorForm();
    const actions = form?.querySelector('.full[style*="justify-content:space-between"]');
    if (!form || !actions) return;
    let link = $('[data-admin-preview-property]', actions);
    if (!link) {
      link = document.createElement('a');
      link.dataset.adminPreviewProperty = '';
      link.className = 'btn btn-outline admin-preview-property';
      link.target = '_blank';
      link.rel = 'noreferrer';
      link.textContent = 'Sitede aç ↗';
      actions.insertBefore(link, actions.firstChild?.nextSibling || null);
    }
    const id = form.elements.id?.value || form.dataset.editing;
    const property = readProperties().find(item => String(item.id) === String(id));
    const publicEnough = property && !['private','hidden'].includes(String(property.visibility || '').toLowerCase()) && !['taslak','draft','arşiv','arsiv','archived'].includes(String(property.status || '').toLowerCase());
    link.hidden = !publicEnough;
    if (publicEnough) link.href = `/properties/view/?slug=${encodeURIComponent(property.slug || property.id)}`;
  }

  function polishAdminLanguage() {
    const active = $('.admin-nav button.active')?.dataset.adminNav || $('.admin-mobile-bar button.active')?.dataset.adminNav;
    const title = $('#admin-title');
    if (title && active === 'properties' && title.textContent === 'İlanlar') title.textContent = 'Portföy';

    const portfolioEmpty = $('[data-admin-properties] tr td[colspan="6"]');
    if (portfolioEmpty && /Henüz ilan yok/i.test(portfolioEmpty.textContent)) portfolioEmpty.textContent = 'Portföy henüz boş. “Portföye ekle” ile başlayın.';
    const dashboardEmpty = $('[data-dashboard-properties] tr td[colspan="4"]');
    if (dashboardEmpty && /Henüz ilan yok/i.test(dashboardEmpty.textContent)) dashboardEmpty.textContent = 'Portföy henüz boş.';
  }

  function celebrateSave() {
    const button = $('[data-save-property]');
    if (!button) return;
    clearTimeout(saveTimer);
    const original = button.dataset.originalLabel || button.textContent;
    button.dataset.originalLabel = original;
    button.textContent = 'Kaydedildi ✓';
    button.classList.add('is-saved');
    saveTimer = setTimeout(() => {
      button.textContent = original;
      button.classList.remove('is-saved');
    }, 1150);
  }

  function afterAdminMutation() {
    guardImages();
    mediaCount();
    ensurePreviewLink();
    polishAdminLanguage();
  }

  function boot() {
    migrateStoredMedia();
    guardImages();
    mediaCount();
    ensurePreviewLink();
    polishAdminLanguage();

    document.addEventListener('click', event => {
      const save = event.target.closest('[data-save-property]');
      if (save) {
        syncRoomPlanIntoLegacyField();
        setTimeout(() => {
          patchSavedRoomPlan();
          migrateStoredMedia();
          ensurePreviewLink();
          celebrateSave();
          polishAdminLanguage();
        }, 0);
      }
      const edit = event.target.closest('[data-edit-prop]');
      if (edit) setTimeout(() => hydrateRoomPlan(edit.dataset.editProp), 0);
      if (event.target.closest('[data-add-property],[data-clear-property]')) setTimeout(() => {
        const form = editorForm();
        if (form?.elements.roomPlanManual) form.elements.roomPlanManual.value = '';
        ensurePreviewLink();
      }, 0);
      if (event.target.closest('[data-admin-nav]')) setTimeout(polishAdminLanguage, 0);
    }, true);

    const form = editorForm();
    form?.elements.roomPlanManual?.addEventListener('input', syncRoomPlanIntoLegacyField, {passive:true});

    const observer = new MutationObserver(afterAdminMutation);
    observer.observe(document.body, {childList:true, subtree:true});
  }

  // This runs while the parser is still finishing, before admin.js handles DOMContentLoaded.
  // It prevents a retired missing image path from ever reaching the first admin render.
  migrateStoredMedia();

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
  else boot();
})();
