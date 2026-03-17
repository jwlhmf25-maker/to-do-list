/* 카운터 앱 진입점 */
function initApp() {
  // 현재 카운트 값
  var count = 0;

  // DOM 요소 참조
  var countEl = document.getElementById('count');
  var btnIncrease = document.getElementById('btn-increase');
  var btnDecrease = document.getElementById('btn-decrease');
  var btnReset = document.getElementById('btn-reset');

  // 화면에 숫자를 갱신하고 짧은 애니메이션을 실행하는 함수
  function updateDisplay() {
    countEl.textContent = count;

    // bump 클래스를 붙였다가 제거해 크기 변화 효과
    countEl.classList.remove('bump');
    // 브라우저가 클래스 제거를 인식한 뒤 다시 추가
    void countEl.offsetWidth;
    countEl.classList.add('bump');

    // 부호에 따라 색상 클래스 적용
    countEl.classList.remove('positive', 'negative');
    if (count > 0) countEl.classList.add('positive');
    else if (count < 0) countEl.classList.add('negative');
  }

  // 증가 버튼 클릭 이벤트
  btnIncrease.addEventListener('click', function () {
    count += 1;
    updateDisplay();
  });

  // 감소 버튼 클릭 이벤트
  btnDecrease.addEventListener('click', function () {
    count -= 1;
    updateDisplay();
  });

  // 리셋 버튼 클릭 이벤트
  btnReset.addEventListener('click', function () {
    count = 0;
    updateDisplay();
  });
}

// 앱 초기화
initApp();
