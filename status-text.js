// 工具栏上两个状态图标的文案和颜色。只做「硬件状态 -> 说什么」的判断，
// 不碰 DOM，这样能单测——之前这段逻辑埋在页面里，改一次只能靠手点验证。
var StatusText = (function () {
    // 采集卡的 label 就是设备名，但 canvas 合成流会给一串随机 id，太长的不显示
    var MAX_LABEL_LENGTH = 40;

    // state: {errorLines, track, videoWidth, videoHeight}
    function describeVideo(state) {
        if (state.errorLines) {
            return {level: "error", lines: state.errorLines};
        }
        var track = state.track;
        if (!track) {
            return {level: "idle", lines: ["未打开视频", "点击重试"]};
        }
        // 采集卡被拔掉时轨道会 ended，光看 srcObject 是看不出来的
        if (track.readyState === "ended") {
            return {level: "error", lines: ["采集已中断", "采集卡可能被拔掉了", "点击重试"]};
        }

        var level = "ok";
        var lines = [];
        var label = (track.label || "").trim();
        lines.push(label && label.length <= MAX_LABEL_LENGTH ? label : "视频采集");

        if (track.muted) {
            // 轨道活着但没有帧进来，一般是采集卡那头没信号
            level = "warn";
            lines.push("采集卡没有画面输入");
        } else if (!state.videoWidth) {
            // videoWidth 要等 loadedmetadata 才有值
            level = "warn";
            lines.push("尚未收到画面");
        } else {
            lines.push(state.videoWidth + "×" + state.videoHeight);
            var settings = track.getSettings();
            if (settings.frameRate) {
                lines.push(Math.round(settings.frameRate) + " fps");
            }
        }

        lines.push("点击重开");
        return {level: level, lines: lines};
    }

    // state: {connected, serialLost, info, ackEnabled, baudRate, mouseRelative, pointerLocked}
    function describeSerial(state) {
        if (!state.connected) {
            return {level: "idle", lines: ["未连接串口"]};
        }
        if (state.serialLost) {
            return {level: "error", lines: ["串口已断开", "插回 CH9329 后会自动重连", "或点此立即重试"]};
        }

        var level = "ok";
        var lines = [];
        var info = state.info;
        if (!info) {
            level = "error";
            lines.push("芯片无应答");
        } else {
            lines.push("固件 " + info.version);
            lines.push(info.usbConnected ? "USB 已枚举" : "USB 未枚举");
            if (!info.usbConnected) {
                level = "warn";
            }
            if (info.asleep) {
                lines.push("被控端已休眠");
                level = "warn";
            }
            lines.push(info.capsLock ? "Caps Lock 开" : "Caps Lock 关");
        }

        if (!state.ackEnabled) {
            lines.push("已降级为只发不等");
            // 别把已有的 error 降级成 warn
            level = level === "ok" ? "warn" : level;
        }
        if (state.baudRate) {
            lines.push(state.baudRate + " bps");
        }
        // 相对模式没锁指针时，光标顶到屏幕边缘就走不动了，得让用户知道怎么解决
        if (state.mouseRelative) {
            lines.push(state.pointerLocked ? "指针已锁定（Esc 释放）" : "相对模式：点击画面锁定指针");
        }

        lines.push("点击刷新");
        return {level: level, lines: lines};
    }

    // state: {fullscreen, keyboardLocked, lockSupported}
    function describeFullscreen(state) {
        if (!state.fullscreen) {
            var lines = ["全屏"];
            if (state.lockSupported) {
                // 进全屏之前就告诉用户有这个好处，不然没人会想到
                lines.push("可捕获 Win、Alt+Tab 等系统键");
            }
            return {label: "全屏", lines: lines};
        }

        var full = ["退出全屏"];
        if (state.keyboardLocked) {
            full.push("系统快捷键已捕获");
            // Chrome 留的逃生口，不说清楚用户会以为退不出去
            full.push("长按 Esc 两秒退出");
        } else if (state.lockSupported) {
            // 多半是 F11 进的全屏：键盘锁定只认 JS 发起的全屏
            full.push("系统快捷键未捕获");
        }
        return {label: "退出全屏", lines: full};
    }

    // 录像文件名用本地时间，方便对着操作时间找文件
    function recordFileName(date) {
        var at = date || new Date();
        var pad = function (value) {
            return String(value).padStart(2, "0");
        };
        // getMonth 从 0 开始，getDate 才是几号（原来误用了 getDay，拿到的是星期几）
        return at.getFullYear()
            + pad(at.getMonth() + 1)
            + pad(at.getDate())
            + "-"
            + pad(at.getHours())
            + pad(at.getMinutes())
            + pad(at.getSeconds())
            + ".webm";
    }

    return {
        MAX_LABEL_LENGTH: MAX_LABEL_LENGTH,
        describeVideo: describeVideo,
        describeSerial: describeSerial,
        describeFullscreen: describeFullscreen,
        recordFileName: recordFileName
    };
})();

if (typeof module !== "undefined" && module.exports) {
    module.exports = StatusText;
}
