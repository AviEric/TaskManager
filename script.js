// Task Manager Application
class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentFilter = 'all';
        this.currentSort = 'dueDate';
        this.editingTaskId = null;
        this.deletingTaskId = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderTasks();
        this.updateStats();
        this.setMinDate();
    }

    setupEventListeners() {
        // Form submission
        // document.getElementById('taskForm').addEventListener('submit', (e) => {
        //     e.preventDefault();
        //     this.addTask();
        // });

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterTasks();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setActiveFilter(e.target.dataset.filter);
            });
        });

        // Sort functionality
        document.getElementById('sortSelect').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.renderTasks();
        });

        // Edit form submission
        document.getElementById('editForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateTask();
        });

        // Modal close events
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                this.closeEditModal();
                this.closeDeleteModal();
            });
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeEditModal();
                this.closeDeleteModal();
            }
        });
    }

    setMinDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('taskDueDate').min = today;
    }

    addTask() {
        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const priority = document.getElementById('taskPriority').value;
        const dueDate = document.getElementById('taskDueDate').value;
        const category = document.getElementById('taskCategory').value;

        if (!title) {
            this.showToast('Please enter a task title', 'error');
            return;
        }

        const task = {
            id: Date.now().toString(),
            title,
            description,
            priority,
            dueDate,
            category,
            status: 'pending',
            createdAt: new Date().toISOString(),
            completedAt: null
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        this.resetForm();
        this.showToast('Task added successfully!', 'success');
    }

    updateTask() {
        if (!this.editingTaskId) return;

        const title = document.getElementById('editTitle').value.trim();
        const description = document.getElementById('editDescription').value.trim();
        const priority = document.getElementById('editPriority').value;
        const dueDate = document.getElementById('editDueDate').value;
        const category = document.getElementById('editCategory').value;

        if (!title) {
            this.showToast('Please enter a task title', 'error');
            return;
        }

        const taskIndex = this.tasks.findIndex(task => task.id === this.editingTaskId);
        if (taskIndex !== -1) {
            this.tasks[taskIndex] = {
                ...this.tasks[taskIndex],
                title,
                description,
                priority,
                dueDate,
                category
            };

            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.closeEditModal();
            this.showToast('Task updated successfully!', 'success');
        }
    }

    deleteTask(taskId) {
        this.deletingTaskId = taskId;
        const task = this.tasks.find(t => t.id === taskId);
        
        document.querySelector('.task-title-preview').textContent = task.title;
        document.getElementById('deleteModal').style.display = 'block';
    }

    confirmDelete() {
        if (!this.deletingTaskId) return;

        this.tasks = this.tasks.filter(task => task.id !== this.deletingTaskId);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        this.closeDeleteModal();
        this.showToast('Task deleted successfully!', 'success');
    }

    toggleTaskStatus(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = task.status === 'completed' ? 'pending' : 'completed';
            task.completedAt = task.status === 'completed' ? new Date().toISOString() : null;
            
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            
            const statusText = task.status === 'completed' ? 'completed' : 'marked as pending';
            this.showToast(`Task ${statusText}!`, 'success');
        }
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            this.editingTaskId = taskId;
            
            document.getElementById('editTitle').value = task.title;
            document.getElementById('editDescription').value = task.description;
            document.getElementById('editPriority').value = task.priority;
            document.getElementById('editDueDate').value = task.dueDate;
            document.getElementById('editCategory').value = task.category;
            
            document.getElementById('editModal').style.display = 'block';
        }
    }

    setActiveFilter(filter) {
        this.currentFilter = filter;
        
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.filterTasks();
    }

    filterTasks() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        let filteredTasks = this.tasks;

        // Apply search filter
        if (searchTerm) {
            filteredTasks = filteredTasks.filter(task => 
                task.title.toLowerCase().includes(searchTerm) ||
                task.description.toLowerCase().includes(searchTerm) ||
                task.category.toLowerCase().includes(searchTerm)
            );
        }

        // Apply status filter
        if (this.currentFilter !== 'all') {
            filteredTasks = filteredTasks.filter(task => {
                if (this.currentFilter === 'overdue') {
                    return task.status === 'pending' && task.dueDate && new Date(task.dueDate) < new Date();
                }
                return task.status === this.currentFilter;
            });
        }

        // Apply sorting
        filteredTasks = this.sortTasks(filteredTasks);

        this.renderTaskList(filteredTasks);
    }

    sortTasks(tasks) {
        return [...tasks].sort((a, b) => {
            switch (this.currentSort) {
                case 'dueDate':
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                case 'priority':
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'createdDate':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                default:
                    return 0;
            }
        });
    }

    renderTasks() {
        this.filterTasks();
    }

    renderTaskList(tasks) {
        const taskList = document.getElementById('taskList');
        const noTasksMessage = document.getElementById('noTasksMessage');

        if (tasks.length === 0) {
            taskList.innerHTML = '';
            noTasksMessage.style.display = 'block';
            return;
        }

        noTasksMessage.style.display = 'none';
        taskList.innerHTML = tasks.map(task => this.createTaskHTML(task)).join('');
    }

    createTaskHTML(task) {
        const isOverdue = task.status === 'pending' && task.dueDate && new Date(task.dueDate) < new Date();
        const statusClass = task.status === 'completed' ? 'completed' : (isOverdue ? 'overdue' : '');
        
        const dueDateFormatted = task.dueDate ? this.formatDate(task.dueDate) : 'No due date';
        const priorityClass = `priority-${task.priority}`;
        
        return `
            <div class="task-item ${statusClass}" data-id="${task.id}">
                <div class="task-header">
                    <div>
                        <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                        <div class="task-meta">
                            <span class="${priorityClass}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
                            <span class="category-tag">${task.category}</span>
                            <span class="due-date">${dueDateFormatted}</span>
                        </div>
                    </div>
                    <div class="task-actions">
                        ${task.status === 'completed' ? 
                            `<button class="btn btn-secondary" onclick="taskManager.toggleTaskStatus('${task.id}')">
                                <i class="fas fa-undo"></i> Undo
                            </button>` :
                            `<button class="btn btn-success" onclick="taskManager.toggleTaskStatus('${task.id}')">
                                <i class="fas fa-check"></i> Complete
                            </button>`
                        }
                        <button class="btn btn-primary" onclick="taskManager.editTask('${task.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger" onclick="taskManager.deleteTask('${task.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
                ${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}
            </div>
        `;
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.status === 'completed').length;
        const pending = this.tasks.filter(task => task.status === 'pending').length;
        const overdue = this.tasks.filter(task => 
            task.status === 'pending' && task.dueDate && new Date(task.dueDate) < new Date()
        ).length;

        document.getElementById('totalCount').textContent = total;
        document.getElementById('completedCount').textContent = completed;
        document.getElementById('pendingCount').textContent = pending;
        document.getElementById('overdueCount').textContent = overdue;
    }

    resetForm() {
        document.getElementById('taskForm').reset();
        document.getElementById('taskDueDate').min = new Date().toISOString().split('T')[0];
    }

    closeEditModal() {
        document.getElementById('editModal').style.display = 'none';
        this.editingTaskId = null;
        document.getElementById('editForm').reset();
    }

    closeDeleteModal() {
        document.getElementById('deleteModal').style.display = 'none';
        this.deletingTaskId = null;
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
            });
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'fas fa-check-circle' : 
                    type === 'error' ? 'fas fa-exclamation-circle' : 
                    'fas fa-info-circle';
        
        toast.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
        `;

        const container = document.getElementById('toastContainer');
        container.appendChild(toast);

        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'toastSlideOut 0.3s ease forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// Global functions for modal operations
function closeEditModal() {
    taskManager.closeEditModal();
}

function closeDeleteModal() {
    taskManager.closeDeleteModal();
}

function confirmDelete() {
    taskManager.confirmDelete();
}

// Initialize the application
let taskManager;
document.addEventListener('DOMContentLoaded', () => {
    taskManager = new TaskManager();
});

// Add CSS animation for toast removal
const style = document.createElement('style');
style.textContent = `
    @keyframes toastSlideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);
