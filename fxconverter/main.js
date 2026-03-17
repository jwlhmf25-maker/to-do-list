/* 환율 변환기 메인 스크립트 */

var API_BASE = 'https://api.exchangerate-api.com/v4/latest/';

/* 통화 기호 매핑 */
var 통화기호 = {
  USD: '$',
  EUR: '€',
  KRW: '₩',
  JPY: '¥'
};

/* 숫자에 천 단위 구분자 추가 */
function 숫자포맷(num) {
  return num.toLocaleString('ko-KR', { maximumFractionDigits: 4 });
}

/* 결과 영역에 메시지 표시 */
function 결과표시(텍스트, 오류여부) {
  var resultEl = document.getElementById('result');
  resultEl.textContent = 텍스트;
  resultEl.classList.remove('hidden', 'error');
  if (오류여부) {
    resultEl.classList.add('error');
  }
}

/* 환율 API 호출 및 변환 처리 */
function 환율변환() {
  var amount = parseFloat(document.getElementById('amount').value);
  var from = document.getElementById('from').value;
  var to = document.getElementById('to').value;

  /* 금액 유효성 검사 */
  if (isNaN(amount) || amount <= 0) {
    결과표시('올바른 금액을 입력해 주세요.', true);
    return;
  }

  /* 같은 통화 선택 시 처리 */
  if (from === to) {
    결과표시(
      숫자포맷(amount) + ' ' + from + ' = ' + 숫자포맷(amount) + ' ' + to,
      false
    );
    return;
  }

  /* 버튼 비활성화 (중복 요청 방지) */
  var btn = document.getElementById('convertBtn');
  btn.disabled = true;
  btn.textContent = '변환 중...';

  /* API 호출 */
  fetch(API_BASE + from)
    .then(function(response) {
      if (!response.ok) {
        throw new Error('API 응답 오류');
      }
      return response.json();
    })
    .then(function(data) {
      var rate = data.rates[to];
      if (!rate) {
        throw new Error('환율 정보를 찾을 수 없습니다.');
      }
      var converted = amount * rate;
      결과표시(
        숫자포맷(amount) + ' ' + from +
        ' = ' +
        통화기호[to] + 숫자포맷(converted) + ' ' + to,
        false
      );
    })
    .catch(function(err) {
      결과표시('환율 정보를 불러오지 못했습니다.', true);
    })
    .finally(function() {
      /* 버튼 복원 */
      btn.disabled = false;
      btn.textContent = '통화 변환';
    });
}

/* From과 To 통화를 교환하고 금액이 있으면 자동 변환 */
function 통화교환() {
  var fromEl = document.getElementById('from');
  var toEl = document.getElementById('to');
  var temp = fromEl.value;
  fromEl.value = toEl.value;
  toEl.value = temp;

  /* 금액이 입력되어 있으면 교환 후 자동 변환 실행 */
  var amount = document.getElementById('amount').value;
  if (amount !== '') {
    환율변환();
  }
}

/* 앱 초기화 */
function initApp() {
  document.getElementById('convertBtn').addEventListener('click', 환율변환);
  document.getElementById('swap-btn').addEventListener('click', 통화교환);
}

initApp();
