function Ch9329(writer) {
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
        "Quote": 0x34   // '
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
        16: 0x01,  // LShiftKey
        161: 0x05,  // RShiftKey
        17: 0x00,  // LControlKey
        163: 0x04,  // RControlKey
        18: 0x02,  // LAlt
        165: 0x06,  // Ralt
        "ShiftLeft": 0x02,  // LShiftKey
        "ShiftRight": 0x06,  // RShiftKey
        "ControlLeft": 0x01,  // LControlKey
        "ControlRight": 0x05,  // RControlKey
        "AltLeft": 0x03,  // LAlt
        "AltRight": 0x07,  // Ralt
        "MetaLeft": 0x04,  // LWin
        "MetaRight": 0x08,  // LWin
    }


    this.toUnit8Array = function (data) {
        let sum = 2
        for (let i = 2; i < data.length; i++) {
            sum = sum + data[i];
        }
        data.push(sum);
        return new Uint8Array(data);
    }


    this.keydown = function (key) {
        let data = [0x57, 0xAB, 0x00, 0x02, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        let keyCode = this.keyboardMapping[key];
        let controlValue = 0;
        let items = [];
        for (const controlKeyDownKey in this.controlKeyDown) {
            let value = this.controlKeyDown[controlKeyDownKey];
            if (value) {
                let binaryValue = this.controlKeyBinary[controlKeyDownKey];
                controlValue = controlValue + binaryValue;

                let keydownControlKey = this.controlKeyMapping[controlKeyDownKey];
                items.push(keydownControlKey)
            }
        }
        data[5] = controlValue;
        let index = 7;
        if (controlValue > 0) {
            for (let i = 0; i < items.length; i++) {
                data[index++] = items[i];
            }
            data[index] = keyCode;
        } else {
            data[7] = keyCode;
        }

        let packet = this.toUnit8Array(data);

        this.write(packet);

        if (this.controlKeyMapping[key]) {
            this.controlKeyDown[key] = true;
        }
    }


    this.keyboardReleasePacket = new Uint8Array([0x57, 0xAB, 0x00, 0x02, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0C]);

    this.clicked = {command: 0x00, right: false};

    this.keyup = function (key) {
        this.write(this.keyboardReleasePacket);
        if (this.controlKeyMapping[key]) {
            this.controlKeyDown[key] = false;
        }
    }

    this.mouseClickLeft = function () {
        let data = [0x57, 0xAB, 0x00, 0x05, 0x05, 0x01, 0x01, 0x00, 0x00, 0x00];
        let packet = this.toUnit8Array(data);
        this.write(packet);
        this.clicked.command = 0x01;
    }

    this.mouseClickRight = function mouseClickRight() {
        let data = [0x57, 0xAB, 0x00, 0x05, 0x05, 0x01, 0x02, 0x00, 0x00, 0x00];
        let packet = this.toUnit8Array(data);
        this.write(packet);
    }

    this.mouseClickMiddle = function () {
        let data = [0x57, 0xAB, 0x00, 0x05, 0x05, 0x01, 0x04, 0x00, 0x00, 0x00];
        let packet = this.toUnit8Array(data);
        this.write(packet);
    }

    this.mouseup = function () {
        let data = [0x57, 0xAB, 0x00, 0x05, 0x05, 0x01, 0x00, 0x00, 0x00, 0x00];
        let packet = this.toUnit8Array(data);
        this.write(packet);
        this.clicked.command = 0x00;
    }

    this.hexHeightLow = function hexHeightLow(val) {
        let high = ((val >> 8) & 0xff); //高8位
        let low = (val & 0xff); //低8位
        return [low, high];
    }


    this.mouseMove = function (screenWidth, screenHeight, videoWidth, videoHeight, clientX, clientY) {
        let event = this.getRealCoordinates(screenWidth, screenHeight, videoWidth, videoHeight, clientX, clientY);
        let x = event.x;
        let y = event.y;
        let mouseX = (x * 4096) / screenWidth;
        let mouseY = (y * 4096) / screenHeight;
        let xHighLow = this.hexHeightLow(mouseX);
        let yHighLow = this.hexHeightLow(mouseY);
        let data = [0x57, 0xAB, 0x00, 0x04, 0x07, 0x02, this.clicked.command, xHighLow[0], xHighLow[1], yHighLow[0], yHighLow[1], 0x00];
        let packet = this.toUnit8Array(data);
        this.write(packet);
    }
    //
    // this.mouseMove = function (x, y) {
    //     let data = [0x57, 0xAB, 0x00, 0x05, 0x05, 0x01, this.clicked.command, x, y, 0x00];
    //     let packet = this.toUnit8Array(data);
    //     this.write(packet);
    // }

    this.mouseScroll = function (detail) {
        if (detail === 0) {
            return;
        }
        let data = [0x57, 0xAB, 0x00, 0x05, 0x05, 0x01, 0x00, 0x00, 0x00, detail > 0 ? 0xFF : 0x01];
        let packet = this.toUnit8Array(data);
        this.write(packet);
    }

    this.write = function (packet) {
        return writer.write(packet)
    }


    this.getRealCoordinates = function (screenWidth, screenHeight, videoWidth, videoHeight, clientX, clientY) {
        let heightScale = screenHeight / videoHeight;
        let widthScale = screenWidth / videoWidth;

        // 计算缩放后的实际位置
        const realX = (clientX * widthScale);
        const realY = (clientY * heightScale);
        return {x: Math.floor(realX) - 1, y: Math.floor(realY) - 1};
    }
}
