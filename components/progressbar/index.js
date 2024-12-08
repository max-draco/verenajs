import progressbarStyles from './progressbar.module.css';

function createProgressBar(progress) {
  const progressBar = document.createElement('div');
  progressBar.className = progressbarStyles.progressBar;

  const progressFill = document.createElement('div');
  progressFill.className = progressbarStyles.progressFill;
  progressFill.style.width = `${progress}%`;

  progressBar.appendChild(progressFill);
  document.body.appendChild(progressBar);
}

export default createProgressBar;
