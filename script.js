document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    const themeToggle = document.getElementById('theme-toggle');

    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let currentTheme = localStorage.getItem('theme') || 'light';

    const saveTodos = () => {
        localStorage.setItem('todos', JSON.stringify(todos));
    };

    const saveTheme = () => {
        localStorage.setItem('theme', currentTheme);
    };

    const applyTheme = () => {
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(`${currentTheme}-theme`);
    };

    const filterTodos = (filter) => {
        let filteredTodos = todos;
        if (filter === 'active') {
            filteredTodos = todos.filter(todo => !todo.completed);
        } else if (filter === 'completed') {
            filteredTodos = todos.filter(todo => todo.completed);
        }
        renderTodos(filteredTodos);
    };

    const renderTodos = (todosToRender = todos) => {
        todoList.innerHTML = '';
        todosToRender.forEach((todo) => {
            const originalIndex = todos.indexOf(todo);
            const todoItem = document.createElement('li');
            todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            todoItem.setAttribute('data-index', originalIndex);
            todoItem.setAttribute('draggable', true);

            todoItem.innerHTML = `
                <input type="checkbox" ${todo.completed ? 'checked' : ''}>
                <span>${todo.text}</span>
                <button class="edit-btn">✏️</button>
                <button class="delete-btn">🗑️</button>
            `;

            todoList.appendChild(todoItem);
        });
    };

    const addTodo = (text) => {
        todos.push({ text, completed: false });
        saveTodos();
        renderTodos();
    };

    const toggleTodo = (index) => {
        todos[index].completed = !todos[index].completed;
        saveTodos();
        renderTodos();
    };

    const deleteTodo = (index) => {
        todos.splice(index, 1);
        saveTodos();
        filterTodos(currentFilter);
    };

    const editTodo = (index, newText) => {
        todos[index].text = newText;
        saveTodos();
        filterTodos(currentFilter);
    };

    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newTodoText = todoInput.value.trim();
        if (newTodoText) {
            addTodo(newTodoText);
            todoInput.value = '';
        }
    });

    todoList.addEventListener('click', (e) => {
        const target = e.target;
        const todoItem = target.closest('.todo-item');
        if (!todoItem) return;

        const index = parseInt(todoItem.dataset.index, 10);

        if (target.type === 'checkbox') {
            toggleTodo(index);
        } else if (target.classList.contains('delete-btn')) {
            deleteTodo(index);
        } else if (target.classList.contains('edit-btn')) {
            const span = todoItem.querySelector('span');
            const newText = prompt('Edit your todo:', span.textContent);
            if (newText !== null && newText.trim() !== '') {
                editTodo(index, newText.trim());
            }
        }
    });

    let dragStartIndex;

    const dragStart = (e) => {
        dragStartIndex = +e.target.closest('.todo-item').getAttribute('data-index');
    };

    const dragOver = (e) => {
        e.preventDefault();
    };

    const drop = (e) => {
        const dragEndIndex = +e.target.closest('.todo-item').getAttribute('data-index');
        const draggedItem = todos[dragStartIndex];

        todos.splice(dragStartIndex, 1);
        todos.splice(dragEndIndex, 0, draggedItem);

        saveTodos();
        filterTodos(currentFilter);
    };

    todoList.addEventListener('dragstart', dragStart);
    todoList.addEventListener('dragover', dragOver);
    todoList.addEventListener('drop', drop);

    const filterButtons = document.querySelector('.filters');
    let currentFilter = 'all';

    filterButtons.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const filter = e.target.id.replace('filter-', '');
            currentFilter = filter;
            document.querySelectorAll('.filters button').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            filterTodos(filter);
        }
    });

    const clearCompletedButton = document.getElementById('clear-completed');
    clearCompletedButton.addEventListener('click', () => {
        todos = todos.filter(todo => !todo.completed);
        saveTodos();
        filterTodos(currentFilter);
    });

    themeToggle.addEventListener('click', () => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme();
        saveTheme();
    });

    applyTheme();
    renderTodos();
});
