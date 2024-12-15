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
        222: 0x34   // '
    }

    this.controlKeyMapping = {
        // 16: 0xE1,  // LShiftKey
        // 161: 0xE5,  // RShiftKey
        // 17: 0xE0,  // LControlKey
        // 163: 0xE4,  // RControlKey
        // 18: 0xE2,  // LAlt
        // 165: 0xE6,  // Ralt
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
        if (this.controlKeyMapping[key]) {
            data[5] = this.controlKeyMapping[key];
        } else {
            data[7] = keyCode;
            let packet = this.toUnit8Array(data);
            this.write(packet);
        }
    }

    this.keyboardReleasePacket = new Uint8Array([0x57, 0xAB, 0x00, 0x02, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0C]);

    this.clicked = {command: 0x00, right: false};

    this.keyup = function (key) {
        this.write(this.keyboardReleasePacket);
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
        let data = [0x57, 0xAB, 0x00, 0x04, 0x07, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, detail > 0 ? 0xFF : 0x01];
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
