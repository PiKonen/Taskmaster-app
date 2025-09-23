(function(){
  var form = document.querySelector('.task-form');
  var input = document.querySelector('.task-input');
  var list = document.querySelector('.task-list');
  var tasks = [];
  var idSeq = 0;

  function createId(){
    idSeq += 1;
    return Date.now().toString(36) + '-' + idSeq.toString(36);
  }

  function updateListOffset(){
    var header = document.querySelector('.app-header');
    var topArea = document.getElementById('top-area');
    var listArea = document.getElementById('list-area');
    var offset = 0;
    if (header) offset += Math.ceil(header.getBoundingClientRect().height);
    if (topArea) offset += Math.ceil(topArea.getBoundingClientRect().height);
    if (listArea) listArea.style.paddingTop = offset + 'px';
  }

  function render(){
    while(list.firstChild){
      list.removeChild(list.firstChild);
    }

    // Empty state
    if (!tasks || tasks.length === 0) {
      var emptyLi = document.createElement('li');
      emptyLi.className = 'task-empty';
      emptyLi.setAttribute('aria-live', 'polite');
      emptyLi.style.padding = '20px 0';
      emptyLi.style.textAlign = 'center';
      emptyLi.style.color = 'var(--light-text)';
      emptyLi.style.width = '100%';

      var emptyText = document.createElement('div');
      emptyText.textContent = 'No tasks, congrats!';
      emptyText.style.fontFamily = "DM Sans, -apple-system, Roboto, Helvetica, sans-serif";
      emptyText.style.fontSize = '16px';
      emptyText.style.color = '#3D4147';

      emptyLi.appendChild(emptyText);
      list.appendChild(emptyLi);
      updateListOffset();
      return;
    }

    for(var i = 0; i < tasks.length; i++){
      var task = tasks[i];
      var li = document.createElement('li');
      li.className = 'task-item';
      li.setAttribute('data-id', task.id);

      // Create radio button group
      var radioGroup = document.createElement('div');
      radioGroup.className = 'task-radio-group';

      // Create radio button (styled as circle)
      var radioButton = document.createElement('div');
      radioButton.className = 'task-radio';
      radioButton.setAttribute('role', 'checkbox');
      radioButton.setAttribute('aria-checked', task.completed ? 'true' : 'false');
      radioButton.setAttribute('tabindex', '0');
      radioButton.setAttribute('data-id', task.id);

      if (task.completed) {
        radioButton.classList.add('checked');
      }

      // Create task text
      var taskText = document.createElement('div');
      taskText.className = 'task-text';
      taskText.textContent = task.text;
      if (task.completed) {
        taskText.style.textDecoration = 'line-through';
        taskText.style.opacity = '0.6';
      }

      radioGroup.appendChild(radioButton);
      radioGroup.appendChild(taskText);

      // Create delete button with X icon matching Figma design
      var deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-button';
      deleteBtn.type = 'button';
      deleteBtn.setAttribute('data-id', task.id);
      deleteBtn.setAttribute('aria-label', 'Delete task: ' + task.text);

      // Add delete icon SVG from Figma design
      deleteBtn.innerHTML = `
        <svg width="35" height="35" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M26.25 13.125L17.5 21.875" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M17.5 13.125L26.25 21.875" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;

      li.appendChild(radioGroup);
      li.appendChild(deleteBtn);
      list.appendChild(li);
    }
    updateListOffset();
  }

  // Handle form submission
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var text = (input.value || '').trim();
    var errorEl = document.getElementById('task-error');

    if (!text) {
      if (errorEl) {
        errorEl.textContent = 'Please enter a task.';
      }
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }

    if (errorEl) {
      errorEl.textContent = '';
    }
    input.removeAttribute('aria-invalid');

    var newTask = {
      id: createId(),
      text: text,
      completed: false
    };
    tasks.unshift(newTask);
    input.value = '';
    input.focus();
    render();
  });

  // Handle task interactions (delete and toggle)
  list.addEventListener('click', function(e){
    var target = e.target;
    var button = target.closest('button');
    var radio = target.closest('.task-radio');

    // Handle delete button clicks
    if (button && button.classList.contains('delete-button')) {
      var id = button.getAttribute('data-id');
      tasks = tasks.filter(function(task) {
        return task.id !== id;
      });
      render();
      return;
    }

    // Handle radio button clicks (toggle completion)
    if (radio) {
      var id = radio.getAttribute('data-id');
      tasks = tasks.map(function(task) {
        if (task.id === id) {
          return {
            id: task.id,
            text: task.text,
            completed: !task.completed
          };
        }
        return task;
      });
      render();
      return;
    }
  });

  // Handle keyboard navigation for radio buttons
  list.addEventListener('keydown', function(e) {
    var target = e.target;

    if (target.classList.contains('task-radio') && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      target.click();
    }
  });

  // Start with no tasks; show empty state
  tasks = [];
  render();

  // Set initial list offset and update on resize
  function initOffsets(){
    // Call on next tick to ensure styles applied
    setTimeout(updateListOffset, 50);
    window.addEventListener('resize', updateListOffset);
    // Also update when fonts load (font may change layout)
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(updateListOffset);
    }
  }

  initOffsets();
})();
