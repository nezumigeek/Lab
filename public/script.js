const questions = [
  "Health Status: Are you currently free of communicable illnesses, fever, vomiting, diarrhea, or open/infected wounds? (117.10a)",
  "Contact History: To your knowledge, have you been free of close contact with contagious diseases in the past 72 hours?",
  "Hand Hygiene: Have you washed and sanitized your hands according to SOP immediately prior to this entry? (117.10b.3)",
  "PPE Integrity: Are you wearing all required cleanroom garments (gown, hair/beard covers, shoe covers, gloves), and have you confirmed they are clean and intact? (111.10b)",
  "Jewelry/Personal Items: Have you removed all jewelry, watches, phones, and other non-permitted personal items? (117.10b.4)",
  "Fragrances/Chemicals: Are you free of perfumes, colognes, or non-approved personal care products that could cause cross-contamination? (117.10b.9)",
  "Medication Control: Have you ensured that no non-approved medications or personal medical devices are being carried into the production area?",
  "Training Status: Are you currently trained and authorized for the specific tasks and clean area you are entering? (111.12)",
  "Material Control: Have you confirmed that all equipment, tools, or materials you are bringing in are pre-approved and properly sanitized? (117.40)",
  "Sanitary Habits: Have you ensured that no food, gum, tobacco, or drink is on your person? (117.10b.8)",
  "Foreign Matter: Have you confirmed you are not carrying any glass or brittle plastic items (including eyewear check)? (117.40)",
  "Storage: Have you stored all street clothing and personal items in the designated area outside the production zone? (117.10b.7)"
];

const answers = Array(questions.length).fill('');
let idx = 0;

const qTitle = document.getElementById('q-title');
const progress = document.getElementById('progress');
const prevBtn = document.getElementById('prev');
const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');
const personSelect = document.getElementById('personnel-select');

function render() {
  qTitle.textContent = questions[idx];
  progress.textContent = `Requirement ${idx + 1} of ${questions.length}`;
  prevBtn.style.display = (idx > 0) ? 'block' : 'none';
  
  // Lock the dropdown if progress has started
  personSelect.disabled = (idx > 0);
}

async function submitResults(status) {
  const payload = {
    timestamp: new Date().toISOString(),
    userName: personSelect.value, // Captured from header
    status: status, 
    stopIndex: idx,
    answers: questions.map((q, i) => ({
      question: q,
      answer: answers[i] || (i === idx && status === 'FAILED' ? 'No' : '')
    }))
  };

  try {
    const res = await fetch('/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (e) {
    alert('Network error - Record not saved. Notify QA.');
    return false;
  }
}

btnYes.onclick = async () => {
  if (!personSelect.value) {
    alert('Please select your name before proceeding.');
    return;
  }

  answers[idx] = 'Yes';
  
  if (idx < questions.length - 1) {
    idx++;
    render();
  } else {
    const ok = await submitResults('COMPLIANT');
    if (ok) {
      alert('Entry Authorized.');
      location.href = 'index.html';
    }
  }
};

btnNo.onclick = async () => {
  if (!personSelect.value) {
    alert('Please select your name before proceeding.');
    return;
  }

  const cfrMatch = questions[idx].match(/\(([^)]+)\)/);
  const cfrRef = cfrMatch ? cfrMatch[1] : "Site SOP";

  alert(`ENTRY DENIED\nPlease review requirement: ${cfrRef}. Attempt logged.`);
  
  await submitResults('FAILED');
  location.href = 'index.html';
};

prevBtn.onclick = () => {
  idx--;
  render();
};

render();
