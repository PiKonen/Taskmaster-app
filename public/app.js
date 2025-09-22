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
      var taskText = document.createElement('p');
      taskText.className = 'task-text';
      taskText.textContent = task.text;
      if (task.completed) {
        taskText.style.textDecoration = 'line-through';
        taskText.style.opacity = '0.6';
      }

      radioGroup.appendChild(radioButton);
      radioGroup.appendChild(taskText);

      // Create delete button with icon
      var deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-button';
      deleteBtn.type = 'button';
      deleteBtn.setAttribute('data-id', task.id);
      deleteBtn.setAttribute('aria-label', 'Delete task: ' + task.text);
      
      // Add delete icon SVG
      deleteBtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 5H9L2 12L9 19H20C20.5304 19 21.0391 18.7893 21.4142 18.4142C21.7893 18.0391 22 17.5304 22 17V7C22 6.46957 21.7893 5.96086 21.4142 5.58579C21.0391 5.21071 20.5304 5 20 5Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M18 9L12 15" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 9L18 15" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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

  // Initialize with some sample tasks for demonstration (optional)
  // Uncomment the lines below to show sample tasks on page load
  /*
  tasks = [
    { id: createId(), text: 'Sample task 1', completed: false },
    { id: createId(), text: 'Sample task 2', completed: true },
    { id: createId(), text: 'Sample task 3', completed: false }
  ];
  render();
  */
})();
