// Task Manager Application
class TaskManager {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.currentSort = 'dueDate';
        this.editingTaskId = null;
        this.deletingTaskId = null;
        this.db = null;
        this.auth = null;
        this.realtimeSubscription = null;
        
        this.init();
    }

    async init() {
        // Initialize database and auth
        this.db = new DatabaseManager();
        this.auth = new AuthManager(this.db);
        
        // Make authManager globally accessible
        window.authManager = this.auth;
        
        // Wait for database to initialize
        await this.db.init();
        
        // Check if user is authenticated
        if (this.db.isAuthenticated()) {
            await this.loadTasks();
            this.setupRealtimeSubscription();
        }
        
        this.setupEventListeners();
        this.renderTasks();
        this.updateStats();
        this.setMinDate();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

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

    async addTask() {
        if (!this.db.isAuthenticated()) {
            this.showToast('Please sign in to add tasks', 'error');
            return;
        }

        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const priority = document.getElementById('taskPriority').value;
        const dueDate = document.getElementById('taskDueDate').value;
        const category = document.getElementById('taskCategory').value;

        if (!title) {
            this.showToast('Please enter a task title', 'error');
            return;
        }

        const taskData = {
            title,
            description,
            priority,
            due_date: dueDate || null,
            category,
            status: 'pending',
            completed_at: null
        };

        const result = await this.db.createTask(taskData);
        
        if (result.success) {
            this.tasks.unshift(result.task);
            this.renderTasks();
            this.updateStats();
            this.resetForm();
            this.showToast('Task added successfully!', 'success');
        } else {
            this.showToast(result.message || 'Failed to add task', 'error');
        }
    }

    async updateTask() {
        if (!this.editingTaskId) return;

        if (!this.db.isAuthenticated()) {
            this.showToast('Please sign in to update tasks', 'error');
            return;
        }

        const title = document.getElementById('editTitle').value.trim();
        const description = document.getElementById('editDescription').value.trim();
        const priority = document.getElementById('editPriority').value;
        const dueDate = document.getElementById('editDueDate').value;
        const category = document.getElementById('editCategory').value;

        if (!title) {
            this.showToast('Please enter a task title', 'error');
            return;
        }

        const updates = {
            title,
            description,
            priority,
            due_date: dueDate || null,
            category
        };

        const result = await this.db.updateTask(this.editingTaskId, updates);
        
        if (result.success) {
            const taskIndex = this.tasks.findIndex(task => task.id === this.editingTaskId);
            if (taskIndex !== -1) {
                this.tasks[taskIndex] = result.task;
            }
            this.renderTasks();
            this.updateStats();
            this.closeEditModal();
            this.showToast('Task updated successfully!', 'success');
        } else {
            this.showToast(result.message || 'Failed to update task', 'error');
        }
    }

    deleteTask(taskId) {
        this.deletingTaskId = taskId;
        const task = this.tasks.find(t => t.id === taskId);
        
        document.querySelector('.task-title-preview').textContent = task.title;
        document.getElementById('deleteModal').style.display = 'block';
    }

    async confirmDelete() {
        if (!this.deletingTaskId) return;

        if (!this.db.isAuthenticated()) {
            this.showToast('Please sign in to delete tasks', 'error');
            return;
        }

        const result = await this.db.deleteTask(this.deletingTaskId);
        
        if (result.success) {
            this.tasks = this.tasks.filter(task => task.id !== this.deletingTaskId);
            this.renderTasks();
            this.updateStats();
            this.closeDeleteModal();
            this.showToast('Task deleted successfully!', 'success');
        } else {
            this.showToast(result.message || 'Failed to delete task', 'error');
        }
    }

    async toggleTaskStatus(taskId) {
        if (!this.db.isAuthenticated()) {
            this.showToast('Please sign in to update tasks', 'error');
            return;
        }

        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            const newStatus = task.status === 'completed' ? 'pending' : 'completed';
            const updates = {
                status: newStatus,
                completed_at: newStatus === 'completed' ? new Date().toISOString() : null
            };

            const result = await this.db.updateTask(taskId, updates);
            
            if (result.success) {
                task.status = newStatus;
                task.completed_at = updates.completed_at;
                this.renderTasks();
                this.updateStats();
                
                const statusText = newStatus === 'completed' ? 'completed' : 'marked as pending';
                this.showToast(`Task ${statusText}!`, 'success');
            } else {
                this.showToast(result.message || 'Failed to update task', 'error');
            }
        }
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            this.editingTaskId = taskId;
            
            document.getElementById('editTitle').value = task.title;
            document.getElementById('editDescription').value = task.description;
            document.getElementById('editPriority').value = task.priority;
            document.getElementById('editDueDate').value = task.due_date || '';
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
                    return task.status === 'pending' && task.due_date && new Date(task.due_date) < new Date();
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
                    if (!a.due_date && !b.due_date) return 0;
                    if (!a.due_date) return 1;
                    if (!b.due_date) return -1;
                    return new Date(a.due_date) - new Date(b.due_date);
                case 'priority':
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'createdDate':
                    return new Date(b.created_at) - new Date(a.created_at);
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
        const isOverdue = task.status === 'pending' && task.due_date && new Date(task.due_date) < new Date();
        const statusClass = task.status === 'completed' ? 'completed' : (isOverdue ? 'overdue' : '');
        
        const dueDateFormatted = task.due_date ? this.formatDate(task.due_date) : 'No due date';
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
            task.status === 'pending' && task.due_date && new Date(task.due_date) < new Date()
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

    // Database methods
    async loadTasks() {
        if (!this.db.isAuthenticated()) {
            this.tasks = [];
            return;
        }

        const result = await this.db.getTasks();
        if (result.success) {
            this.tasks = result.tasks;
        } else {
            this.showToast(result.message || 'Failed to load tasks', 'error');
            this.tasks = [];
        }
    }

    setupRealtimeSubscription() {
        if (!this.db.isAuthenticated()) return;

        this.realtimeSubscription = this.db.subscribeToTasks((payload) => {
            console.log('Real-time update:', payload);
            
            switch (payload.eventType) {
                case 'INSERT':
                    this.tasks.unshift(payload.new);
                    break;
                case 'UPDATE':
                    const updateIndex = this.tasks.findIndex(task => task.id === payload.new.id);
                    if (updateIndex !== -1) {
                        this.tasks[updateIndex] = payload.new;
                    }
                    break;
                case 'DELETE':
                    this.tasks = this.tasks.filter(task => task.id !== payload.old.id);
                    break;
            }
            
            this.renderTasks();
            this.updateStats();
        });
    }

    cleanup() {
        if (this.realtimeSubscription) {
            this.realtimeSubscription.unsubscribe();
        }
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
let authManager;

document.addEventListener('DOMContentLoaded', async () => {
    taskManager = new TaskManager();
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (taskManager) {
            taskManager.cleanup();
        }
    });
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
