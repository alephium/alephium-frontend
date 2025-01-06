// Created as a separate script to avoid inline scripts due to CSP
if (window.location.host === 'explorer.alephium.org') {
  const s = document.createElement('script')
  s.setAttribute('type', 'text/javascript')
  s.setAttribute('async', '')
  s.setAttribute('src', 'https://gc.zgo.at/count.js')
  s.setAttribute('data-goatcounter', 'https://alephium-explorer.goatcounter.com/count')
  document.body.appendChild(s)
}
