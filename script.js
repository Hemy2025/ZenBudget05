let tipoAzienda = '';
let fatture = [];
const limiteAnnuale = 85000;

function setTipoAzienda(tipo) {
  tipoAzienda = tipo;
  document.getElementById('calcolo-container').style.display = 'block';
  document.getElementById('storico-fatture').style.display = 'block';
  document.getElementById('pagamenti-previsti').style.display = 'block';
}

function getTrimestre(data) {
  const mese = new Date(data).getMonth() + 1;
  if (mese <= 3) return '1° Trim.';
  if (mese <= 6) return '2° Trim.';
  if (mese <= 9) return '3° Trim.';
  return '4° Trim.';
}

function aggiungiFattura() {
  const previdenza = document.getElementById('previdenza').value;
  const ateco = parseFloat(document.getElementById('ateco').value);
  const data = document.getElementById('data').value;
  const importo = parseFloat(document.getElementById('fatturato').value);

  if (!data || isNaN(importo)) {
    alert('Inserisci tutti i dati corretti.');
    return;
  }

  const imponibile = importo * ateco;
  const inps = (previdenza === 'gestione-separata') ? imponibile * 0.2607 : 0;
  const aliquotaImposta = tipoAzienda === 'start-up' ? 0.05 : 0.15;
  const imposta = imponibile * aliquotaImposta;
  const totale = inps + imposta;
  const netto = importo - totale;
  const trimestre = getTrimestre(data);

  const fattura = { data, importo, imponibile, inps, imposta, totale, netto, trimestre };
  fatture.push(fattura);
  aggiornaStorico();
  aggiornaResiduo();
  aggiornaPagamenti();
}

function aggiornaStorico() {
  const tbody = document.getElementById("lista-fatture");
  tbody.innerHTML = '';

  fatture.forEach((f, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${f.data}</td>
      <td>€ ${f.importo.toFixed(2)}</td>
      <td>€ ${f.imponibile.toFixed(2)}</td>
      <td>€ ${f.inps.toFixed(2)}</td>
      <td>€ ${f.imposta.toFixed(2)}</td>
      <td>€ ${f.totale.toFixed(2)}</td>
      <td>€ ${f.netto.toFixed(2)}</td>
      <td>${f.trimestre}</td>
      <td><button class="delete-btn" onclick="eliminaFattura(${index})">🗑️</button></td>
    `;
    tbody.appendChild(row);
  });
}

function aggiornaResiduo() {
  const somma = fatture.reduce((acc, f) => acc + f.importo, 0);
  const residuo = limiteAnnuale - somma;
  document.getElementById("residuo").textContent = `€ ${residuo.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`;
}

function aggiornaPagamenti() {
  const totaleImposte = fatture.reduce((acc, f) => acc + f.imposta, 0);
  const saldo = totaleImposte;
  const primoAcconto = saldo * 0.4;
  const secondoAcconto = saldo * 0.6;

  document.getElementById("pagamenti").innerHTML = `
    <strong>Saldo 30 giugno:</strong> € ${saldo.toFixed(2)}<br>
    <strong>Primo Acconto 30 giugno (40%):</strong> € ${primoAcconto.toFixed(2)}<br>
    <strong>Secondo Acconto 30 novembre (60%):</strong> € ${secondoAcconto.toFixed(2)}
  `;
}

function eliminaFattura(index) {
  fatture.splice(index, 1);
  aggiornaStorico();
  aggiornaResiduo();
  aggiornaPagamenti();
}
