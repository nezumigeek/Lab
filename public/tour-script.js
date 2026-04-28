const questions = [
  "Do you or anyone in your group currently have a communicable illness, fever, vomiting, diarrhea, or open/infected wounds?",
  "Is every person in this group wearing the required visitor PPE (hairnets, beard covers, or shoe covers) as provided?",
  "Has everyone removed loose jewelry, watches, and personal items that are not permitted in the production area?",
  "Does the group agree to NOT touch any product, ingredient containers, or equipment during this visit?",
  "Is the group being escorted by a trained and authorized facility employee at all times?"
];

const answers = Array(questions.length).fill('');
let idx = 0;

const qTitle = document.getElementById('q-title');
const groupInfo = document.getElementById('group-info');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const submitBtn = document.getElementById('submit');

function getSelected() {
  const yes = document.getElementById('ans-yes');
  const no = document.getElementById('ans-no');
  if (yes.checked) return 'Yes';
  if (no.checked) return 'No';
  return '';
}

function setSelected(val) {
  document.getElementById('ans-yes').checked = (val === 'Yes');
  document.getElementById('ans-no').checked = (val === 'No');
}

function render() {
  qTitle.textContent = `${idx + 1}. ${questions[idx]}`;
  groupInfo.style.display = (idx === 0) ? 'block' : 'none';
  setSelected(answers[idx] || '');
  prevBtn.disabled = (idx === 0);
  nextBtn.style.display = (idx === questions.length - 1) ? 'none' : 'inline-block';
  submitBtn.style.display = (idx === questions.length - 1) ? 'inline-block' : 'none';
}

nextBtn.onclick = () => {
  const sel = getSelected();
  
  if (idx === 0) {
    const lead = document.getElementById('lead-name').value;
    const count = document.getElementById('guest-count').value.trim();
    const names = document.getElementById('guest-names').value.trim();

    // Validates that a lead was actually selected from the dropdown
    if (!lead || !count || !names) {
      alert("Required: Please select a Lead, and provide Group Count and Member Names.");
      return;
    }

    if (sel === 'Yes') {
      alert("ENTRY DENIED: Per FDA regulations, individuals with symptoms of communicable illness are not permitted in production areas.");
      return;
    }
  }

  if (!sel) {
    alert("Please select Yes or No to proceed.");
    return;
  }

  answers[idx] = sel;
  idx++;
  render();
};

prevBtn.onclick = () => {
  answers[idx] = getSelected();
  idx--;
  render();
};

submitBtn.onclick = async () => {
  const sel = getSelected();
  if (!sel) return alert("Please select Yes or No.");
  answers[idx] = sel;

  const payload = {
    formType: "Group Visitor/Security",
    timestamp: new Date().toISOString(),
    leadName: document.getElementById('lead-name').value,
    guestCount: document.getElementById('guest-count').value,
    memberNames: document.getElementById('guest-names').value,
    responses: questions.map((q, i) => ({
      question: q,
      answer: answers[i]
    }))
  };

  try {
    const res = await fetch('/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert('Group entry logged for ' + payload.leadName + '\'s group.');
      window.location.href = 'index.html';
    } else {
      alert('Error saving record. Check server.');
    }
  } catch (e) {
    alert('Network failure: ' + e.message);
  }
};

render();