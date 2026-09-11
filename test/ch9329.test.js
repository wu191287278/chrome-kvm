"use strict";

const test = require("node:test");
const assert = require("node:assert");

// getContentRect 会读 window.getComputedStyle，require 之前先补上
global.window = {
    getComputedStyle: function () {
        return {objectFit: global.__objectFit || "fill"};
    }
};

const Ch9329 = require("../ch9329.js");
const {createFakeChip, createFakePort} = require("./fake-ch9329.js");

function hex(bytes) {
    return Array.from(bytes)
        .map(function (b) {
            return b.toString(16).padStart(2, "0");
        })
        .join(" ");
}

function newChip(options) {
    const chip = createFakeChip(options);
    const ch = new Ch9329(chip.writer, true, chip.reader);
    return {chip: chip, ch: ch};
}

function fakeVideo(width, height, videoWidth, videoHeight) {
    return {
        videoWidth: videoWidth == null ? width : videoWidth,
        videoHeight: videoHeight == null ? height : videoHeight,
        getBoundingClientRect: function () {
            return {left: 0, top: 0, width: width, height: height};
        }
    };
}

function framesOf(chip, cmd) {
    return chip.state.raw.filter(function (bytes) {
        return bytes[3] === cmd;
    });
}

// 以下期望值全部抄自 CH9329 串口通信协议 V1.3 的命令样例
test("帧编码与协议文档样例逐字节一致", async function (t) {
    const {ch} = newChip();

    await t.test("CMD_GET_INFO", function () {
        assert.strictEqual(
            hex(ch.toUnit8Array([0x57, 0xAB, 0x00, 0x01, 0x00])),
            "57 ab 00 01 00 03"
        );
    });

    await t.test("键盘：按下 A / 释放 A", function () {
        assert.strictEqual(
            hex(ch.toUnit8Array([0x57, 0xAB, 0x00, 0x02, 0x08, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00])),
            "57 ab 00 02 08 00 00 04 00 00 00 00 00 10"
        );
        assert.strictEqual(
            hex(ch.keyboardReleasePacket),
            "57 ab 00 02 08 00 00 00 00 00 00 00 00 0c"
        );
    });

    await t.test("键盘：左 Shift + A", function () {
        assert.strictEqual(
            hex(ch.toUnit8Array([0x57, 0xAB, 0x00, 0x02, 0x08, 0x02, 0x00, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00])),
            "57 ab 00 02 08 02 00 04 00 00 00 00 00 12"
        );
    });
});

test("绝对鼠标包与文档样例一致", async function (t) {
    await t.test("按下左键 / 释放左键", async function () {
        const {chip, ch} = newChip();
        await ch.sendAbsolutePacket(0x01, 0x00);
        await ch.sendAbsolutePacket(0x00, 0x00);
        const frames = framesOf(chip, 0x04);
        assert.strictEqual(hex(frames[0]), "57 ab 00 04 07 02 01 00 00 00 00 00 10");
        assert.strictEqual(hex(frames[1]), "57 ab 00 04 07 02 00 00 00 00 00 00 0f");
    });

    await t.test("移动到 1280x768 屏幕的 (100,100) 和 (968,500)", async function () {
        const {chip, ch} = newChip();
        ch.lastAbsX = 320;
        ch.lastAbsY = 533;
        await ch.sendAbsolutePacket(0x00, 0x00);
        ch.lastAbsX = 3097;
        ch.lastAbsY = 2667;
        await ch.sendAbsolutePacket(0x00, 0x00);
        const frames = framesOf(chip, 0x04);
        assert.strictEqual(hex(frames[0]), "57 ab 00 04 07 02 00 40 01 15 02 00 67");
        assert.strictEqual(hex(frames[1]), "57 ab 00 04 07 02 00 19 0c 6b 0a 00 a9");
    });
});

test("相对鼠标包与文档样例一致", async function (t) {
    const chip = createFakeChip();
    const ch = new Ch9329(chip.writer, false, chip.reader);

    await t.test("按下左键 / 释放左键", async function () {
        await ch.sendRelativePacket(0x01, 0, 0, 0);
        await ch.sendRelativePacket(0x00, 0, 0, 0);
        const frames = framesOf(chip, 0x05);
        assert.strictEqual(hex(frames[0]), "57 ab 00 05 05 01 01 00 00 00 0e");
        assert.strictEqual(hex(frames[1]), "57 ab 00 05 05 01 00 00 00 00 0d");
    });

    await t.test("向左 3 像素 / 向下 5 像素", async function () {
        chip.state.raw.length = 0;
        await ch.sendRelativePacket(0x00, -3, 0, 0);
        await ch.sendRelativePacket(0x00, 0, 5, 0);
        const frames = framesOf(chip, 0x05);
        assert.strictEqual(hex(frames[0]), "57 ab 00 05 05 01 00 fd 00 00 0a");
        assert.strictEqual(hex(frames[1]), "57 ab 00 05 05 01 00 00 05 00 12");
    });
});

test("视口坐标按 4096 分辨率换算", async function (t) {
    const {ch} = newChip();

    await t.test("与文档的 1280x768 算例吻合", function () {
        const video = fakeVideo(1280, 768);
        assert.deepStrictEqual(ch.mapToAbsolute(video, 100, 100), {x: 320, y: 533});
        // 文档把 500 的 Y 写成 2667 是四舍五入，按公式截断应为 2666，差 1/4096 可忽略
        assert.deepStrictEqual(ch.mapToAbsolute(video, 968, 500), {x: 3097, y: 2666});
    });

    await t.test("边界落在 0 和 4095，不溢出 12 位坐标域", function () {
        const video = fakeVideo(1920, 1080);
        assert.deepStrictEqual(ch.mapToAbsolute(video, 0, 0), {x: 0, y: 0});
        assert.deepStrictEqual(ch.mapToAbsolute(video, 1920, 1080), {x: 4095, y: 4095});
        assert.deepStrictEqual(ch.mapToAbsolute(video, 9999, 9999), {x: 4095, y: 4095});
    });

    await t.test("object-fit: contain 时扣掉黑边", function () {
        global.__objectFit = "contain";
        // 16:9 的画面塞进 1000x1000 的框，上下各留 218.75 黑边
        const video = fakeVideo(1000, 1000, 1600, 900);
        const center = ch.mapToAbsolute(video, 500, 500);
        assert.deepStrictEqual(center, {x: 2048, y: 2048});
        const topBar = ch.mapToAbsolute(video, 500, 10);
        assert.strictEqual(topBar.y, 0, "点在黑边上应夹到画面顶边");
        global.__objectFit = "fill";
    });
});

test("每条命令都等芯片应答", async function (t) {
    await t.test("拿到应答后才 resolve", async function () {
        const {chip, ch} = newChip({replyDelayMs: 20});
        const started = Date.now();
        const frame = await ch.write(ch.toUnit8Array([0x57, 0xAB, 0x00, 0x02, 0x08, 0, 0, 0, 0, 0, 0, 0, 0]));
        assert.ok(Date.now() - started >= 15, "不应在收到应答前返回");
        assert.strictEqual(frame.cmd, 0x82);
        assert.strictEqual(chip.state.received.length, 1);
    });

    await t.test("芯片回错误应答时重发一次", async function () {
        const {chip, ch} = newChip({errorsToInject: 1});
        await ch.write(ch.toUnit8Array([0x57, 0xAB, 0x00, 0x02, 0x08, 0, 0, 0, 0, 0, 0, 0, 0]));
        assert.strictEqual(chip.state.received.length, 2, "首次被拒后应重发");
    });

    await t.test("芯片组包正确，不会被判校验和错误", async function () {
        const {chip, ch} = newChip();
        await ch.getInfo();
        await ch.sendAbsolutePacket(0x01, 0x00);
        await ch.tapKey(0x04, true);
        assert.deepStrictEqual(chip.state.rejected, []);
    });

    await t.test("连续无应答后降级为只发不等", async function () {
        const warn = console.warn;
        console.warn = function () {
        };
        try {
            const {chip, ch} = newChip({silent: true});
            assert.strictEqual(ch.isAckEnabled(), true);
            await ch.write(ch.toUnit8Array([0x57, 0xAB, 0x00, 0x02, 0x08, 0, 0, 0, 0, 0, 0, 0, 0]));
            await ch.write(ch.toUnit8Array([0x57, 0xAB, 0x00, 0x02, 0x08, 0, 0, 0, 0, 0, 0, 0, 0]));
            assert.strictEqual(ch.isAckEnabled(), false);

            const started = Date.now();
            for (let i = 0; i < 5; i++) {
                await ch.write(ch.toUnit8Array([0x57, 0xAB, 0x00, 0x02, 0x08, 0, 0, 0, 0, 0, 0, 0, 0]));
            }
            assert.ok(Date.now() - started < 100, "降级后不应再空等 500ms");
            assert.ok(chip.state.received.length >= 8, "降级后仍然继续发包");
        } finally {
            console.warn = warn;
        }
    });
});

test("移动包合并，按键包不被淹没", async function () {
    const {chip, ch} = newChip({replyDelayMs: 5});
    const video = fakeVideo(1920, 1080);

    for (let i = 1; i <= 30; i++) {
        ch.mouseMove(video, i * 10, i * 5);
    }
    ch.mouseButtonDown(video, 300, 150, 0x02);
    await ch.mouseButtonUp(2);
    await new Promise(function (resolve) {
        setTimeout(resolve, 200);
    });

    const frames = framesOf(chip, 0x04);
    assert.ok(frames.length < 12, "30 次移动应被合并，实际发出 " + frames.length + " 帧");
    const buttonFrames = frames.filter(function (bytes) {
        return bytes[6] === 0x02;
    });
    assert.strictEqual(buttonFrames.length, 1, "右键按下包必须原样送达");
    assert.strictEqual(hex(frames[frames.length - 1].slice(6, 7)), "00", "最后一帧应是释放包");
});

test("键盘状态机", async function (t) {
    await t.test("单键按下与释放", async function () {
        const {chip, ch} = newChip();
        ch.keydown(65);
        await new Promise(function (r) { setTimeout(r, 50); });
        assert.deepStrictEqual(chip.state.received[0].data, [0x00, 0x00, 0x04, 0, 0, 0, 0, 0]);
        ch.keyup(65);
        await new Promise(function (r) { setTimeout(r, 50); });
        assert.deepStrictEqual(chip.state.received[1].data, [0x00, 0x00, 0x00, 0, 0, 0, 0, 0]);
    });

    await t.test("修饰键位图按 USB HID 定义", function () {
        const {ch} = newChip();
        const cases = [
            ["ControlLeft", 0x01], ["ShiftLeft", 0x02], ["AltLeft", 0x04], ["MetaLeft", 0x08],
            ["ControlRight", 0x10], ["ShiftRight", 0x20], ["AltRight", 0x40], ["MetaRight", 0x80]
        ];
        for (const [key, expected] of cases) {
            ch.controlKeyDown[key] = true;
            assert.strictEqual(ch.getModifierByte(), expected, key + " 的位图应为 0x" + expected.toString(16));
            ch.controlKeyDown[key] = false;
        }
    });

    await t.test("修饰键走 keydown 也要认得出来", function () {
        // 上面那个用例直接改 controlKeyDown，绕过了查表；
        // 少一条映射时它照样通过，所以这里必须走真实入口
        const keys = [
            "ControlLeft", "ShiftLeft", "AltLeft", "MetaLeft",
            "ControlRight", "ShiftRight", "AltRight", "MetaRight"
        ];
        for (const key of keys) {
            const {ch} = newChip();
            ch.keydown(key);
            assert.notStrictEqual(ch.getModifierByte(), 0x00, key + " 按下后修饰位应该有值");
            assert.deepStrictEqual(ch.pressedKeys, [], key + " 是修饰键，不该占普通键位");
            ch.keyup(key);
            assert.strictEqual(ch.getModifierByte(), 0x00, key + " 松开后修饰位应清零");
        }
    });

    await t.test("全屏下被键盘锁定截获的系统键都能发出去", async function () {
        // 这些键平时被浏览器或系统吃掉，开了 Keyboard Lock 才会送到页面，
        // 查表里必须有对应条目，否则捕获了也是白捕获
        const cases = [
            ["Escape", 0x29], ["Tab", 0x2B], ["F11", 0x44],
            ["Delete", 0x4C], ["PrintScreen", 0x46], ["ContextMenu", 0x65]
        ];
        for (const [key, usage] of cases) {
            const {ch} = newChip();
            ch.keydown(key);
            assert.deepStrictEqual(ch.pressedKeys, [usage], key + " 应映射到 0x" + usage.toString(16));
        }
    });

    await t.test("组合键 Ctrl+Shift+A", async function () {
        const {chip, ch} = newChip();
        ch.keydown("ControlLeft");
        ch.keydown("ShiftLeft");
        ch.keydown("KeyA");
        await new Promise(function (r) { setTimeout(r, 80); });
        const last = chip.state.received[chip.state.received.length - 1];
        assert.strictEqual(last.data[0], 0x03, "左 Ctrl|左 Shift 应为 0x03");
        assert.strictEqual(last.data[2], 0x04);
    });

    await t.test("最多同时上报 6 个普通键", async function () {
        const {chip, ch} = newChip();
        const keys = ["KeyA", "KeyB", "KeyC", "KeyD", "KeyE", "KeyF", "KeyG"];
        for (const key of keys) {
            ch.keydown(key);
        }
        await new Promise(function (r) { setTimeout(r, 120); });
        const last = chip.state.received[chip.state.received.length - 1];
        assert.strictEqual(last.data.slice(2).filter(Boolean).length, 6);
        assert.ok(!last.data.includes(0x04), "最早按下的 A 应被挤出");
        assert.ok(last.data.includes(0x0A), "最后按下的 G 应在列");
    });

    await t.test("releaseAllKeys 清空全部状态", async function () {
        const {chip, ch} = newChip();
        ch.keydown("ControlLeft");
        ch.keydown("KeyA");
        await ch.releaseAllKeys();
        await new Promise(function (r) { setTimeout(r, 50); });
        const last = chip.state.received[chip.state.received.length - 1];
        assert.deepStrictEqual(last.data, [0, 0, 0, 0, 0, 0, 0, 0]);
        assert.strictEqual(ch.getModifierByte(), 0x00);
        assert.deepStrictEqual(ch.pressedKeys, []);
    });
});

test("鼠标按键不会卡在被控端", async function (t) {
    await t.test("抬起时无条件发释放包", async function () {
        const {chip, ch} = newChip();
        // 本地状态认为没有按下，仍然要发释放包
        ch.clicked.command = 0x00;
        await ch.mouseButtonUp(2);
        await new Promise(function (r) { setTimeout(r, 50); });
        const frames = framesOf(chip, 0x04);
        assert.strictEqual(frames.length, 1);
        assert.strictEqual(frames[0][6], 0x00);
    });

    await t.test("按下前先清掉可能残留的按键", async function () {
        const {chip, ch} = newChip();
        ch.mouseButtonDown(fakeVideo(1920, 1080), 100, 100, 0x02);
        await new Promise(function (r) { setTimeout(r, 80); });
        const frames = framesOf(chip, 0x04);
        assert.strictEqual(frames[0][6], 0x00, "第一包应是强制释放");
        assert.strictEqual(frames[1][6], 0x02, "第二包才是右键按下");
    });

    await t.test("短按期间的微抖不改变落点", async function () {
        const {chip, ch} = newChip();
        const video = fakeVideo(1920, 1080);
        ch.mouseButtonDown(video, 500, 500, 0x02);
        ch.mouseMove(video, 503, 502);
        await ch.mouseButtonUp(2);
        await new Promise(function (r) { setTimeout(r, 80); });
        const frames = framesOf(chip, 0x04);
        const down = frames.find(function (f) { return f[6] === 0x02; });
        const up = frames[frames.length - 1];
        assert.deepStrictEqual(down.slice(7, 11), up.slice(7, 11), "释放坐标应回到按下点");
    });
});

test("参数配置与波特率", async function (t) {
    await t.test("读回 50 字节配置", async function () {
        const {ch} = newChip({baudRate: 9600});
        const cfg = await ch.getParaCfg();
        assert.strictEqual(cfg.length, 50);
        assert.strictEqual(ch.readParaBaudRate(cfg), 9600);
        assert.strictEqual(hex(cfg.slice(3, 7)), "00 00 25 80", "9600 的默认编码见文档");
    });

    await t.test("切到 115200 只改波特率字段", async function () {
        const {chip, ch} = newChip({baudRate: 9600});
        const before = chip.state.paraCfg.slice();
        const result = await ch.setBaudRate(115200);
        assert.deepStrictEqual(result, {ok: true});
        const after = chip.state.paraCfg;
        assert.strictEqual(hex(after.slice(3, 7)), "00 01 c2 00");
        assert.strictEqual(ch.readParaBaudRate(after), 115200);
        assert.deepStrictEqual(after.slice(7), before.slice(7), "其余字段必须原样保留");
    });

    await t.test("写回时抹掉硬件引脚位，避免芯片回 0xE5", async function () {
        const {chip, ch} = newChip({baudRate: 9600});
        assert.strictEqual(chip.state.paraCfg[0], 0x80, "读到的是引脚设置的工作模式");
        await ch.setBaudRate(115200);
        assert.strictEqual(chip.state.paraCfg[0], 0x00);
        assert.strictEqual(chip.state.paraCfg[1], 0x00);
        assert.deepStrictEqual(chip.state.rejected, [], "不应被芯片判为参数错误");
    });

    await t.test("波特率已经一致时不重复写入", async function () {
        const {chip, ch} = newChip({baudRate: 115200});
        const result = await ch.setBaudRate(115200);
        assert.deepStrictEqual(result, {ok: true, unchanged: true});
        assert.strictEqual(chip.state.received.filter(function (f) { return f.cmd === 0x09; }).length, 0);
    });

    await t.test("芯片无应答时如实报错", async function () {
        const {ch} = newChip({silent: true});
        const warn = console.warn;
        console.warn = function () {
        };
        try {
            const result = await ch.setBaudRate(115200);
            assert.strictEqual(result.ok, false);
            assert.match(result.reason, /读取芯片参数配置失败/);
        } finally {
            console.warn = warn;
        }
    });
});

test("连接时探测波特率", async function (t) {
    await t.test("设置里的首选值不对时自动找到芯片实际波特率", async function () {
        const fake = createFakePort({chipBaudRate: 115200});
        const warn = console.warn;
        console.warn = function () {
        };
        let connection;
        try {
            connection = await Ch9329.connect(fake.port, [9600, 115200], true);
        } finally {
            console.warn = warn;
        }
        assert.strictEqual(connection.baudRate, 115200);
        assert.strictEqual(connection.probed, true);
        assert.ok(connection.info);
        assert.deepStrictEqual(fake.log, ["open@9600", "close", "open@115200"]);
        await connection.ch.dispose();
    });

    await t.test("首选值正确时一次命中", async function () {
        const fake = createFakePort({chipBaudRate: 115200});
        const connection = await Ch9329.connect(fake.port, [115200, 9600], true);
        assert.strictEqual(connection.baudRate, 115200);
        assert.deepStrictEqual(fake.log, ["open@115200"]);
        await connection.ch.dispose();
    });

    await t.test("完全不应答时退回首选波特率且仍可用", async function () {
        const fake = createFakePort({chipBaudRate: 9600, silent: true});
        const warn = console.warn;
        console.warn = function () {
        };
        let connection;
        try {
            connection = await Ch9329.connect(fake.port, [9600, 115200], true);
        } finally {
            console.warn = warn;
        }
        assert.strictEqual(connection.info, null);
        assert.strictEqual(connection.probed, false);
        assert.strictEqual(connection.baudRate, 9600);
        assert.ok(connection.ch, "仍应返回可用实例，退化成只发不等");
        await connection.ch.dispose();
    });
});

test("接收方向的帧解析", async function (t) {
    const {ch} = newChip();

    await t.test("半截帧先留在缓冲区", function () {
        ch._rxBuffer = new Uint8Array([0x57, 0xAB, 0x00, 0x82, 0x01]);
        assert.strictEqual(ch._shiftFrame(), null);
    });

    await t.test("校验和不符的帧被丢弃，后面的好帧照常解析", function () {
        ch._rxBuffer = new Uint8Array([
            0xFF, 0x00,                                // 垃圾前缀
            0x57, 0xAB, 0x00, 0x82, 0x01, 0x00, 0xFF,  // 坏校验和
            0x57, 0xAB, 0x00, 0x84, 0x01, 0x00, 0x87   // 好帧
        ]);
        const frame = ch._shiftFrame();
        assert.strictEqual(frame.cmd, 0x84);
        assert.deepStrictEqual(Array.from(frame.data), [0x00]);
        assert.strictEqual(ch._shiftFrame(), null, "不应有残留");
    });

    await t.test("分两次到达的帧能拼起来", function () {
        ch._rxBuffer = new Uint8Array(0);
        ch._appendRx(new Uint8Array([0x57, 0xAB, 0x00]));
        assert.strictEqual(ch._shiftFrame(), null);
        ch._appendRx(new Uint8Array([0x82, 0x01, 0x00, 0x85]));
        const frame = ch._shiftFrame();
        assert.strictEqual(frame.cmd, 0x82);
    });
});

test("文本输入", async function (t) {
    await t.test("逐字符发送按下与释放", async function () {
        const {chip, ch} = newChip();
        const result = await ch.typeText("Ab");
        assert.deepStrictEqual(result, {typed: 2, skipped: 0, capsToggled: false});
        const keyFrames = chip.state.received.filter(function (f) { return f.cmd === 0x02; });
        assert.strictEqual(keyFrames.length, 4, "两个字符对应 4 个键盘包");
        assert.strictEqual(keyFrames[0].data[0], 0x02, "大写 A 需要按住 Shift");
        assert.strictEqual(keyFrames[0].data[2], 0x04);
        assert.deepStrictEqual(keyFrames[1].data, [0, 0, 0, 0, 0, 0, 0, 0]);
        assert.strictEqual(keyFrames[2].data[0], 0x00, "小写 b 不带 Shift");
        assert.strictEqual(keyFrames[2].data[2], 0x05);
    });

    await t.test("键码表达不了的字符被跳过", async function () {
        const {ch} = newChip();
        const result = await ch.typeText("a中文b");
        assert.strictEqual(result.typed, 2);
        assert.strictEqual(result.skipped, 2);
    });

    await t.test("目标机 Caps Lock 亮着时先关掉再输入", async function () {
        const {chip, ch} = newChip({info: {led: 0x02}});
        const result = await ch.typeText("a");
        assert.strictEqual(result.capsToggled, true);
        const keyFrames = chip.state.received.filter(function (f) { return f.cmd === 0x02; });
        assert.strictEqual(keyFrames[0].data[2], 0x39, "第一个按键应是 Caps Lock");
    });

    await t.test("Caps Lock 已关时不多按", async function () {
        const {chip, ch} = newChip({info: {led: 0x00}});
        const result = await ch.typeText("a");
        assert.strictEqual(result.capsToggled, false);
        const keyFrames = chip.state.received.filter(function (f) { return f.cmd === 0x02; });
        assert.strictEqual(keyFrames[0].data[2], 0x04);
    });
});

test("滚轮按齿数编码", async function (t) {
    async function wheelByteOf(notches) {
        const {chip, ch} = newChip();
        await ch.mouseScroll(notches);
        await new Promise(function (r) { setTimeout(r, 30); });
        const frames = framesOf(chip, 0x04);
        return frames.length ? frames[0][11] : null;
    }

    await t.test("正数向上、负数向下，用补码表示", async function () {
        assert.strictEqual(await wheelByteOf(1), 0x01, "向上 1 格");
        assert.strictEqual(await wheelByteOf(-1), 0xFF, "向下 1 格");
        assert.strictEqual(await wheelByteOf(3), 0x03);
        assert.strictEqual(await wheelByteOf(-3), 0xFD);
    });

    await t.test("夹在协议允许的 ±127 齿内", async function () {
        assert.strictEqual(await wheelByteOf(127), 0x7F);
        assert.strictEqual(await wheelByteOf(-127), 0x81);
        assert.strictEqual(await wheelByteOf(9999), 0x7F);
        assert.strictEqual(await wheelByteOf(-9999), 0x81);
    });

    await t.test("零齿数不发包", async function () {
        assert.strictEqual(await wheelByteOf(0), null);
        assert.strictEqual(await wheelByteOf(0.4), null, "不足一格不应发包");
    });

    await t.test("滚动时保留当前按住的键", async function () {
        const {chip, ch} = newChip();
        ch.clicked.command = 0x01;
        await ch.mouseScroll(-2);
        await new Promise(function (r) { setTimeout(r, 30); });
        const frame = framesOf(chip, 0x04)[0];
        assert.strictEqual(frame[6], 0x01, "左键仍按着");
        assert.strictEqual(frame[11], 0xFE, "向下 2 格");
    });

    await t.test("相对模式下走 0x05 命令", async function () {
        const chip = createFakeChip();
        const ch = new Ch9329(chip.writer, false, chip.reader);
        await ch.mouseScroll(-1);
        await new Promise(function (r) { setTimeout(r, 30); });
        const frame = framesOf(chip, 0x05)[0];
        assert.strictEqual(hex(frame), "57 ab 00 05 05 01 00 00 00 ff 0c");
    });
});

test("串口断开", async function (t) {
    function brokenWriter() {
        return {
            write: async function () {
                throw new Error("The device has been lost.");
            }
        };
    }

    await t.test("写失败时标记断开并回调一次", async function () {
        const ch = new Ch9329(brokenWriter(), true, null);
        let calls = 0;
        ch.onTransportError = function () {
            calls++;
        };
        assert.strictEqual(ch.isConnected(), true);
        await ch.write(ch.toUnit8Array([0x57, 0xAB, 0x00, 0x02, 0x08, 0, 0, 0, 0, 0, 0, 0, 0]));
        assert.strictEqual(ch.isConnected(), false);
        assert.strictEqual(calls, 1);

        await ch.write(ch.toUnit8Array([0x57, 0xAB, 0x00, 0x02, 0x08, 0, 0, 0, 0, 0, 0, 0, 0]));
        assert.strictEqual(calls, 1, "断开后不应反复回调");
    });

    await t.test("断开后命令直接丢弃，不再写串口", async function () {
        const {chip, ch} = newChip();
        ch.markDisconnected();
        await ch.write(ch.toUnit8Array([0x57, 0xAB, 0x00, 0x02, 0x08, 0, 0, 0, 0, 0, 0, 0, 0]));
        ch.mouseMove(fakeVideo(1920, 1080), 100, 100);
        await new Promise(function (r) { setTimeout(r, 50); });
        assert.deepStrictEqual(chip.state.raw, [], "不应再有任何字节发出");
    });

    await t.test("断开时排队中的命令被结束掉，不会卡住调用方", async function () {
        const {ch} = newChip({silent: true, replyDelayMs: 0});
        const warn = console.warn;
        console.warn = function () {
        };
        try {
            const pending = ch.write(ch.toUnit8Array([0x57, 0xAB, 0x00, 0x02, 0x08, 0, 0, 0, 0, 0, 0, 0, 0]));
            const queued = ch.write(ch.toUnit8Array([0x57, 0xAB, 0x00, 0x02, 0x08, 0, 0, 0, 0, 0, 0, 0, 0]));
            ch.markDisconnected();
            assert.strictEqual(await queued, null, "排队未发的命令应立即以 null 结束");
            await pending;
        } finally {
            console.warn = warn;
        }
    });
});

test("GET_INFO 解析", async function (t) {
    await t.test("版本、USB 枚举、指示灯、休眠位", async function () {
        const {ch} = newChip({info: {version: 0x31, usbConnected: 0x01, led: 0x07, sleep: 0x03}});
        const info = await ch.getInfo();
        assert.deepStrictEqual(info, {
            version: "V3.1",
            usbConnected: true,
            numLock: true,
            capsLock: true,
            scrollLock: true,
            asleep: true
        });
    });

    await t.test("USB 未枚举、未睡眠", async function () {
        const {ch} = newChip({info: {version: 0x30, usbConnected: 0x00, led: 0x00, sleep: 0x00}});
        const info = await ch.getInfo();
        assert.strictEqual(info.usbConnected, false);
        assert.strictEqual(info.asleep, false);
    });
});
