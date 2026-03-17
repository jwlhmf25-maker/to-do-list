/* 할 일 목록 앱 진입점 */
function initApp() {
  var STORAGE_KEY = 'my-todos';

  /* DOM 요소 참조 */
  var inputEl      = document.querySelector('.input');
  var btnAdd       = document.querySelector('.btn-add');
  var listEl       = document.querySelector('.todo-list');
  var statTotal    = document.querySelector('.stat-total strong');
  var statDone     = document.querySelector('.stat-done strong');
  var filterBtns   = document.querySelectorAll('.btn-filter');
  var btnClear     = document.querySelector('.btn-clear');

  /* ── LocalStorage 헬퍼 ── */

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  /* ── 상태 초기화 ── */
  var todos      = load();
  var currentFilter = 'all'; /* 현재 선택된 필터 */
  var nextId = todos.reduce(function (max, t) {
    return t.id > max ? t.id : max;
  }, 0) + 1;

  /* ── 필터링 ── */

  /* 현재 필터에 맞는 항목만 반환 */
  function getFiltered() {
    if (currentFilter === 'active') {
      return todos.filter(function (t) { return !t.done; });
    }
    if (currentFilter === 'done') {
      return todos.filter(function (t) { return t.done; });
    }
    return todos;
  }

  /* ── 렌더링 ── */

  /* 통계 및 일괄 삭제 버튼 상태 갱신 */
  function updateStats() {
    var doneCount = todos.filter(function (t) { return t.done; }).length;
    statTotal.textContent = todos.length;
    statDone.textContent  = doneCount;

    /* 완료 항목이 없으면 일괄 삭제 버튼 비활성화 */
    btnClear.disabled = doneCount === 0;
  }

  /* 필터 버튼 활성 상태 갱신 */
  function updateFilterUI() {
    filterBtns.forEach(function (btn) {
      if (btn.dataset.filter === currentFilter) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  /* 목록 전체 재렌더링 */
  function render() {
    listEl.innerHTML = '';

    var filtered = getFiltered();

    filtered.forEach(function (todo) {
      var li = document.createElement('li');
      if (todo.done) li.classList.add('done');

      /* 체크박스 */
      var checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'todo-checkbox';
      checkbox.checked = todo.done;
      checkbox.addEventListener('change', function () {
        toggle(todo.id);
      });

      /* 텍스트 */
      var span = document.createElement('span');
      span.className = 'todo-text';
      span.textContent = todo.text;

      /* 삭제 버튼 */
      var btnDelete = document.createElement('button');
      btnDelete.className = 'btn-delete';
      btnDelete.textContent = '삭제';
      btnDelete.addEventListener('click', function () {
        remove(todo.id);
      });

      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(btnDelete);
      listEl.appendChild(li);
    });

    updateStats();
    updateFilterUI();
  }

  /* ── CRUD 함수 ── */

  /* 할 일 추가 */
  function addTodo() {
    var text = inputEl.value.trim();

    /* 빈 값 검사 */
    if (!text) {
      alert('할 일을 입력하세요');
      inputEl.focus();
      return;
    }

    /* 중복 검사 */
    var isDuplicate = todos.some(function (t) {
      return t.text === text;
    });
    if (isDuplicate) {
      alert('이미 등록된 할 일입니다');
      inputEl.select();
      return;
    }

    todos.push({ id: nextId++, text: text, done: false });
    save();
    inputEl.value = '';
    inputEl.focus();
    render();
  }

  /* 완료/미완료 토글 */
  function toggle(id) {
    todos.forEach(function (todo) {
      if (todo.id === id) todo.done = !todo.done;
    });
    save();
    render();
  }

  /* 항목 삭제 */
  function remove(id) {
    todos = todos.filter(function (todo) {
      return todo.id !== id;
    });
    save();
    render();
  }

  /* 완료 항목 일괄 삭제 */
  function clearDone() {
    todos = todos.filter(function (t) { return !t.done; });
    save();
    render();
  }

  /* ── 이벤트 바인딩 ── */

  /* 추가 버튼 클릭 */
  btnAdd.addEventListener('click', addTodo);

  /* Enter 키로 추가 */
  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') addTodo();
  });

  /* 필터 버튼 클릭 */
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  /* 완료 항목 일괄 삭제 버튼 */
  btnClear.addEventListener('click', clearDone);

  /* 초기 렌더링 */
  render();
}

/* 앱 초기화 */
initApp();
