(async () => {
  try {
    await import('./smoke.js');
    await import('./move_config.js');
    console.log('PASS: All tests passed');
  } catch (e) {
    console.error('FAIL: Tests failed', e);
    process.exit(1);
  }
})();