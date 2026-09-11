function Ch9329(writer, mouseAbsolute, reader) {
    this._writeChain = Promise.resolve();
    this._rxBuffer = new Uint8Array(0);
    this.keyboardMapping = {
        8: 0x2A,  // Back
        9: 0x2B,  // Tab
        13: 0x28,  // Enter
        19: 0x48,  //Pause
        20: 0x39,  //Caps Lock
        27: 0x29,  //Escape
        32: 0x2C,  // Space
        33: 0x4B,  // PageUp
        34: 0x4E,  // Next
        35: 0x4D,  // End
        36: 0x4A,  // Home
        37: 0x50,  // Left
        38: 0x52,  // Up
        39: 0x4F,  // Right
        40: 0x51,  // Down
        44: 0x46,  // PrintScreen
        45: 0x49,  // Insert
        46: 0x4C,  // Delete
        48: 0x27,  // 0
        49: 0x1E,  // 1
        50: 0x1F,  // 2
        51: 0x20,  // 3
        52: 0x21,  // 4
        53: 0x22,  // 5
        54: 0x23,  // 6
        55: 0x24,  // 7
        56: 0x25,  // 8
        57: 0x26,  // 9
        65: 0x04,  // A
        66: 0x05,  // B
        67: 0x06,  // C
        68: 0x07,  // D
        69: 0x08,  // E
        70: 0x09,  // F
        71: 0x0A,  // G
        72: 0x0B,  // H
        73: 0x0C,  // I
        74: 0x0D,  // J
        75: 0x0E,  // K
        76: 0x0F,  // L
        77: 0x10,  // M
        78: 0x11,  // N
        79: 0x12,  // O
        80: 0x13,  // P
        81: 0x14,  // Q
        82: 0x15,  // R
        83: 0x16,  // S
        84: 0x17,  // T
        85: 0x18,  // U
        86: 0x19,  // V
        87: 0x1A,  // W
        88: 0x1B,  // X
        89: 0x1C,  // Y
        90: 0x1D,  // Z
        91: 0xE3,  // LWin
        93: 0x65,  // Applications
        96: 0x62,  // NumPad 0
        97: 0x59,  // NumPad 1
        98: 0x5A,  // NumPad 2
        99: 0x5B,  // NumPad 3
        100: 0x5C,  // NumPad 4
        101: 0x5D,  // NumPad 5
        102: 0x5E,  // NumPad 6
        103: 0x5F,  // NumPad 7
        104: 0x60,  // NumPad 8
        105: 0x61,  // NumPad 9
        106: 0x55,  // NumPad Multiply
        107: 0x57,  // NumPad Add
        109: 0x56,  // NumPad Subtract
        110: 0x63,  // NumPad Decimal
        111: 0x54,  // NumPad Divide
        112: 0x3A,  // F1
        113: 0x3B,  // F2
        114: 0x3C,  // F3
        115: 0x3D,  // F4
        116: 0x3E,  // F5
        117: 0x3F,  // F6
        118: 0x40,  // F7
        119: 0x41,  // F8
        120: 0x42,  // F9
        121: 0x43,  // F10
        122: 0x44,  // F11
        123: 0x45,  // F12
        144: 0x53,  // NumLock
        16: 0xE1,  // LShiftKey
        161: 0xE5,  // RShiftKey
        17: 0xE0,  // LControlKey
        163: 0xE4,  // RControlKey
        18: 0xE2,  // LAlt
        165: 0xE6,  // Ralt
        186: 0x33,  // ;
        187: 0x2E,  // =
        188: 0x36,  // ,
        189: 0x2D,  // -
        190: 0x37,  // .
        191: 0x38,  // /
        192: 0x35,  // `
        219: 0x2F,  // [
        220: 0x31,  // \
        221: 0x30,  // ]
        222: 0x34,  // '

        "Backspace": 0x2A,  // Back
        "Tab": 0x2B,  // Tab
        "Enter": 0x28,  // Enter
        "Pause": 0x48,  //Pause
        "CapsLock": 0x39,  //Caps Lock
        "Escape": 0x29,  //Escape
        "Space": 0x2C,  // Space
        "PageUp": 0x4B,  // PageUp
        "PageDown": 0x4E,  // Next
        "End": 0x4D,  // End
        "Home": 0x4A,  // Home
        "ArrowLeft": 0x50,  // Left
        "ArrowUp": 0x52,  // Up
        "ArrowRight": 0x4F,  // Right
        "ArrowDown": 0x51,  // Down
        "PrintScreen": 0x46,  // PrintScreen
        "Insert": 0x49,  // Insert
        "Delete": 0x4C,  // Delete
        "Digit0": 0x27,  // 0
        "Digit1": 0x1E,  // 1
        "Digit2": 0x1F,  // 2
        "Digit3": 0x20,  // 3
        "Digit4": 0x21,  // 4
        "Digit5": 0x22,  // 5
        "Digit6": 0x23,  // 6
        "Digit7": 0x24,  // 7
        "Digit8": 0x25,  // 8
        "Digit9": 0x26,  // 9
        "KeyA": 0x04,  // A
        "KeyB": 0x05,  // B
        "KeyC": 0x06,  // C
        "KeyD": 0x07,  // D
        "KeyE": 0x08,  // E
        "KeyF": 0x09,  // F
        "KeyG": 0x0A,  // G
        "KeyH": 0x0B,  // H
        "KeyI": 0x0C,  // I
        "KeyJ": 0x0D,  // J
        "KeyK": 0x0E,  // K
        "KeyL": 0x0F,  // L
        "KeyM": 0x10,  // M
        "KeyN": 0x11,  // N
        "KeyO": 0x12,  // O
        "KeyP": 0x13,  // P
        "KeyQ": 0x14,  // Q
        "KeyR": 0x15,  // R
        "KeyS": 0x16,  // S
        "KeyT": 0x17,  // T
        "KeyU": 0x18,  // U
        "KeyV": 0x19,  // V
        "KeyW": 0x1A,  // W
        "KeyX": 0x1B,  // X
        "KeyY": 0x1C,  // Y
        "KeyZ": 0x1D,  // Z
        "MetaLeft": 0xE3,  // LWin
        // 93: 0x65,  // Applications
        "Numpad0": 0x62,  // NumPad 0
        "Numpad1": 0x59,  // NumPad 1
        "Numpad2": 0x5A,  // NumPad 2
        "Numpad3": 0x5B,  // NumPad 3
        "Numpad4": 0x5C,  // NumPad 4
        "Numpad5": 0x5D,  // NumPad 5
        "Numpad6": 0x5E,  // NumPad 6
        "Numpad7": 0x5F,  // NumPad 7
        "Numpad8": 0x60,  // NumPad 8
        "Numpad9": 0x61,  // NumPad 9
        "NumpadMultiply": 0x55,  // NumPad Multiply
        "NumpadAdd": 0x57,  // NumPad Add
        "NumpadSubtract": 0x56,  // NumPad Subtract
        "NumpadDecimal": 0x63,  // NumPad Decimal
        "NumpadDivide": 0x54,  // NumPad Divide
        "F1": 0x3A,  // F1
        "F2": 0x3B,  // F2
        "F3": 0x3C,  // F3
        "F4": 0x3D,  // F4
        "F5": 0x3E,  // F5
        "F6": 0x3F,  // F6
        "F7": 0x40,  // F7
        "F8": 0x41,  // F8
        "F9": 0x42,  // F9
        "F10": 0x43,  // F10
        "F11": 0x44,  // F11
        "F12": 0x45,  // F12
        "NumLock": 0x53,  // NumLock
        "ShiftLeft": 0xE1,  // LShiftKey
        "ShiftRight": 0xE5,  // RShiftKey
        "ControlLeft": 0xE0,  // LControlKey
        "ControlRight": 0xE4,  // RControlKey
        "AltLeft": 0xE2,  // LAlt
        "AltRight": 0xE6,  // Ralt
        "Semicolon": 0x33,  // ;
        "Equal": 0x2E,  // =
        "Comma": 0x36,  // ,
        "Minus": 0x2D,  // -
        "Period": 0x37,  // .
        "Slash": 0x38,  // /
        "Backquote": 0x35,  // `
        "BracketLeft": 0x2F,  // [
        "Backslash": 0x31,  // \
        "BracketRight": 0x30,  // ]
        "Quote": 0x34,   // '

        "Back": 0x2A,  // Back
        " ": 0x2C,  // Space
        "Next": 0x4E,  // Next
        "Left": 0x50,  // Left
        "Up": 0x52,  // Up
        "Right": 0x4F,  // Right
        "Down": 0x51,  // Down
        "0": 0x27,  // 0
        "1": 0x1E,  // 1
        "2": 0x1F,  // 2
        "3": 0x20,  // 3
        "4": 0x21,  // 4
        "5": 0x22,  // 5
        "6": 0x23,  // 6
        "7": 0x24,  // 7
        "8": 0x25,  // 8
        "9": 0x26,  // 9
        "a": 0x04,  // A
        "b": 0x05,  // B
        "c": 0x06,  // C
        "d": 0x07,  // D
        "e": 0x08,  // E
        "f": 0x09,  // F
        "g": 0x0A,  // G
        "h": 0x0B,  // H
        "i": 0x0C,  // I
        "j": 0x0D,  // J
        "k": 0x0E,  // K
        "l": 0x0F,  // L
        "m": 0x10,  // M
        "n": 0x11,  // N
        "o": 0x12,  // O
        "p": 0x13,  // P
        "q": 0x14,  // Q
        "r": 0x15,  // R
        "s": 0x16,  // S
        "t": 0x17,  // T
        "u": 0x18,  // U
        "v": 0x19,  // V
        "w": 0x1A,  // W
        "x": 0x1B,  // X
        "y": 0x1C,  // Y
        "z": 0x1D,  // Z
        "Shift": 0xE1,  // LShiftKey
        "Control": 0xE0,  // LControlKey
        "Alt": 0xE2,  // LAlt
        ";": 0x33,  // ;
        "=": 0x2E,  // =
        ",": 0x36,  // ,
        "-": 0x2D,  // -
        ".": 0x37,  // .
        "/": 0x38,  // /
        "`": 0x35,  // `
        "[": 0x2F,  // [
        "\\": 0x31,  // \
        "]": 0x30,  // ]
        "'": 0x34,   // '
        "!": 0x1E,   // !
        "@": 0x1F,   // @
        "#": 0x20,   // #
        "$": 0x21,   // $
        "%": 0x22,   // %
        "^": 0x23,   // ^
        "&": 0x24,   // &
        "*": 0x25,   // *
        "(": 0x26,   // (
        ")": 0x27,   // )
    }

    this.controlKeyMapping = {
        16: 0xE1,  // LShiftKey
        161: 0xE5,  // RShiftKey
        17: 0xE0,  // LControlKey
        163: 0xE4,  // RControlKey
        18: 0xE2,  // LAlt
        165: 0xE6,  // Ralt
        "ShiftLeft": 0xE1,  // LShiftKey
        "ShiftRight": 0xE5,  // RShiftKey
        "ControlLeft": 0xE0,  // LControlKey
        "ControlRight": 0xE4,  // RControlKey
        "AltLeft": 0xE2,  // LAlt
        "AltRight": 0xE6,  // Ralt
        "MetaLeft": 0xE3,  // LWin
    }

    this.controlKeyDown = {
        16: false,  // LShiftKey
        161: false,  // RShiftKey
        17: false,  // LControlKey
        163: false,  // RControlKey
        18: false,  // LAlt
        165: false,  // Ralt
        "ShiftLeft": false,  // LShiftKey
        "ShiftRight": false,  // RShiftKey
        "ControlLeft": false,  // LControlKey
        "ControlRight": false,  // RControlKey
        "AltLeft": false,  // LAlt
        "AltRight": false,  // Ralt
        "MetaLeft": false,  // LWin
    }

    this.controlKeyBinary = {
        // USB HID modifier bitmasks
        16: 0x02,  // LShiftKey
        161: 0x20,  // RShiftKey
        17: 0x01,  // LControlKey
        163: 0x10,  // RControlKey
        18: 0x04,  // LAlt
        165: 0x40,  // RAlt
        "ShiftLeft": 0x02,
        "ShiftRight": 0x20,
        "ControlLeft": 0x01,
        "ControlRight": 0x10,
        "AltLeft": 0x04,
        "AltRight": 0x40,
        "MetaLeft": 0x08,
        "MetaRight": 0x80,
    }

    this.pressedKeys = [];

    this.toUnit8Array = function (data) {
        let sum = 2
        for (let i = 2; i < data.length; i++) {
            sum = sum + data[i];
        }
        data.push(sum);
        return new Uint8Array(data);
    }

    this.getModifierByte = function () {
        let controlValue = 0;
        for (const controlKeyDownKey in this.controlKeyDown) {
            if (this.controlKeyDown[controlKeyDownKey]) {
                controlValue = controlValue | (this.controlKeyBinary[controlKeyDownKey] || 0);
            }
        }
        return controlValue;
    }

    this.syncKeyboard = function () {
        let data = [0x57, 0xAB, 0x00, 0x02, 0x08, this.getModifierByte(), 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        for (let i = 0; i < Math.min(6, this.pressedKeys.length); i++) {
            data[7 + i] = this.pressedKeys[i];
        }
        this.write(this.toUnit8Array(data));
    }

    this.keydown = function (key) {
        if (this.controlKeyMapping[key]) {
            this.controlKeyDown[key] = true;
            this.syncKeyboard();
            return;
        }
        let keyCode = this.keyboardMapping[key];
        if (keyCode == null || keyCode === undefined) {
            return;
        }
        if (this.pressedKeys.indexOf(keyCode) === -1) {
            if (this.pressedKeys.length >= 6) {
                this.pressedKeys.shift();
            }
            this.pressedKeys.push(keyCode);
        }
        this.syncKeyboard();
    }

    this.keyboardReleasePacket = new Uint8Array([0x57, 0xAB, 0x00, 0x02, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0C]);

    this.keyup = function (key) {
        if (this.controlKeyMapping[key]) {
            this.controlKeyDown[key] = false;
            this.syncKeyboard();
            return;
        }
        let keyCode = this.keyboardMapping[key];
        if (keyCode != null && keyCode !== undefined) {
            this.pressedKeys = this.pressedKeys.filter(function (code) {
                return code !== keyCode;
            });
        }
        this.syncKeyboard();
    }

    this.releaseAllKeys = function () {
        this.pressedKeys = [];
        for (const controlKeyDownKey in this.controlKeyDown) {
            this.controlKeyDown[controlKeyDownKey] = false;
        }
        this.write(this.keyboardReleasePacket);
    }

    this._appendRx = function (chunk) {
        if (!chunk || !chunk.length) {
            return;
        }
        let next = new Uint8Array(this._rxBuffer.length + chunk.length);
        next.set(this._rxBuffer, 0);
        next.set(chunk, this._rxBuffer.length);
        this._rxBuffer = next;
    }

    this._tryParseFrame = function (expectCmd) {
        let buf = this._rxBuffer;
        for (let i = 0; i < buf.length - 5; i++) {
            if (buf[i] !== 0x57 || buf[i + 1] !== 0xAB) {
                continue;
            }
            let len = buf[i + 4];
            let total = 6 + len;
            if (i + total > buf.length) {
                return null;
            }
            let cmd = buf[i + 3];
            let data = buf.slice(i + 5, i + 5 + len);
            this._rxBuffer = buf.slice(i + total);
            if (expectCmd == null || cmd === expectCmd) {
                return {cmd: cmd, data: data};
            }
        }
        // 丢掉无法对齐的前缀，避免缓冲区堵死
        if (buf.length > 64) {
            this._rxBuffer = buf.slice(buf.length - 64);
        }
        return null;
    }

    this._readFrame = async function (expectCmd, timeoutMs) {
        if (!reader) {
            return null;
        }
        let deadline = Date.now() + (timeoutMs || 300);
        while (Date.now() < deadline) {
            let parsed = this._tryParseFrame(expectCmd);
            if (parsed) {
                return parsed;
            }
            let wait = deadline - Date.now();
            if (wait <= 0) {
                break;
            }
            let result = await Promise.race([
                reader.read(),
                new Promise(function (resolve) {
                    setTimeout(function () {
                        resolve({timeout: true});
                    }, wait);
                })
            ]);
            if (result.timeout || result.done) {
                break;
            }
            this._appendRx(result.value);
        }
        return this._tryParseFrame(expectCmd);
    }

    this.queryCapsLock = async function () {
        await this.write(this.toUnit8Array([0x57, 0xAB, 0x00, 0x01, 0x00]));
        await this._writeChain;
        let frame = await this._readFrame(0x81, 300);
        if (!frame || !frame.data || frame.data.length < 3) {
            return null;
        }
        return (frame.data[2] & 0x02) !== 0;
    }

    this.ensureCapsLockOff = async function () {
        let capsOn = await this.queryCapsLock();
        if (capsOn !== true) {
            return false;
        }
        await this.tapKey(0x39, false);
        await new Promise(function (resolve) {
            setTimeout(resolve, 60);
        });
        return true;
    }

    // 可打印字符 -> { code, shift }；仅覆盖 US 键盘常见字符（粘贴中文会跳过）
    this.resolveTypeChar = function (ch) {
        if (ch === "\n" || ch === "\r") {
            return {code: 0x28, shift: false};
        }
        if (ch === "\t") {
            return {code: 0x2B, shift: false};
        }
        if (ch === " ") {
            return {code: 0x2C, shift: false};
        }
        const shifted = {
            "!": 0x1E, "@": 0x1F, "#": 0x20, "$": 0x21, "%": 0x22, "^": 0x23,
            "&": 0x24, "*": 0x25, "(": 0x26, ")": 0x27, "_": 0x2D, "+": 0x2E,
            "{": 0x2F, "}": 0x30, "|": 0x31, ":": 0x33, "\"": 0x34, "~": 0x35,
            "<": 0x36, ">": 0x37, "?": 0x38
        };
        if (Object.prototype.hasOwnProperty.call(shifted, ch)) {
            return {code: shifted[ch], shift: true};
        }
        if (ch >= "A" && ch <= "Z") {
            return {code: this.keyboardMapping[ch.toLowerCase()], shift: true};
        }
        if (ch >= "a" && ch <= "z") {
            return {code: this.keyboardMapping[ch], shift: false};
        }
        if (ch >= "0" && ch <= "9") {
            return {code: this.keyboardMapping[ch], shift: false};
        }
        const unshifted = {
            "-": 0x2D, "=": 0x2E, "[": 0x2F, "]": 0x30, "\\": 0x31,
            ";": 0x33, "'": 0x34, "`": 0x35, ",": 0x36, ".": 0x37, "/": 0x38
        };
        if (Object.prototype.hasOwnProperty.call(unshifted, ch)) {
            return {code: unshifted[ch], shift: false};
        }
        return null;
    }

    this.tapKey = function (code, shift) {
        let self = this;
        return new Promise(function (resolve) {
            let mod = shift ? 0x02 : 0x00;
            let data = [0x57, 0xAB, 0x00, 0x02, 0x08, mod, 0x00, code, 0x00, 0x00, 0x00, 0x00, 0x00];
            self.write(self.toUnit8Array(data));
            setTimeout(function () {
                self.write(self.keyboardReleasePacket);
                setTimeout(resolve, 25);
            }, 35);
        });
    }

    this.typeText = async function (text) {
        if (!text) {
            return {typed: 0, skipped: 0, capsToggled: false};
        }
        let capsToggled = false;
        try {
            capsToggled = await this.ensureCapsLockOff();
        } catch (e) {
            capsToggled = false;
        }
        let typed = 0;
        let skipped = 0;
        for (let i = 0; i < text.length; i++) {
            let info = this.resolveTypeChar(text.charAt(i));
            if (!info || info.code == null) {
                skipped++;
                continue;
            }
            await this.tapKey(info.code, info.shift);
            typed++;
        }
        return {typed: typed, skipped: skipped, capsToggled: capsToggled};
    }

    this.sendCtrlAltDelete = function () {
        // LeftCtrl|LeftAlt + Delete
        let data = [0x57, 0xAB, 0x00, 0x02, 0x08, 0x05, 0x00, 0x4C, 0x00, 0x00, 0x00, 0x00, 0x00];
        this.write(this.toUnit8Array(data));
        let self = this;
        setTimeout(function () {
            self.releaseAllKeys();
        }, 50);
    }

    this.clicked = {command: 0x00, right: false};
    this.lastAbsX = 0;
    this.lastAbsY = 0;
    this._downAbsX = 0;
    this._downAbsY = 0;
    this._buttonDownAt = 0;
    this._lastMoveSentAt = 0;
    this._clickArmed = false;

    this.mouseRelativeClickLeft = function () {
        let data = [0x57, 0xAB, 0x00, 0x05, 0x05, 0x01, 0x01, 0x00, 0x00, 0x00];
        let packet = this.toUnit8Array(data);
        this.write(packet);
        this.clicked.command = 0x01;
    }

    this.mouseRelativeClickRight = function mouseClickRight() {
        let data = [0x57, 0xAB, 0x00, 0x05, 0x05, 0x01, 0x02, 0x00, 0x00, 0x00];
        let packet = this.toUnit8Array(data);
        this.write(packet);
        this.clicked.command = 0x02;
    }

    this.mouseRelativeClickMiddle = function () {
        let data = [0x57, 0xAB, 0x00, 0x05, 0x05, 0x01, 0x04, 0x00, 0x00, 0x00];
        let packet = this.toUnit8Array(data);
        this.write(packet);
        this.clicked.command = 0x04;
    }

    this.mouseupRelative = function () {
        if (this.clicked.command === 0x00) {
            return;
        }
        let data = [0x57, 0xAB, 0x00, 0x05, 0x05, 0x01, 0x00, 0x00, 0x00, 0x00];
        let packet = this.toUnit8Array(data);
        this.write(packet);
        this.clicked.command = 0x00;
    }

    this.sendAbsolutePacket = function (buttons, wheel) {
        let xHighLow = this.hexHeightLow(this.lastAbsX);
        let yHighLow = this.hexHeightLow(this.lastAbsY);
        let data = [0x57, 0xAB, 0x00, 0x04, 0x07, 0x02, buttons, xHighLow[0], xHighLow[1], yHighLow[0], yHighLow[1], wheel & 0xff];
        let packet = this.toUnit8Array(data);
        this.write(packet);
    }

    this.mouseAbsoluteClickLeft = function () {
        this.clicked.command = 0x01;
        this.sendAbsolutePacket(0x01, 0x00);
    }

    this.mouseAbsoluteClickRight = function mouseClickRight() {
        this.clicked.command = 0x02;
        this.sendAbsolutePacket(0x02, 0x00);
    }

    this.mouseAbsoluteClickMiddle = function () {
        this.clicked.command = 0x04;
        this.sendAbsolutePacket(0x04, 0x00);
    }

    this.mouseupAbsolute = function () {
        if (this.clicked.command === 0x00) {
            return;
        }
        // 短点击：抬起时锁回按下坐标，避免微抖被系统当成拖拽导致右键菜单不出现
        let heldMs = Date.now() - (this._buttonDownAt || 0);
        if (heldMs < 300) {
            this.lastAbsX = this._downAbsX;
            this.lastAbsY = this._downAbsY;
        }
        this.clicked.command = 0x00;
        this.sendAbsolutePacket(0x00, 0x00);
    }


    this.mouseClickLeft = function () {
        if (mouseAbsolute) {
            this.mouseAbsoluteClickLeft();
        } else {
            this.mouseRelativeClickLeft();
        }
    }

    this.mouseClickRight = function mouseClickRight() {
        if (mouseAbsolute) {
            this.mouseAbsoluteClickRight();
        } else {
            this.mouseRelativeClickRight();
        }
    }

    this.mouseClickMiddle = function () {
        if (mouseAbsolute) {
            this.mouseAbsoluteClickMiddle();
        } else {
            this.mouseRelativeClickMiddle();
        }
    }

    this.mouseup = function () {
        if (mouseAbsolute) {
            this.mouseupAbsolute();
        } else {
            this.mouseupRelative();
        }
    }


    this.hexHeightLow = function hexHeightLow(val) {
        let high = ((val >> 8) & 0xff); //高8位
        let low = (val & 0xff); //低8位
        return [low, high];
    }

    this.clamp = function (value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    this.getContentRect = function (videoEl) {
        let rect = videoEl.getBoundingClientRect();
        let vw = videoEl.videoWidth || 0;
        let vh = videoEl.videoHeight || 0;
        let fit = (window.getComputedStyle(videoEl).objectFit || "fill").toLowerCase();
        if (!vw || !vh || fit === "fill" || fit === "none") {
            return {left: rect.left, top: rect.top, width: rect.width, height: rect.height};
        }
        let scale = fit === "cover"
            ? Math.max(rect.width / vw, rect.height / vh)
            : Math.min(rect.width / vw, rect.height / vh);
        let contentWidth = vw * scale;
        let contentHeight = vh * scale;
        return {
            left: rect.left + (rect.width - contentWidth) / 2,
            top: rect.top + (rect.height - contentHeight) / 2,
            width: contentWidth,
            height: contentHeight
        };
    }

    this.mapToAbsolute = function (videoEl, clientX, clientY) {
        let content = this.getContentRect(videoEl);
        if (content.width <= 0 || content.height <= 0) {
            return {x: this.lastAbsX, y: this.lastAbsY};
        }
        let nx = (clientX - content.left) / content.width;
        let ny = (clientY - content.top) / content.height;
        nx = this.clamp(nx, 0, 1);
        ny = this.clamp(ny, 0, 1);
        return {
            x: Math.floor(nx * 4095),
            y: Math.floor(ny * 4095)
        };
    }

    this.forceReleaseAllMouse = function () {
        this.clicked.command = 0x00;
        this._clickArmed = false;
        if (mouseAbsolute) {
            this.sendAbsolutePacket(0x00, 0x00);
            return;
        }
        let data = [0x57, 0xAB, 0x00, 0x05, 0x05, 0x01, 0x00, 0x00, 0x00, 0x00];
        this.write(this.toUnit8Array(data));
    }

    this.forceReleaseAllInput = function () {
        this.forceReleaseAllMouse();
        this.releaseAllKeys();
    }

    this.mouseMove = function (videoEl, clientX, clientY) {
        let point = this.mapToAbsolute(videoEl, clientX, clientY);
        // 相对模式未实现相对移动；禁止再发绝对包，避免冲掉相对按键状态（尤其是右键）
        if (!mouseAbsolute) {
            this.lastAbsX = point.x;
            this.lastAbsY = point.y;
            return;
        }

        // 按住时先锁在按下点；只有位移超过死区才进入拖拽，避免微抖被当成拖拽
        // 0..4095 坐标系下约 40 ≈ 1080p 上十几个像素，略大于系统右键拖拽阈值
        if (this.clicked.command !== 0x00 && this._clickArmed) {
            let dx = point.x - this._downAbsX;
            let dy = point.y - this._downAbsY;
            if ((dx * dx + dy * dy) < (40 * 40)) {
                return;
            }
            this._clickArmed = false;
        }

        if (point.x === this.lastAbsX && point.y === this.lastAbsY) {
            return;
        }
        let now = Date.now();
        // 9600 串口吞吐有限：移动包节流，避免淹没按键抬起包
        if (now - this._lastMoveSentAt < 25) {
            this.lastAbsX = point.x;
            this.lastAbsY = point.y;
            return;
        }
        this.lastAbsX = point.x;
        this.lastAbsY = point.y;
        this._lastMoveSentAt = now;
        this.sendAbsolutePacket(this.clicked.command, 0x00);
    }

    this.mouseButtonDown = function (videoEl, clientX, clientY, buttons) {
        let point = this.mapToAbsolute(videoEl, clientX, clientY);
        this.lastAbsX = point.x;
        this.lastAbsY = point.y;
        this._downAbsX = point.x;
        this._downAbsY = point.y;
        this._buttonDownAt = Date.now();
        this._pressToken = (this._pressToken || 0) + 1;
        this._clickArmed = true;

        // 先强制松所有键，清掉被控端可能卡住的鼠标键/修饰键残留
        this.forceReleaseAllMouse();

        this.clicked.command = buttons;
        if (mouseAbsolute) {
            this.sendAbsolutePacket(buttons, 0x00);
            return;
        }
        if (buttons === 0x01) {
            this.mouseRelativeClickLeft();
        } else if (buttons === 0x02) {
            this.mouseRelativeClickRight();
        } else if (buttons === 0x04) {
            this.mouseRelativeClickMiddle();
        }
    }

    this.mouseButtonUp = function (button) {
        // 无论本地是否认为按着，抬起都强制发释放包，避免被控端键卡住
        if (button !== 0 && button !== 1 && button !== 2) {
            this.forceReleaseAllMouse();
            return;
        }
        let wasClick = this._clickArmed;
        this._clickArmed = false;
        this.clicked.command = 0x00;

        if (mouseAbsolute) {
            if (wasClick) {
                this.lastAbsX = this._downAbsX;
                this.lastAbsY = this._downAbsY;
            }
            this.sendAbsolutePacket(0x00, 0x00);
            return;
        }
        let data = [0x57, 0xAB, 0x00, 0x05, 0x05, 0x01, 0x00, 0x00, 0x00, 0x00];
        this.write(this.toUnit8Array(data));
    }

    this.mouseScroll = function (detail) {
        if (detail === 0) {
            return;
        }
        let wheel = detail > 0 ? 0xFF : 0x01;
        if (mouseAbsolute) {
            this.sendAbsolutePacket(this.clicked.command, wheel);
            return;
        }
        let data = [0x57, 0xAB, 0x00, 0x05, 0x05, 0x01, 0x00, 0x00, 0x00, wheel];
        let packet = this.toUnit8Array(data);
        this.write(packet);
    }

    this.write = function (packet) {
        // 串行化写入；按钮包插到队前逻辑用独立链仍保序，但缩短 catch 吞错后的空洞
        let next = function () {
            return writer.write(packet);
        };
        this._writeChain = this._writeChain.then(next, next);
        return this._writeChain;
    }
}
