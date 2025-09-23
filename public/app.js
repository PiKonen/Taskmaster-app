(function(){
  // Elements
  var form = document.querySelector('.task-form');
  var input = document.getElementById('task-input');
  var list = document.querySelector('.task-list');
  var header = document.querySelector('.app-header');
  var topArea = document.getElementById('top-area');
  var listArea = document.getElementById('list-area');

  // State
  var tasks = [];

  // Utilities
  function createId(){ return Date.now().toString(36) + '-' + Math.floor(Math.random()*10000).toString(36); }

  // Render list or empty state
  function render(){
    // clear
    list.innerHTML = '';

    if (!tasks || tasks.length === 0){
      var empty = document.createElement('li');
      empty.className = 'task-empty';
      empty.setAttribute('aria-live','polite');
      empty.textContent = 'No tasks, congrats!';
      list.appendChild(empty);
      updateOffsets();
      return;
    }

    tasks.forEach(function(task){
      var li = document.createElement('li');
      li.className = 'task-item';
      li.setAttribute('data-id', task.id);

      var left = document.createElement('div');
      left.className = 'task-left';

      var radio = document.createElement('div');
      radio.className = 'task-radio';
      radio.setAttribute('role','checkbox');
      radio.setAttribute('aria-checked', task.completed ? 'true' : 'false');
      radio.setAttribute('tabindex','0');
      radio.dataset.id = task.id;
      if (task.completed){
        radio.style.background = 'var(--brand)';
        radio.style.borderColor = 'var(--brand)';
      }

      var txt = document.createElement('div');
      txt.className = 'task-text';
      txt.textContent = task.text;
      if (task.completed){ txt.style.textDecoration = 'line-through'; txt.style.opacity = '0.6'; }

      left.appendChild(radio);
      left.appendChild(txt);

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

    updateOffsets();
  }

  // Add task
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var val = (input.value || '').trim();
    var err = document.getElementById('task-error');
    if (!val){ if (err) { err.textContent = 'Please enter a task.'; } input.focus(); return; }
    if (err) err.textContent = '';

    tasks.unshift({ id: createId(), text: val, completed: false });
    input.value = '';
    render();
  });

  // Delegate clicks (delete, toggle)
  list.addEventListener('click', function(e){
    var btn = e.target.closest('.delete-button');
    if (btn){
      var id = btn.dataset.id;
      tasks = tasks.filter(function(t){ return t.id !== id; });
      render();
      return;
    }

    var radio = e.target.closest('.task-radio');
    if (radio){
      var id = radio.dataset.id;
      tasks = tasks.map(function(t){ if (t.id === id) return { id: t.id, text: t.text, completed: !t.completed }; return t; });
      render();
      return;
    }
  });

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
    // ensure topArea uses natural height (temporarily static) to measure
    topArea.style.position = 'fixed';
    topArea.style.left = '50%';
    topArea.style.transform = 'translateX(-50%)';
    // set top to header height
    topArea.style.top = headerH + 'px';
    // measure top area height
    var topH = Math.ceil(topArea.getBoundingClientRect().height);
    // set listArea padding top to header+top heights so list appears below
    listArea.style.paddingTop = (headerH + topH) + 'px';
  }

  // Run offsets on load/resize and after fonts ready
  function init(){
    render();
    // small delay to allow layout
    setTimeout(updateOffsets, 50);
    window.addEventListener('resize', function(){ setTimeout(updateOffsets, 50); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ setTimeout(updateOffsets, 50); });
  }

  init();
})();
