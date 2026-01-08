import fs from 'fs';
import path from 'path';

const files = ['src/data/alpha.json', 'src/data/beta.json'];
let ok = true;

for (const f of files) {
    const raw = fs.readFileSync(path.resolve(f), 'utf8');
    const data = JSON.parse(raw);
    if (!data.moves) {
        console.error(`FAIL: ${f} missing moves`);
        ok = false;
        continue;
    }

    for (const [key, move] of Object.entries(data.moves)) {
        // moveControlFactor must be number between 0 and 1
        if (typeof move.moveControlFactor !== 'number') {
            console.error(`FAIL: ${f} ${key} missing moveControlFactor`);
            ok = false;
        } else if (move.moveControlFactor < 0 || move.moveControlFactor > 1) {
            console.error(`FAIL: ${f} ${key} moveControlFactor out of range: ${move.moveControlFactor}`);
            ok = false;
        }
        if (typeof move.lockMovement !== 'undefined' && typeof move.lockMovement !== 'boolean') {
            console.error(`FAIL: ${f} ${key} lockMovement must be boolean`);
            ok = false;
        }
        if (typeof move.startup !== 'number' || typeof move.active !== 'number' || typeof move.recovery !== 'number') {
            console.error(`FAIL: ${f} ${key} missing startup/active/recovery numbers`);
            ok = false;
        }
    }
}

if (ok) {
    console.log('PASS: move_config checks');
} else {
    console.error('One or more move_config checks failed');
    process.exit(1);
}