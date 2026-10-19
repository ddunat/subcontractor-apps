// Paste on the website:
//   <div id="dc-booking"></div>
//   <script src="https://YOUR-RAILWAY-DOMAIN/embed.js" defer></script>
// Adds the booking form as an iframe that grows to fit its content.
(function () {
  var script = document.currentScript;
  var base = script ? new URL(script.src).origin : '';
  var host = document.getElementById('dc-booking') || script.parentNode;
  var lang = (host.getAttribute && host.getAttribute('data-lang')) || '';
  var src = location.href + (document.referrer ? ' | ref: ' + document.referrer : '');
  var frame = document.createElement('iframe');
  frame.src = base + '/?embed=1' + (lang ? '&lang=' + lang : '') + '&src=' + encodeURIComponent(src.slice(0, 280));
  frame.title = 'Online rezervacija';
  frame.loading = 'lazy';
  frame.setAttribute('allow', 'payment');
  frame.style.cssText = 'width:100%;border:0;min-height:720px;display:block;background:transparent';
  host.appendChild(frame);
  window.addEventListener('message', function (e) {
    if (e.origin !== base || !e.data || e.data.type !== 'dc-booking-height') return;
    frame.style.height = Math.max(600, Number(e.data.height) || 0) + 'px';
  });
})();
