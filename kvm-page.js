// 控制页的页面逻辑：视频流、串口连接、键鼠事件转发、工具栏状态。
// 协议细节在 ch9329.js，配置读写在 settings-store.js。
let videoElement = document.getElementById("video");
let containerElement = document.getElementById("container");
let globalWidth = 1920;
let globalHeight = 1080;
let ch;

function start(devices) {
    let settings = SettingsStore.read();
    if (!settings) {
        window.location.href = "settings.html";
        return;
    }

    let video = settings.video;
    if (!settings.video || !settings.video.deviceId) {
        return;
    }
    let audio = undefined;
    if (settings.audio && settings.audio.deviceId) {
        audio = {
            deviceId: {exact: settings.audio.deviceId},
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
        }
    }

    let screen = settings.resolution;
    let width = globalWidth;
    let height = globalHeight;
    if (screen && screen.width && screen.height) {
        width = screen.width;
        height = screen.height;
    }

    lastMediaArgs = {videoDeviceId: video.deviceId, audio: audio, width: width, height: height};
    startVideo(devices, false);

    if (settings.usb && settings.usb.deviceId) {
        openSerial(settings.usb.deviceId, settings.mouseClickMode);
    }
}

let lastMediaArgs = null;
let videoTrack = null;
let videoErrorLines = null;

function startVideo(onFirstStream, quiet) {
    if (!lastMediaArgs) {
        return;
    }
    let args = lastMediaArgs;
    videoErrorLines = null;
    setVideoStatus("warn", ["正在打开视频…"]);
    openMedia(args.videoDeviceId, args.audio, args.width, args.height)
        .then(stream => {
            videoElement.srcObject = stream;
            bindVideoTrack(stream);
            if (typeof onFirstStream === "function") {
                onFirstStream();
            }
        })
        .catch(function (e) {
            let message = e && e.message ? e.message : String(e);
            videoTrack = null;
            videoErrorLines = ["打开视频失败", message, "点击重试"];
            renderVideoStatus();
            if (!quiet) {
                alert(message);
            }
        });
}

// 采集卡被拔掉或没信号时轨道会 ended/muted，光看 srcObject 是看不出来的
function bindVideoTrack(stream) {
    let tracks = stream.getVideoTracks();
    videoTrack = tracks.length ? tracks[0] : null;
    // 拿到轨道就说明上一次的失败已经过去了，否则错误会一直盖住正常状态
    videoErrorLines = null;
    if (videoTrack) {
        videoTrack.addEventListener("ended", renderVideoStatus);
        videoTrack.addEventListener("mute", renderVideoStatus);
        videoTrack.addEventListener("unmute", renderVideoStatus);
    }
    renderVideoStatus();
}

function openMedia(videoDeviceId, audio, width, height) {
    // exact 分辨率极易 Overconstrained；按 ideal → 放宽 → 仅设备 回退
    let attempts = [
        {
            audio: audio,
            video: {
                deviceId: {exact: videoDeviceId},
                width: {ideal: width},
                height: {ideal: height}
            }
        },
        {
            audio: audio,
            video: {
                deviceId: {exact: videoDeviceId},
                width: {ideal: width}
            }
        },
        {
            audio: audio,
            video: {
                deviceId: {exact: videoDeviceId}
            }
        }
    ];
    let chain = Promise.reject(new Error("init"));
    for (let i = 0; i < attempts.length; i++) {
        (function (constraints) {
            chain = chain.catch(function () {
                return navigator.mediaDevices.getUserMedia(constraints);
            });
        })(attempts[i]);
    }
    return chain;
}

let currentBaudRate = null;
let activePort = null;
let lastSerialArgs = null;
let serialLost = false;

function applyStatus(buttonId, tooltipId, level, lines) {
    let button = document.querySelector(buttonId);
    let tooltip = document.querySelector(tooltipId);
    if (!button || !tooltip) {
        return;
    }
    // 用 classList 而不是覆盖 className，否则会把按钮上其他的类一起抹掉
    button.classList.remove("status-idle", "status-ok", "status-warn", "status-error");
    button.classList.add("status-" + level);
    tooltip.innerHTML = lines.join("<br>");
}

function setStatus(level, lines) {
    applyStatus("#inputStatusButton", "#inputStatusTooltip", level, lines);
}

function setVideoStatus(level, lines) {
    applyStatus("#videoStatusButton", "#videoStatusTooltip", level, lines);
}

function renderVideoStatus() {
    let status = StatusText.describeVideo({
        errorLines: videoErrorLines,
        track: videoTrack,
        videoWidth: videoElement.videoWidth,
        videoHeight: videoElement.videoHeight
    });
    setVideoStatus(status.level, status.lines);
}

function refreshVideoStatus() {
    // 已经断了就直接重开，正常的话只是刷新读数
    let broken = !!videoErrorLines || !videoTrack || videoTrack.readyState === "ended";
    if (broken) {
        startVideo(null, true);
        return;
    }
    renderVideoStatus();
}

function renderStatus(info) {
    let status = StatusText.describeSerial({
        connected: !!ch,
        serialLost: serialLost,
        info: info,
        ackEnabled: !!ch && ch.isAckEnabled(),
        baudRate: currentBaudRate
    });
    setStatus(status.level, status.lines);
}

async function refreshStatus() {
    if (!ch) {
        renderStatus(null);
        return;
    }
    if (serialLost) {
        reconnectSerial();
        return;
    }
    renderStatus(await ch.getInfo());
}

function handleSerialLost() {
    if (serialLost) {
        return;
    }
    serialLost = true;
    if (ch) {
        ch.markDisconnected();
    }
    console.warn("CH9329 串口已断开");
    renderStatus(null);
}

function reconnectSerial() {
    if (!lastSerialArgs) {
        return;
    }
    setStatus("warn", ["正在重连…"]);
    openSerial(lastSerialArgs.deviceId, lastSerialArgs.mouseClickMode);
}

// 拔掉 CH9329 时串口写入只会静默失败，必须靠 disconnect 事件才能让界面知道
function bindSerialLifecycle() {
    if (!navigator.serial || window.__chromeKvmSerialBound) {
        return;
    }
    window.__chromeKvmSerialBound = true;
    navigator.serial.addEventListener("disconnect", function (event) {
        if (activePort && event.target !== activePort) {
            return;
        }
        handleSerialLost();
    });
    navigator.serial.addEventListener("connect", function () {
        if (serialLost) {
            reconnectSerial();
        }
    });
}

function candidateBaudRates() {
    return SettingsStore.baudRateOrder(SettingsStore.readOrEmpty().baudRate, Ch9329.BAUD_RATES);
}

function openSerial(deviceId, mouseClickMode) {
    lastSerialArgs = {deviceId: deviceId, mouseClickMode: mouseClickMode};
    bindSerialLifecycle();
    navigator.serial.getPorts()
        .then(async function (ports) {
            let port = SettingsStore.pickSerialPort(ports, deviceId);
            if (!port) {
                // 重连途中设备还没回来是正常的，别拿弹窗打断用户
                if (serialLost) {
                    renderStatus(null);
                    return;
                }
                alert("未检测到所选串口设备。请到设置页重新授权并选择正确的 CH9329 端口。");
                return;
            }
            let mouseAbsolute = !mouseClickMode || mouseClickMode === "absolute";
            // 芯片实际波特率以探测结果为准，设置里的值只作为首选，避免配置不同步就连不上
            let connection = await Ch9329.connect(port, candidateBaudRates(), mouseAbsolute);
            ch = connection.ch;
            ch.onTransportError = handleSerialLost;
            activePort = port;
            serialLost = false;
            currentBaudRate = connection.baudRate;
            open();
            let info = connection.info;
            renderStatus(info);
            if (!info) {
                console.warn("CH9329 未应答 GET_INFO，命令将退化为不等应答发送");
                return;
            }
            console.log("CH9329", info, "baudRate=" + connection.baudRate);
            SettingsStore.patch({baudRate: connection.baudRate});
            if (!info.usbConnected) {
                alert("CH9329 的 USB 未被被控端枚举，请检查接到被控机的 USB 线。");
            }
        })
        .catch(function (e) {
            if (serialLost) {
                console.warn("重连失败", e);
                renderStatus(null);
                return;
            }
            alert(e && e.message ? e.message : String(e));
        });
}

function open() {
    if (window.__chromeKvmInputBound) {
        return;
    }
    window.__chromeKvmInputBound = true;

    videoElement.style.cursor = "none";
    document.addEventListener('keydown', (event) => {
        event.preventDefault()
        if (!ch) {
            return;
        }
        ch.keydown(event.code);
    })

    document.addEventListener('keyup', (event) => {
        event.preventDefault();
        if (!ch) {
            return;
        }
        ch.keyup(event.code);
    });

    // 累积滚动量再按齿数下发，保留滚动快慢；一格滚轮在 Chrome 里约 100px
    const WHEEL_PIXELS_PER_NOTCH = 100;
    let wheelPixels = 0;
    document.addEventListener('wheel', function (event) {
        if (!ch) {
            return;
        }
        let delta = event.deltaY;
        if (event.deltaMode === 1) {
            delta *= 16;   // 行
        } else if (event.deltaMode === 2) {
            delta *= 400;  // 页
        }
        wheelPixels += delta;
        let notches = Math.trunc(wheelPixels / WHEEL_PIXELS_PER_NOTCH);
        if (notches === 0) {
            return;
        }
        wheelPixels -= notches * WHEEL_PIXELS_PER_NOTCH;
        // 浏览器 deltaY 向下为正，协议齿数向上为正
        ch.mouseScroll(-notches);
    }, {passive: true});

    videoElement.addEventListener('mousemove', (event) => {
        if (!ch) {
            return;
        }
        ch.mouseMove(videoElement, event.clientX, event.clientY);
    });


    videoElement.addEventListener('mousedown', (event) => {
        event.preventDefault();
        if (!ch) {
            return;
        }
        let buttons = 0x00;
        if (event.button === 0) {
            buttons = 0x01;
        } else if (event.button === 1) {
            buttons = 0x04;
        } else if (event.button === 2) {
            buttons = 0x02;
        }
        if (buttons) {
            ch.mouseButtonDown(videoElement, event.clientX, event.clientY, buttons);
        }
    });
    videoElement.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });
    // 用 document 捕获，避免移出 video 时丢右键抬起；按 button 位释放
    document.addEventListener('mouseup', (event) => {
        if (!ch) {
            return;
        }
        ch.mouseButtonUp(event.button);
    });

    // 失焦/切走页面时强制松开所有键，防止被控端卡住
    window.addEventListener('blur', () => {
        if (ch) {
            ch.forceReleaseAllInput();
        }
    });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && ch) {
            ch.forceReleaseAllInput();
        }
    });

}

document.addEventListener('DOMContentLoaded', () => {
    start()
});

// 切换工具栏的显示和隐藏
function toggleToolbar() {
    const toolbar = document.querySelector('.floating-toolbar');
    toolbar.classList.toggle('hidden');
    // 箭头方向交给 CSS 旋转，这里只更新文案
    const collapsed = toolbar.classList.contains('hidden');
    document.querySelector('#toggleTooltip').innerText = collapsed ? '展开' : '收起';
    document.querySelector('#toggleButton').setAttribute('aria-label', collapsed ? '展开工具栏' : '收起工具栏');
}

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        // 进入全屏
        document.documentElement.requestFullscreen();
    } else {
        // 退出全屏
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// 画面尺寸要等元数据到了才有，所以拿到流之后还得再刷一次状态
['loadedmetadata', 'resize', 'playing', 'emptied'].forEach(function (name) {
    videoElement.addEventListener(name, renderVideoStatus);
});

// Win、Alt+Tab、Esc、Ctrl+W 这些键默认被本机的浏览器和系统吃掉，光靠
// preventDefault 拦不住，根本到不了被控端。Keyboard Lock 能把它们截下来，
// 但只对 JS 发起的全屏生效（按 F11 进的全屏不算）。
let keyboardLocked = false;

function keyboardLockSupported() {
    return !!(navigator.keyboard && navigator.keyboard.lock);
}

function lockKeyboard() {
    if (!keyboardLockSupported()) {
        return Promise.resolve(false);
    }
    // 不传参数就是锁全部按键；Chrome 保留「长按 Esc 两秒」作为逃生口，
    // 所以短按 Esc 会照常发给被控端，正好是 BIOS 里要用的
    return navigator.keyboard.lock()
        .then(function () {
            return true;
        })
        .catch(function (e) {
            console.warn("键盘锁定失败，系统快捷键仍会被本机拦截", e);
            return false;
        });
}

function renderFullscreenStatus() {
    let status = StatusText.describeFullscreen({
        fullscreen: !!document.fullscreenElement,
        keyboardLocked: keyboardLocked,
        lockSupported: keyboardLockSupported()
    });
    document.querySelector('#fullscreenTooltip').innerHTML = status.lines.join("<br>");
    document.querySelector('#fullscreenButton').setAttribute('aria-label', status.label);
}

// 退出全屏可能是点按钮、按 Esc、或者被浏览器强制退出，所以统一监听事件，
// 而不是在点击里切状态（F11 的全屏不走 Fullscreen API，不会触发这里）
document.addEventListener('fullscreenchange', function () {
    let full = !!document.fullscreenElement;
    document.body.classList.toggle('is-fullscreen', full);

    if (!full) {
        if (keyboardLockSupported()) {
            navigator.keyboard.unlock();
        }
        keyboardLocked = false;
        renderFullscreenStatus();
        return;
    }

    // 先按「还没锁上」渲染一次，锁定是异步的，成了再刷新
    renderFullscreenStatus();
    lockKeyboard().then(function (locked) {
        keyboardLocked = locked;
        renderFullscreenStatus();
    });
});

renderFullscreenStatus();

let mediaRecorder;

function startRecord() {
    document.querySelector("#startRecordStatus").style.display = "none";
    document.querySelector("#stopRecordStatus").style.display = "flex";
    if (mediaRecorder) {
        mediaRecorder.stop();
    }
    const stream = videoElement.srcObject;

    // 将MediaStream转换为Blob数据
    mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm'
    });

    // 创建一个空数组来保存录制的Blob对象
    const chunks = [];

    // 监听dataavailable事件来收集Blob数据
    mediaRecorder.ondataavailable = event => {
        if (event.data && event.data.size > 0) {
            chunks.push(event.data);
        }
    };

    // 监听stop事件来处理录制完成后的操作
    mediaRecorder.onstop = () => {
        // 创建一个Blob URL来播放录制的视频
        const blob = new Blob(chunks, {type: 'video/webm'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = StatusText.recordFileName();
        a.click();
        URL.revokeObjectURL(url);
    };

    // 开始录制
    mediaRecorder.start();
}

function stopRecord() {
    if (mediaRecorder) {
        mediaRecorder.stop();
    }

    document.querySelector("#startRecordStatus").style.display = "flex";
    document.querySelector("#stopRecordStatus").style.display = "none";
}

async function pasteText() {
    if (!ch) {
        alert("键鼠设备未连接");
        return;
    }
    try {
        let text = await navigator.clipboard.readText();
        if (!text) {
            alert("剪贴板为空");
            return;
        }
        let result = await ch.typeText(text);
        if (result.skipped > 0) {
            alert("已粘贴 " + result.typed + " 个字符，跳过 " + result.skipped + " 个不支持字符（如中文）");
        }
    } catch (e) {
        alert("读取剪贴板失败：请先允许剪贴板权限，或确认页面在安全上下文中打开");
    }
}

function paste() {
    pasteText();
}

function ctrlAltDel() {
    if (!ch) {
        return;
    }
    ch.sendCtrlAltDelete();
}

function releaseAllInput() {
    if (!ch) {
        return;
    }
    ch.forceReleaseAllInput();
}

// 卸载 Service Worker 并清空 Cache Storage，不再使用 SW 缓存
(function clearServiceWorkerAndCaches() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations()
            .then(function (registrations) {
                return Promise.all(registrations.map(function (registration) {
                    return registration.unregister();
                }));
            })
            .catch(function () {});
    }
    if (typeof caches !== 'undefined' && caches.keys) {
        caches.keys()
            .then(function (keys) {
                return Promise.all(keys.map(function (key) {
                    return caches.delete(key);
                }));
            })
            .catch(function () {});
    }
})();
