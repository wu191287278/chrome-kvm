const test = require("node:test");
const assert = require("node:assert");

const StatusText = require("../status-text.js");

// MediaStreamTrack 的最小替身
function fakeTrack(options) {
    let opts = options || {};
    return {
        label: opts.label === undefined ? "USB Video" : opts.label,
        readyState: opts.readyState || "live",
        muted: !!opts.muted,
        getSettings: function () {
            return opts.settings || {};
        }
    };
}

function liveState(overrides) {
    return Object.assign({
        errorLines: null,
        track: fakeTrack(),
        videoWidth: 1920,
        videoHeight: 1080
    }, overrides || {});
}

test("视频状态文案", async (t) => {
    await t.test("没打开视频时是灰的，并提示可以点", () => {
        let status = StatusText.describeVideo({track: null});
        assert.strictEqual(status.level, "idle");
        assert.deepStrictEqual(status.lines, ["未打开视频", "点击重试"]);
    });

    await t.test("出错时原样显示错误，盖住其它信息", () => {
        let status = StatusText.describeVideo({
            errorLines: ["打开视频失败", "NotReadableError", "点击重试"],
            track: fakeTrack()
        });
        assert.strictEqual(status.level, "error");
        assert.deepStrictEqual(status.lines, ["打开视频失败", "NotReadableError", "点击重试"]);
    });

    await t.test("轨道 ended 说明采集卡可能被拔了", () => {
        let status = StatusText.describeVideo(liveState({track: fakeTrack({readyState: "ended"})}));
        assert.strictEqual(status.level, "error");
        assert.ok(status.lines.indexOf("采集卡可能被拔掉了") !== -1);
    });

    await t.test("一切正常时是绿的，显示设备名、分辨率和帧率", () => {
        let status = StatusText.describeVideo(liveState({
            track: fakeTrack({label: "USB Video", settings: {frameRate: 29.97}})
        }));
        assert.strictEqual(status.level, "ok");
        assert.strictEqual(status.lines[0], "USB Video");
        assert.ok(status.lines.indexOf("1920×1080") !== -1);
        assert.ok(status.lines.indexOf("30 fps") !== -1, "帧率应四舍五入");
        assert.strictEqual(status.lines[status.lines.length - 1], "点击重开");
    });

    await t.test("没有帧率信息时就不显示这一行", () => {
        let status = StatusText.describeVideo(liveState({track: fakeTrack({settings: {}})}));
        assert.ok(!status.lines.some(function (line) { return line.indexOf("fps") !== -1; }));
    });

    await t.test("轨道 muted 是黄的：采集卡那头没信号", () => {
        let status = StatusText.describeVideo(liveState({track: fakeTrack({muted: true})}));
        assert.strictEqual(status.level, "warn");
        assert.ok(status.lines.indexOf("采集卡没有画面输入") !== -1);
        assert.ok(!status.lines.some(function (line) { return line.indexOf("×") !== -1; }),
            "还没有画面时不该显示分辨率");
    });

    await t.test("元数据还没到（videoWidth 为 0）是黄的", () => {
        let status = StatusText.describeVideo(liveState({videoWidth: 0, videoHeight: 0}));
        assert.strictEqual(status.level, "warn");
        assert.ok(status.lines.indexOf("尚未收到画面") !== -1);
    });

    await t.test("label 是合成流那种随机长串时退回通用名，别把提示撑爆", () => {
        let long = "x".repeat(StatusText.MAX_LABEL_LENGTH + 1);
        let status = StatusText.describeVideo(liveState({track: fakeTrack({label: long})}));
        assert.strictEqual(status.lines[0], "视频采集");
    });

    await t.test("刚好到长度上限的 label 还是显示出来", () => {
        let exact = "x".repeat(StatusText.MAX_LABEL_LENGTH);
        let status = StatusText.describeVideo(liveState({track: fakeTrack({label: exact})}));
        assert.strictEqual(status.lines[0], exact);
    });

    await t.test("label 为空时退回通用名", () => {
        let status = StatusText.describeVideo(liveState({track: fakeTrack({label: "   "})}));
        assert.strictEqual(status.lines[0], "视频采集");
    });
});

function okInfo(overrides) {
    return Object.assign({
        version: "V1.3",
        usbConnected: true,
        asleep: false,
        capsLock: false
    }, overrides || {});
}

function serialState(overrides) {
    return Object.assign({
        connected: true,
        serialLost: false,
        info: okInfo(),
        ackEnabled: true,
        baudRate: 9600
    }, overrides || {});
}

test("键鼠状态文案", async (t) => {
    await t.test("没连串口时是灰的", () => {
        let status = StatusText.describeSerial({connected: false});
        assert.strictEqual(status.level, "idle");
        assert.deepStrictEqual(status.lines, ["未连接串口"]);
    });

    await t.test("串口断开是红的，并说明会自动重连", () => {
        let status = StatusText.describeSerial(serialState({serialLost: true}));
        assert.strictEqual(status.level, "error");
        assert.ok(status.lines.some(function (line) { return line.indexOf("自动重连") !== -1; }));
    });

    await t.test("一切正常时是绿的，显示固件、USB、Caps Lock 和波特率", () => {
        let status = StatusText.describeSerial(serialState());
        assert.strictEqual(status.level, "ok");
        assert.ok(status.lines.indexOf("固件 V1.3") !== -1);
        assert.ok(status.lines.indexOf("USB 已枚举") !== -1);
        assert.ok(status.lines.indexOf("Caps Lock 关") !== -1);
        assert.ok(status.lines.indexOf("9600 bps") !== -1);
        assert.strictEqual(status.lines[status.lines.length - 1], "点击刷新");
    });

    await t.test("芯片不应答是红的", () => {
        let status = StatusText.describeSerial(serialState({info: null}));
        assert.strictEqual(status.level, "error");
        assert.ok(status.lines.indexOf("芯片无应答") !== -1);
    });

    await t.test("USB 没被被控端枚举是黄的：连上了但按键到不了对面", () => {
        let status = StatusText.describeSerial(serialState({info: okInfo({usbConnected: false})}));
        assert.strictEqual(status.level, "warn");
        assert.ok(status.lines.indexOf("USB 未枚举") !== -1);
    });

    await t.test("被控端休眠是黄的", () => {
        let status = StatusText.describeSerial(serialState({info: okInfo({asleep: true})}));
        assert.strictEqual(status.level, "warn");
        assert.ok(status.lines.indexOf("被控端已休眠") !== -1);
    });

    await t.test("Caps Lock 开着会如实显示", () => {
        let status = StatusText.describeSerial(serialState({info: okInfo({capsLock: true})}));
        assert.ok(status.lines.indexOf("Caps Lock 开") !== -1);
    });

    await t.test("退化成不等应答时从绿降到黄", () => {
        let status = StatusText.describeSerial(serialState({ackEnabled: false}));
        assert.strictEqual(status.level, "warn");
        assert.ok(status.lines.indexOf("已降级为只发不等") !== -1);
    });

    await t.test("已经是红的不要被降级改成黄的", () => {
        let status = StatusText.describeSerial(serialState({info: null, ackEnabled: false}));
        assert.strictEqual(status.level, "error");
    });

    await t.test("波特率未知时不显示那一行", () => {
        let status = StatusText.describeSerial(serialState({baudRate: null}));
        assert.ok(!status.lines.some(function (line) { return line.indexOf("bps") !== -1; }));
    });
});

test("录像文件名", async (t) => {
    await t.test("按本地时间拼出 yyyymmdd-hhmmss.webm", () => {
        let at = new Date(2026, 8, 11, 14, 5, 3);
        assert.strictEqual(StatusText.recordFileName(at), "20260911-140503.webm");
    });

    await t.test("月份用 getMonth+1，不是星期几", () => {
        // 2026-01-02 是周五，误用 getDay 会得到 05
        let at = new Date(2026, 0, 2, 0, 0, 0);
        assert.strictEqual(StatusText.recordFileName(at), "20260102-000000.webm");
    });

    await t.test("不传时间就用当前时间，格式仍然对得上", () => {
        assert.match(StatusText.recordFileName(), /^\d{8}-\d{6}\.webm$/);
    });
});
