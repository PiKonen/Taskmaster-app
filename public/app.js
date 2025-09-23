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

  function render(){
    while(list.firstChild){
      list.removeChild(list.firstChild);
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

  // Start with default tasks matching Figma design
  tasks = [
    { id: createId(), text: 'Lorem ipsum dolor sit amet ja sitä rataaa. miten kasvaa?\nJaksaako, jaksaa', completed: false },
    { id: createId(), text: 'Default', completed: false },
    { id: createId(), text: 'Default', completed: false },
    { id: createId(), text: 'Default', completed: false },
    { id: createId(), text: 'Default', completed: false }
  ];
  render();
})();
