(function(){
  var form=document.querySelector('.task-form');
  var input=document.querySelector('.task-input');
  var list=document.querySelector('.task-list');
  var tasks=[];
  var idSeq=0;

  function createId(){
    idSeq+=1;return Date.now().toString(36)+'-'+idSeq.toString(36);
  }

  function render(){
    while(list.firstChild){list.removeChild(list.firstChild);} 
    for(var i=0;i<tasks.length;i++){
      var t=tasks[i];
      var li=document.createElement('li');
      li.className='task-item';
      li.setAttribute('data-id',t.id);

      var p=document.createElement('p');
      p.className='task-text';
      p.textContent=t.text;

      var btn=document.createElement('button');
      btn.className='delete-button';
      btn.type='button';
      btn.setAttribute('data-id',t.id);
      btn.textContent='Delete';

      li.appendChild(p);li.appendChild(btn);
      list.appendChild(li);
    }
  }

  form.addEventListener('submit',function(e){
    e.preventDefault();
    var text=(input.value||'').trim();
    if(!text){return;}
    var newTask={id:createId(),text:text};
    tasks.unshift(newTask);
    input.value='';
    input.focus();
    render();
  });

  list.addEventListener('click',function(e){
    var target=e.target;
    if(target && target.classList.contains('delete-button')){
      var id=target.getAttribute('data-id');
      tasks=tasks.filter(function(t){return t.id!==id;});
      render();
    }
  });
})();
