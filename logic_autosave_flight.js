(function () {
  'use strict';

  if (window.__vgForceUpdateGate) return;
  window.__vgForceUpdateGate = 1;

  var DOWNLOAD_URL = 'https://drive.google.com/drive/folders/1N-SeiK3NbwvGV_Malqhrv1GnWRnqxVu4?usp=drive_link';

  function showUpdateNotice() {
    var host = document.body || document.documentElement;
    if (!host) return setTimeout(showUpdateNotice, 50);
    if (document.getElementById('vg-update-overlay')) return;

    var overlay = document.createElement('div');
    overlay.id = 'vg-update-overlay';
    overlay.style.cssText = [
      'position:fixed;inset:0;z-index:2147483647;background:rgba(4,8,15,0.94);',
      'backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;',
      'padding:16px;font-family:"Segoe UI",Roboto,sans-serif;color:#e2e8f0;'
    ].join('');

    overlay.innerHTML =
      '<div style="width:100%;max-width:320px;background:rgba(9,14,23,0.98);border:1px solid rgba(34,211,238,0.45);' +
      'border-radius:16px;padding:20px;box-shadow:0 20px 50px rgba(0,0,0,0.9),0 0 28px rgba(6,182,212,0.22);text-align:center;">' +
        '<div style="display:inline-block;padding:4px 10px;border-radius:20px;background:rgba(6,182,212,0.15);border:1px solid rgba(34,211,238,0.35);color:#67e8f9;font-size:10px;font-weight:800;letter-spacing:.8px;margin-bottom:10px;">' +
          'UPDATE REQUIRED' +
        '</div>' +
        '<div style="font-size:15px;font-weight:800;color:#ffffff;margin-bottom:8px;">' +
          'Aplikasi Versi Baru Tersedia!' +
        '</div>' +
        '<div style="font-size:11.5px;line-height:1.5;color:#cbd5e1;margin-bottom:12px;">' +
          'Versi ini sudah tidak didukung. Silakan unduh dan pasang <b>APK versi terbaru</b> melalui tombol di bawah ini.' +
        '</div>' +
        '<div style="background:rgba(15,23,42,0.85);border:1px solid rgba(251,191,36,0.35);border-radius:10px;padding:10px;margin-bottom:14px;font-size:11px;line-height:1.45;color:#fde68a;">' +
          'Gunakan <b>License Key</b> yang sudah diberikan sebelumnya untuk masuk.<br>' +
          '<span style="color:#94a3b8;font-size:10.5px;">Belum punya key? Silakan minta ke <b>Admin</b>.</span>' +
        '</div>' +
        '<button id="vg-dl-btn" style="width:100%;padding:10px 12px;border:none;border-radius:10px;cursor:pointer;' +
          'background:linear-gradient(135deg,#0891b2,#10b981);color:#ffffff;font-size:12px;font-weight:800;letter-spacing:.5px;margin-bottom:8px;">' +
          'DOWNLOAD APLIKASI BARU' +
        '</button>' +
        '<button id="vg-copy-btn" style="width:100%;padding:7px 10px;border:1px solid rgba(148,163,184,0.3);border-radius:8px;cursor:pointer;' +
          'background:transparent;color:#94a3b8;font-size:10.5px;font-weight:700;">' +
          'SALIN LINK DOWNLOAD' +
        '</button>' +
        '<div id="vg-copy-msg" style="font-size:10px;color:#10b981;min-height:14px;margin-top:6px;"></div>' +
      '</div>';

    host.appendChild(overlay);

    var dlBtn = document.getElementById('vg-dl-btn');
    var copyBtn = document.getElementById('vg-copy-btn');
    var copyMsg = document.getElementById('vg-copy-msg');

    dlBtn.onclick = function () {
      try {
        window.open(DOWNLOAD_URL, '_blank');
      } catch (e) {}
      location.href = DOWNLOAD_URL;
    };

    copyBtn.onclick = function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(DOWNLOAD_URL).then(function () {
          copyMsg.textContent = 'Link berhasil disalin! Tempel di browser.';
        }).catch(function () {
          copyMsg.textContent = DOWNLOAD_URL;
        });
      } else {
        copyMsg.textContent = DOWNLOAD_URL;
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showUpdateNotice);
  } else {
    showUpdateNotice();
  }
})();
