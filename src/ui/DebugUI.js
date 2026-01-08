export default class DebugUI {
    constructor(scene) {
        this.scene = scene;
        this.visible = false;
        this._createDOM();
        this._bindKeys();
    }

    _createDOM() {
        const container = document.createElement('div');
        container.id = 'debug-ui';
        container.style.position = 'fixed';
        container.style.right = '12px';
        container.style.bottom = '12px';
        container.style.padding = '10px';
        container.style.background = 'rgba(0,0,0,0.7)';
        container.style.color = '#fff';
        container.style.fontFamily = 'Arial, sans-serif';
        container.style.fontSize = '12px';
        container.style.borderRadius = '6px';
        container.style.zIndex = 999999;
        container.style.display = 'none';
        container.style.minWidth = '220px';

        container.innerHTML = `
            <div style="font-weight:bold;margin-bottom:6px">Debug UI (F1)</div>
            <label>Smoothing Speed: <span id="dbg-smooth-val">8</span></label>
            <input id="dbg-smooth" type="range" min="1" max="20" step="0.5" value="8" style="width:100%" />
            <label>Position Smooth: <span id="dbg-pos-val">20</span></label>
            <input id="dbg-pos" type="range" min="1" max="60" step="1" value="20" style="width:100%" />
            <label>Global Move Control: <span id="dbg-move-val">0.6</span></label>
            <input id="dbg-move" type="range" min="0" max="1" step="0.05" value="0.6" style="width:100%" />
            <label><input id="dbg-apply-lock" type="checkbox" /> Force Lock Movement</label>
            <div style="margin-top:8px;text-align:right">
                <button id="dbg-apply">Apply to Both Fighters</button>
            </div>
            <div style="margin-top:8px;font-size:11px;color:#aaa">Tip: Changes apply live and are not persisted (refresh to reset)</div>
        `;

        document.body.appendChild(container);
        this.container = container;

        // Elements
        this.elSmooth = container.querySelector('#dbg-smooth');
        this.elSmoothVal = container.querySelector('#dbg-smooth-val');
        this.elPos = container.querySelector('#dbg-pos');
        this.elPosVal = container.querySelector('#dbg-pos-val');
        this.elMove = container.querySelector('#dbg-move');
        this.elMoveVal = container.querySelector('#dbg-move-val');
        this.elLock = container.querySelector('#dbg-apply-lock');
        this.elApply = container.querySelector('#dbg-apply');

        this.elSmooth.addEventListener('input', () => this._onSmoothChange());
        this.elPos.addEventListener('input', () => this._onPosChange());
        this.elMove.addEventListener('input', () => this._onMoveChange());
        this.elApply.addEventListener('click', () => this.applyToFighters());
    }

    _bindKeys() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'F1') {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    toggle(show) {
        this.visible = typeof show === 'boolean' ? show : !this.visible;
        this.container.style.display = this.visible ? 'block' : 'none';
    }

    _onSmoothChange() {
        const v = parseFloat(this.elSmooth.value);
        this.elSmoothVal.textContent = v;
        // Apply to existing fighters' renderers
        [this.scene.p1, this.scene.p2].forEach(f => {
            if (f && f.renderer) f.renderer.smoothingSpeed = v;
        });
    }

    _onPosChange() {
        const v = parseFloat(this.elPos.value);
        this.elPosVal.textContent = v;
        [this.scene.p1, this.scene.p2].forEach(f => {
            if (f && f.renderer) f.renderer.positionSmoothingSpeed = v;
        });
    }

    _onMoveChange() {
        const v = parseFloat(this.elMove.value);
        this.elMoveVal.textContent = v.toFixed(2);
    }

    applyToFighters() {
        const v = parseFloat(this.elMove.value);
        const lock = !!this.elLock.checked;
        [this.scene.p1, this.scene.p2].forEach(f => {
            if (!f || !f.data || !f.data.moves) return;
            for (const m of Object.values(f.data.moves)) {
                m.moveControlFactor = v;
                if (lock) m.lockMovement = true;
            }
        });
        console.debug('DebugUI applied moveControlFactor', v, 'lock=', lock);
    }
}