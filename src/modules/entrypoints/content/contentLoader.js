(async () => {
  const src = browser.runtime.getURL("src/entrypoints/content/content.js");
  await import(src);
})();
