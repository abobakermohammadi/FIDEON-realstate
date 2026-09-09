(() => {
  // MAMELAT uses only essential browser storage. Keep the consent state for
  // continuity, but do not interrupt visitors with a visual cookie banner.
  const key = "mamelat.cookie-consent.v1";
  try {
    if (!localStorage.getItem(key)) localStorage.setItem(key, "necessary");
  } catch {
    // Private browsing or disabled storage must not affect the public site.
  }
})();
