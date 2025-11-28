/* Task Manager JavaScript
	 Location: d:/documents of D/htmlfiles/Untitled-1.js
	 - Adds, deletes, toggles tasks
	 - Persists tasks in localStorage under `task_manager.tasks`
*/
(function () {
	const STORAGE_KEY = 'task_manager.tasks';

	const addForm = document.getElementById('addForm');
	const taskTitleInput = document.getElementById('taskTitle');
	const taskList = document.getElementById('taskList');
	const taskStats = document.getElementById('task-stats');
	const clearCompletedBtn = document.getElementById('clearCompleted');
	const clearAllBtn = document.getElementById('clearAll');

	let tasks = [];

	function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
	function load() {
		try { tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch (e) { tasks = []; }
	}

	function render() {
		taskList.innerHTML = '';
		if (!tasks.length) {
			taskList.innerHTML = '<div class="muted">No tasks yet — add one above.</div>';
		}

		tasks.forEach(task => {
			const item = document.createElement('div');
			item.className = 'task-item' + (task.completed ? ' completed' : '');
			item.setAttribute('data-id', task.id);

			const checkbox = document.createElement('input');
			checkbox.type = 'checkbox';
			checkbox.checked = !!task.completed;
			checkbox.setAttribute('aria-label', 'Mark task complete');

			const title = document.createElement('div');
			title.className = 'task-title';
			title.textContent = task.title;

			const controls = document.createElement('div');
			controls.className = 'task-controls';

			const del = document.createElement('button');
			del.className = 'btn';
			del.textContent = 'Delete';
			del.setAttribute('aria-label', 'Delete task');

			// events
			checkbox.addEventListener('change', () => toggleComplete(task.id));
			del.addEventListener('click', () => deleteTask(task.id));

			item.appendChild(checkbox);
			item.appendChild(title);
			item.appendChild(controls);
			controls.appendChild(del);

			taskList.appendChild(item);
		});

		updateStats();
	}

	function updateStats() {
		const total = tasks.length;
		const completed = tasks.filter(t => t.completed).length;
		taskStats.textContent = `${total} task${total !== 1 ? 's' : ''} • ${completed} completed`;
	}

	function addTask(title) {
		if (!title || !title.trim()) return;
		const task = { id: Date.now().toString(36), title: title.trim(), completed: false };
		tasks.unshift(task);
		save();
		render();
	}

	function toggleComplete(id) {
		tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
		save();
		render();
	}

	function deleteTask(id) {
		tasks = tasks.filter(t => t.id !== id);
		save();
		render();
	}

	function clearCompleted() {
		tasks = tasks.filter(t => !t.completed);
		save();
		render();
	}

	function clearAll() {
		if (!confirm('Clear all tasks?')) return;
		tasks = [];
		save();
		render();
	}

	// init
	load();
	document.addEventListener('DOMContentLoaded', () => {
		render();

		addForm.addEventListener('submit', (e) => {
			e.preventDefault();
			addTask(taskTitleInput.value);
			taskTitleInput.value = '';
			taskTitleInput.focus();
		});

		clearCompletedBtn.addEventListener('click', clearCompleted);
		clearAllBtn.addEventListener('click', clearAll);
	});

})();
