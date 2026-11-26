const colors = ['Red', 'Green', 'Violet'];
const colorButtons = [...document.querySelectorAll('.color-option')];
const balanceOutput = document.querySelector('#balance');
const availableBalanceOutput = document.querySelector('#available-balance');
const roundOutput = document.querySelector('#round-id');
const countdownOutput = document.querySelector('#countdown');
const roundStatusOutput = document.querySelector('#round-status');
const timerCaption = document.querySelector('#timer-caption');
const timerCard = document.querySelector('.timer-card');
const stakeInput = document.querySelector('#stake');
const pickForm = document.querySelector('#pick-form');
const submitPickButton = document.querySelector('#submit-pick');
const pickMessage = document.querySelector('#pick-message');
const historyRows = document.querySelector('#history-rows');
const historyCount = document.querySelector('#history-count');
const resultBanner = document.querySelector('#result-banner');
const resultTitle = document.querySelector('#result-title');
const resultDetail = document.querySelector('#result-detail');
const durationSelect = document.querySelector('#duration');
const pauseToggle = document.querySelector('#pause-toggle');
const activityCopy = document.querySelector('#activity-copy');

const numberFormat = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
let balance = 1000;
let roundId = 1842;
let duration = Number(durationSelect.value);
let timeLeft = duration;
let paused = false;
let selectedColor = '';
let currentPick = null;
let completedRounds = [];

function formatCredits(amount) {
  return numberFormat.format(amount);
}

function updateBalance() {
  balanceOutput.innerHTML = `${formatCredits(balance)} <small>credits</small>`;
  availableBalanceOutput.textContent = formatCredits(balance);
  stakeInput.max = String(Math.min(500, balance));
  if (Number(stakeInput.value) > balance) {
    stakeInput.value = String(Math.max(10, Math.floor(balance / 10) * 10));
  }
}

function updateRoundDisplay() {
  roundOutput.textContent = `#${String(roundId).padStart(5, '0')}`;
  countdownOutput.textContent = `00:${String(timeLeft).padStart(2, '0')}`;
  roundStatusOutput.textContent = paused ? 'Rounds paused' : 'Accepting demo picks';
  timerCaption.textContent = paused ? 'Timer is paused' : 'Next result in';
  timerCard.classList.toggle('paused', paused);
  activityCopy.textContent = paused ? 'Rounds are paused' : 'Rounds are running';
  pauseToggle.setAttribute('aria-checked', String(!paused));
  updatePickForm();
}

function updatePickForm() {
  const amount = Number(stakeInput.value);
  const validAmount = Number.isInteger(amount) && amount >= 10 && amount <= 500 && amount <= balance;
  const canPick = !paused && !currentPick && timeLeft > 0;

  colorButtons.forEach((button) => {
    const isSelected = button.dataset.color === selectedColor;
    button.classList.toggle('selected', isSelected);
    button.setAttribute('aria-pressed', String(isSelected));
    button.disabled = !canPick;
  });

  submitPickButton.disabled = !canPick || !selectedColor || !validAmount;
  if (paused) {
    pickMessage.textContent = 'Rounds are paused. Resume to make a demo pick.';
  } else if (currentPick) {
    pickMessage.textContent = `Your ${currentPick.color.toLowerCase()} pick is locked for this round.`;
  } else if (!selectedColor) {
    pickMessage.textContent = 'Choose a color to continue.';
  } else if (!validAmount) {
    pickMessage.textContent = 'Enter 10–500 credits, up to your available balance.';
  } else {
    submitPickButton.innerHTML = `Pick ${selectedColor} <span>→</span>`;
    pickMessage.textContent = `Selected: ${selectedColor}.`;
  }

  if (currentPick || !selectedColor) {
    submitPickButton.innerHTML = 'Choose a color <span>→</span>';
  }
}

function renderHistory() {
  historyCount.textContent = `${completedRounds.length} ${completedRounds.length === 1 ? 'result' : 'results'}`;
  if (!completedRounds.length) {
    historyRows.innerHTML = '<tr class="empty-row"><td colspan="4">No rounds completed yet. Results will appear here.</td></tr>';
    return;
  }

  historyRows.innerHTML = completedRounds.map((round) => {
    const resultClass = round.result.toLowerCase();
    const pickMarkup = round.pick
      ? `<span class="table-color ${round.pick.color.toLowerCase()}"><i></i>${round.pick.color}</span>`
      : '<span class="outcome-none">—</span>';
    let outcome = '<span class="outcome-none">No pick</span>';
    if (round.pick) {
      outcome = round.won
        ? `<span class="outcome-win">Won +${formatCredits(round.pick.stake * 2)}</span>`
        : '<span class="outcome-loss">Not matched</span>';
    }

    return `<tr>
      <td class="round-cell">#${String(round.id).padStart(5, '0')}</td>
      <td><span class="table-color ${resultClass}"><i></i>${round.result}</span></td>
      <td>${pickMarkup}</td>
      <td>${outcome}</td>
    </tr>`;
  }).join('');
}

function randomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

function settleRound() {
  const result = randomColor();
  const pick = currentPick;
  const won = Boolean(pick && pick.color === result);

  if (won) {
    balance += pick.stake * 3;
    updateBalance();
  }

  completedRounds.unshift({ id: roundId, result, pick, won });
  completedRounds = completedRounds.slice(0, 8);
  renderHistory();

  resultTitle.textContent = `Round #${String(roundId).padStart(5, '0')} result: ${result}`;
  if (!pick) {
    resultDetail.textContent = 'No pick was placed this round. All colors had an equal chance.';
  } else if (won) {
    resultDetail.textContent = `Your ${pick.color} pick matched. 3× total return added to your demo balance.`;
  } else {
    resultDetail.textContent = `Your ${pick.color} pick did not match. This was a virtual-credit simulation only.`;
  }
  resultBanner.hidden = false;

  currentPick = null;
  selectedColor = '';
  roundId += 1;
  timeLeft = duration;
  updateRoundDisplay();
}

colorButtons.forEach((button) => {
  button.addEventListener('click', () => {
    selectedColor = button.dataset.color;
    updatePickForm();
  });
});

document.querySelectorAll('.amount-chip').forEach((button) => {
  button.addEventListener('click', () => {
    const currentAmount = Number(stakeInput.value) || 0;
    const newAmount = currentAmount + Number(button.dataset.amount);
    stakeInput.value = String(Math.min(500, balance, newAmount));
    updatePickForm();
  });
});

stakeInput.addEventListener('input', updatePickForm);

pickForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const stake = Number(stakeInput.value);
  if (paused || currentPick || !selectedColor || !Number.isInteger(stake) || stake < 10 || stake > 500 || stake > balance) {
    updatePickForm();
    return;
  }

  currentPick = { color: selectedColor, stake };
  balance -= stake;
  updateBalance();
  updatePickForm();
});

durationSelect.addEventListener('change', () => {
  duration = Number(durationSelect.value);
});

pauseToggle.addEventListener('click', () => {
  paused = !paused;
  updateRoundDisplay();
});

document.querySelector('#reset-demo').addEventListener('click', () => {
  const confirmed = window.confirm('Reset your demo balance to 1,000 credits and clear local round history?');
  if (!confirmed) return;

  balance = 1000;
  currentPick = null;
  selectedColor = '';
  completedRounds = [];
  roundId = 1842;
  timeLeft = duration;
  paused = false;
  resultBanner.hidden = true;
  updateBalance();
  renderHistory();
  updateRoundDisplay();
});

updateBalance();
renderHistory();
updateRoundDisplay();
window.setInterval(() => {
  if (paused) return;
  timeLeft -= 1;
  if (timeLeft <= 0) {
    settleRound();
  } else {
    updateRoundDisplay();
  }
}, 1000);

let installPrompt = null;
const installButton = document.querySelector('#install-app');

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  installPrompt = event;
  installButton.hidden = false;
});

installButton.addEventListener('click', async () => {
  if (!installPrompt) return;
  try {
    await installPrompt.prompt();
    await installPrompt.userChoice;
  } catch (error) {
    console.error('Could not show the install prompt.', error);
  } finally {
    installPrompt = null;
    installButton.hidden = true;
  }
});

window.addEventListener('appinstalled', () => {
  installPrompt = null;
  installButton.hidden = true;
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((error) => {
      console.error('Offline support could not be enabled.', error);
    });
  });
}
