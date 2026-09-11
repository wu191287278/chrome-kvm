"use strict";

// 模拟 CH9329 芯片：按协议 V1.3 校验收到的帧并回应答，
// 校验和不对就回 0xE4，这样测试能真正卡住组包错误。
function checksum(bytes) {
    let sum = 0;
    for (let i = 0; i < bytes.length; i++) {
        sum = (sum + bytes[i]) & 0xff;
    }
    return sum;
}

function buildFrame(cmd, data) {
    const frame = [0x57, 0xAB, 0x00, cmd, data.length].concat(data);
    frame.push(checksum(frame));
    return frame;
}

function defaultParaCfg(baudRate) {
    const cfg = new Array(50).fill(0);
    cfg[0] = 0x80;                  // 硬件引脚设置的工作模式 0
    cfg[1] = 0x80;                  // 硬件引脚设置的协议传输模式
    cfg[2] = 0x00;                  // 地址码
    cfg[3] = (baudRate >>> 24) & 0xff;
    cfg[4] = (baudRate >>> 16) & 0xff;
    cfg[5] = (baudRate >>> 8) & 0xff;
    cfg[6] = baudRate & 0xff;
    cfg[10] = 0x03;                 // 包间隔 3ms
    cfg[11] = 0x1A;                 // VID 0x1A86
    cfg[12] = 0x86;
    cfg[13] = 0xE1;                 // PID 0xE129
    cfg[14] = 0x29;
    cfg[18] = 0x01;                 // 键盘释放延时 1ms
    return cfg;
}

function createFakeChip(options) {
    options = options || {};

    const state = {
        raw: [],                          // 收到的原始字节，用于逐字节比对协议样例
        received: [],                     // 收到的命令帧 {cmd, data}
        rejected: [],                     // 被芯片判错的帧
        paraCfg: defaultParaCfg(options.baudRate || 9600),
        info: Object.assign({
            version: 0x30,
            usbConnected: 1,
            led: 0x00,
            sleep: 0x00
        }, options.info),
        silent: options.silent === true,  // 完全不应答
        errorsToInject: options.errorsToInject || 0,
        replyDelayMs: options.replyDelayMs == null ? 1 : options.replyDelayMs
    };

    const inbox = [];
    let notify = null;
    let cancelled = false;

    function deliver(frame) {
        setTimeout(function () {
            inbox.push(new Uint8Array(frame));
            wake();
        }, state.replyDelayMs);
    }

    function wake() {
        if (notify) {
            const n = notify;
            notify = null;
            n();
        }
    }

    function handle(packet) {
        const bytes = Array.from(packet);
        state.raw.push(bytes);
        const cmd = bytes[3];
        const len = bytes[4];
        const data = bytes.slice(5, 5 + len);

        if (bytes[0] !== 0x57 || bytes[1] !== 0xAB) {
            state.rejected.push({reason: "head", bytes: bytes});
            deliver(buildFrame(cmd | 0xC0, [0xE2]));
            return;
        }
        if (checksum(bytes.slice(0, bytes.length - 1)) !== bytes[bytes.length - 1]) {
            state.rejected.push({reason: "sum", bytes: bytes});
            deliver(buildFrame(cmd | 0xC0, [0xE4]));
            return;
        }
        if (bytes.length !== len + 6) {
            state.rejected.push({reason: "length", bytes: bytes});
            deliver(buildFrame(cmd | 0xC0, [0xE5]));
            return;
        }

        state.received.push({cmd: cmd, data: data});

        if (state.silent) {
            return;
        }
        if (state.errorsToInject > 0) {
            state.errorsToInject--;
            deliver(buildFrame(cmd | 0xC0, [0xE6]));
            return;
        }

        if (cmd === 0x01) {
            deliver(buildFrame(0x81, [
                state.info.version, state.info.usbConnected, state.info.led, state.info.sleep,
                0x00, 0x00, 0x00, 0x00
            ]));
            return;
        }
        if (cmd === 0x08) {
            deliver(buildFrame(0x88, state.paraCfg.slice()));
            return;
        }
        if (cmd === 0x09) {
            // 真芯片只接受 0x00-0x03 的工作模式和 0x00-0x02 的串口模式
            if (data.length !== 50 || data[0] > 0x03 || data[1] > 0x02) {
                state.rejected.push({reason: "para", bytes: data});
                deliver(buildFrame(0xC9, [0xE5]));
                return;
            }
            state.paraCfg = data.slice();
            deliver(buildFrame(0x89, [0x00]));
            return;
        }
        deliver(buildFrame(cmd | 0x80, [0x00]));
    }

    const writer = {
        write: async function (packet) {
            handle(packet);
        },
        releaseLock: function () {
        }
    };

    const reader = {
        read: async function () {
            if (cancelled) {
                return {done: true};
            }
            if (!inbox.length) {
                await new Promise(function (resolve) {
                    notify = resolve;
                });
            }
            if (cancelled) {
                return {done: true};
            }
            return {value: inbox.shift(), done: false};
        },
        cancel: async function () {
            cancelled = true;
            wake();
        },
        releaseLock: function () {
        }
    };

    return {writer: writer, reader: reader, state: state};
}

// 模拟 Web Serial 端口：只有以 chipBaudRate 打开时芯片才听得懂
function createFakePort(options) {
    options = options || {};
    const chipBaudRate = options.chipBaudRate || 9600;
    const log = [];
    let chip = null;
    let openedAt = null;

    const port = {
        readable: null,
        writable: null,
        open: async function (settings) {
            log.push("open@" + settings.baudRate);
            // 模拟端口被别的标签页独占：Chrome 打不开时就是抛错，不是返回失败
            if (options.failOpen) {
                throw new Error(typeof options.failOpen === "string"
                    ? options.failOpen : "Failed to open serial port.");
            }
            openedAt = settings.baudRate;
            chip = createFakeChip(Object.assign({}, options, {
                silent: options.silent === true || openedAt !== chipBaudRate,
                baudRate: chipBaudRate
            }));
            port.writable = {getWriter: function () { return chip.writer; }};
            port.readable = {getReader: function () { return chip.reader; }};
        },
        close: async function () {
            log.push("close");
            port.readable = null;
            port.writable = null;
        },
        getInfo: function () {
            return {usbVendorId: 0x1a86, usbProductId: 0xe129};
        }
    };

    return {
        port: port,
        log: log,
        chip: function () {
            return chip;
        }
    };
}

module.exports = {checksum, buildFrame, defaultParaCfg, createFakeChip, createFakePort};
