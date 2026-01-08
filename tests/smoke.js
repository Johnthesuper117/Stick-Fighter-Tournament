// Minimal smoke tests to ensure core modules import and basic APIs exist
// Run with: node --input-type=module tests/smoke.js

// Small helper for reporting
function pass(msg){ console.log('PASS:', msg); }
function fail(msg){ console.error('FAIL:', msg); process.exitCode = 1; }

(async () => {
  try {
    // Minimal Phaser stub to allow modules that reference Phaser to load
    globalThis.Phaser = {
      Scene: class {},
      Game: class { constructor(cfg){ this.config = cfg } },
      Input: { Keyboard: { KeyCodes: {} } },
      Physics: { Arcade: { Sprite: class {} } },
      GameObjects: { Container: class {} }
    };

    const modulesToTest = [
      'src/main.js',
      'src/scene/MenuScene.js',
      'src/scene/SelectScene.js',
      'src/scene/FightScene.js',
      'src/entities/Fighter.js',
      'src/entities/Projectile.js',
      'src/entities/StickRenderer.js',
      'src/managers/InputManager.js',
      'src/managers/InputBuffer.js',
      'src/managers/ComboManager.js'
    ];

    for (const m of modulesToTest) {
      try {
        await import('../' + m);
        pass('Imported ' + m);
      } catch (e) {
        fail('Failed to import ' + m + ' - ' + e.message);
      }
    }

    // Basic API checks
    const { default: Fighter } = await import('../src/entities/Fighter.js');
    if (typeof Fighter !== 'function') fail('Fighter is not a constructor');
    pass('Fighter constructor exists');

    const { default: Projectile } = await import('../src/entities/Projectile.js');
    if (typeof Projectile !== 'function') fail('Projectile is not a constructor');
    pass('Projectile constructor exists');

    const { default: InputBuffer } = await import('../src/managers/InputBuffer.js');
    const buf = new InputBuffer();
    if (typeof buf.recordInput !== 'function' || typeof buf.checkCommand !== 'function') fail('InputBuffer methods missing');
    pass('InputBuffer basic API ok');

    console.log('\nSmoke tests complete. If any FAIL messages above exist, investigate those modules.');
    if (process.exitCode && process.exitCode !== 0) process.exit(process.exitCode);
  } catch (err) {
    console.error('Smoke tests failed unexpectedly:', err);
    process.exit(1);
  }
})();