// 设置页下拉框里该列哪些设备。enumerateDevices 会把内置摄像头、
// 各种虚拟麦克风一起报上来，全列出来反而不好找采集卡。
var DeviceFilter = (function () {
    // 注意中文 Windows 会把音频输入命名成「麦克风 (设备名)」，采集卡也可能中招，
    // 所以过滤掉的设备必须能靠下面的兜底重新出现
    var BUILTIN_HINTS = {
        videoinput: ["facetime", "相机", "microsoft"],
        audioinput: ["麦克风", "microsoft"]
    };

    function looksBuiltIn(device) {
        var hints = BUILTIN_HINTS[device.kind] || [];
        var label = (device.label || "").toLowerCase();
        for (var i = 0; i < hints.length; i++) {
            if (label.indexOf(hints[i]) !== -1) {
                return true;
            }
        }
        return false;
    }

    // 过滤只是便利：已保存的设备一定保留，全被过滤光时退回完整列表，
    // 否则会出现「设置里引用的设备在下拉框里根本选不到」
    function forKind(devices, kind, savedDeviceId) {
        var all = (devices || []).filter(function (device) {
            return device.kind === kind;
        });
        var visible = all.filter(function (device) {
            return !looksBuiltIn(device) || device.deviceId === savedDeviceId;
        });
        return visible.length ? visible : all;
    }

    return {
        BUILTIN_HINTS: BUILTIN_HINTS,
        looksBuiltIn: looksBuiltIn,
        forKind: forKind
    };
})();

if (typeof module !== "undefined" && module.exports) {
    module.exports = DeviceFilter;
}
