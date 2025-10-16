(function(){
  // Elements
  var form = document.querySelector('.task-form');
  var input = document.getElementById('task-input');
  var list = document.querySelector('.task-list');
  var header = document.querySelector('.app-header');
  var topArea = document.getElementById('top-area');
  var listArea = document.querySelector('.main-content');
  var pagination = document.getElementById('pagination');

  // State
  var tasks = [];
  var pageSize = 6;
  var currentPage = 1;
  var sortOrder = 'newest';
  var sortSelect = document.getElementById('sort-select');
  if (sortSelect){ sortOrder = sortSelect.value || 'newest'; sortSelect.addEventListener('change', function(e){ sortOrder = e.target.value; currentPage = 1; render(); }); }

  // Utilities
  function createId(){ return Date.now().toString(36) + '-' + Math.floor(Math.random()*10000).toString(36); }
  function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

  // Format timestamp to dd/mm/yy
  function formatDate(ts){
    var d = new Date(ts);
    var dd = String(d.getDate()).padStart(2,'0');
    var mm = String(d.getMonth() + 1).padStart(2,'0');
    var yy = String(d.getFullYear()).slice(-2);
    return dd + '/' + mm + '/' + yy;
  }

  function getTotalPages(){ return Math.max(1, Math.ceil((tasks && tasks.length ? tasks.length : 0) / pageSize)); }

  function seedInitialTasks(){
    if (tasks && tasks.length) return;
    var samples = [
      'Buy groceries for the week',
      'Schedule annual health checkup',
      'Call the bank about new card',
      'Water the indoor plants',
      'Plan weekend hiking route',
      'Review monthly budget',
      'Clean out email inbox',
      'Back up phone photos',
      'Read 20 pages of a book',
      'Prep lunches for tomorrow',
      'Organize workspace drawer',
      'Pay electricity bill',
      'Practice 15 minutes of piano',
      'Refill reusable water bottle',
      'Take a 20-minute walk',
      'Update password manager',
      'Write thank-you note',
      'Stretch for 10 minutes',
      'Check smoke detector batteries',
      'Declutter downloads folder'
    ];

    var used = {};
    var count = 5;
    for (var i = 0; i < count; i++){
      var pick;
      do {
        pick = samples[Math.floor(Math.random() * samples.length)];
      } while (used[pick]);
      used[pick] = true;
      // Stagger createdAt slightly so seeded tasks have different dates
      tasks.push({ id: createId(), text: pick, completed: false, createdAt: Date.now() - (i * 1000) });
    }
  }

  // Render pagination controls
  function renderPagination(){
    if (!pagination) return;
    pagination.innerHTML = '';

    var total = tasks.length;
    var totalPages = getTotalPages();

    if (total <= pageSize){
      return; // no controls when not needed
    }

    // Prev
    var prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'pager-button pager-prev' + (currentPage === 1 ? ' is-disabled' : '');
    prev.setAttribute('aria-label','Previous page');
    prev.textContent = 'Prev';
    prev.dataset.page = String(currentPage - 1);
    pagination.appendChild(prev);

    // Page numbers (simple: 1..totalPages)
    for (var p = 1; p <= totalPages; p++){
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pager-button' + (p === currentPage ? ' is-active' : '');
      btn.textContent = String(p);
      btn.setAttribute('aria-label','Go to page ' + p);
      btn.dataset.page = String(p);
      pagination.appendChild(btn);
    }

    // Next
    var next = document.createElement('button');
    next.type = 'button';
    next.className = 'pager-button pager-next' + (currentPage === totalPages ? ' is-disabled' : '');
    next.setAttribute('aria-label','Next page');
    next.textContent = 'Next';
    next.dataset.page = String(currentPage + 1);
    pagination.appendChild(next);
  }

  // Render list or empty state (for current page)
  function render(){
    // clear
    list.innerHTML = '';

    // Robustly determine open tasks: support boolean or string values for `completed`
    var openCount = tasks.filter(function(t){
      var completed = (t.completed === true || t.completed === 'true');
      return !completed;
    }).length;
    var countEl = document.getElementById('open-count');
    if (countEl) countEl.textContent = '(' + openCount + ')';

    if (!tasks || tasks.length === 0){
      if (pagination) pagination.innerHTML = '';
      var empty = document.createElement('li');
      empty.className = 'task-empty';
      empty.setAttribute('aria-live','polite');
      empty.textContent = 'No tasks, congrats!';
      list.appendChild(empty);
      updateOffsets();
      return;
    }

    var totalPages = getTotalPages();
    currentPage = clamp(currentPage, 1, totalPages);
    var start = (currentPage - 1) * pageSize;
    var end = start + pageSize;

    // Apply sorting by createdAt before paginating
    var sortedTasks = (tasks && tasks.length) ? tasks.slice().sort(function(a,b){ return sortOrder === 'newest' ? (b.createdAt - a.createdAt) : (a.createdAt - b.createdAt); }) : [];
    sortedTasks.slice(start, end).forEach(function(task){
      var li = document.createElement('li');
      li.className = 'task-item';
      li.setAttribute('data-id', task.id);

      var left = document.createElement('div');
      left.className = 'task-left';

      var radio = document.createElement('div');
      radio.className = 'task-radio' + (task.completed ? ' task-radio--checked' : '');
      radio.setAttribute('role','checkbox');
      radio.setAttribute('aria-checked', task.completed ? 'true' : 'false');
      radio.setAttribute('tabindex','0');
      radio.dataset.id = task.id;

      var content = document.createElement('div');
      content.className = 'task-content';

      var txt = document.createElement('div');
      txt.className = 'task-text' + (task.completed ? ' task-text--completed' : '');
      txt.textContent = task.text;

      var dateEl = document.createElement('div');
      dateEl.className = 'task-date';
      dateEl.textContent = formatDate(task.createdAt);

      content.appendChild(txt);
      content.appendChild(dateEl);

      left.appendChild(radio);
      left.appendChild(content);

      var del = document.createElement('button');
      del.className = 'delete-button';
      del.type = 'button';
      del.dataset.id = task.id;
      del.setAttribute('aria-label','Delete task: ' + task.text);
      del.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6L18 18M6 18L18 6" stroke="#000" stroke-width="2" stroke-linecap="round"/></svg>';

      li.appendChild(left);
      li.appendChild(del);
      list.appendChild(li);
    });

    renderPagination();
    updateOffsets();
  }

  // Add task
  if (form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var val = (input.value || '').trim();
      var err = document.getElementById('task-error');
      if (!val){ if (err) { err.textContent = 'Please enter a task.'; } input.focus(); return; }
      if (err) err.textContent = '';

      tasks.unshift({ id: createId(), text: val, completed: false, createdAt: Date.now() });
      input.value = '';
      currentPage = 1; // show newest on first page
      render();
    });
  }

  // Delegate clicks (delete, toggle)
  list.addEventListener('click', function(e){
    var btn = e.target.closest('.delete-button');
    if (btn){
      var id = btn.dataset.id;
      tasks = tasks.filter(function(t){ return t.id !== id; });
      var totalPages = getTotalPages();
      currentPage = clamp(currentPage, 1, totalPages);
      render();
      return;
    }

    var radio = e.target.closest('.task-radio');
    if (radio){
      var id2 = radio.dataset.id;
      tasks = tasks.map(function(t){ if (t.id === id2){ var currently = (t.completed === true || t.completed === 'true'); return { id: t.id, text: t.text, completed: !currently, createdAt: t.createdAt }; } return t; });
      render();
      return;
    }
  });

  // Pagination click handling
  if (pagination){
    pagination.addEventListener('click', function(e){
      var btn = e.target.closest('.pager-button');
      if (!btn || btn.classList.contains('is-disabled')) return;
      var page = parseInt(btn.dataset.page, 10);
      if (!isNaN(page)){
        var totalPages = getTotalPages();
        currentPage = clamp(page, 1, totalPages);
        render();
      }
    });
  }

  // Keyboard toggle for radios
  list.addEventListener('keydown', function(e){
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('task-radio')){
      e.preventDefault(); e.target.click();
    }
  });

  // Layout: compute header and top-area heights and set top and padding
  function updateOffsets(){
    if (!header || !topArea || !listArea) return;
    var headerH = Math.ceil(header.getBoundingClientRect().height);
    topArea.style.top = headerH + 'px';
    var topH = Math.ceil(topArea.getBoundingClientRect().height);
    listArea.style.paddingTop = (headerH + topH) + 'px';
  }

  // Run offsets on load/resize and after fonts ready
  function init(){
    seedInitialTasks();
    render();
    setTimeout(updateOffsets, 50);
    window.addEventListener('resize', function(){ setTimeout(updateOffsets, 50); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ setTimeout(updateOffsets, 50); });
  }

  init();
})();
