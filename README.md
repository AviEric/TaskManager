# Task Manager Website

A modern, responsive task management application built with HTML, CSS, and JavaScript. This application provides a complete CRUD (Create, Read, Update, Delete) interface for managing tasks with a beautiful, intuitive design.

## Features

### ✨ Core Functionality
- **Create Tasks**: Add new tasks with title, description, priority, due date, and category
- **Read Tasks**: View all tasks with filtering and sorting options
- **Update Tasks**: Edit existing task details through a modal interface
- **Delete Tasks**: Remove tasks with confirmation dialog
- **Toggle Status**: Mark tasks as completed or pending

### 🔍 Advanced Features
- **Smart Filtering**: Filter tasks by status (All, Pending, Completed, Overdue)
- **Search Functionality**: Search tasks by title, description, or category
- **Multiple Sorting Options**: Sort by due date, priority, title, or creation date
- **Priority Levels**: High, Medium, and Low priority with color coding
- **Categories**: Organize tasks by work, personal, shopping, health, education, or other
- **Due Date Management**: Set and track due dates with overdue detection

### 📊 Statistics Dashboard
- **Real-time Counts**: View total, pending, completed, and overdue task counts
- **Visual Indicators**: Color-coded statistics with hover effects
- **Dynamic Updates**: Statistics update automatically as tasks change

### 🎨 User Experience
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Beautiful gradient backgrounds and smooth animations
- **Toast Notifications**: Success, error, and info messages for user feedback
- **Modal Dialogs**: Clean edit and delete confirmation interfaces
- **Local Storage**: Data persists between browser sessions

## How to Use

### Getting Started
1. Open `index.html` in your web browser
2. The application will load with an empty task list
3. Start by adding your first task using the form at the top

### Adding Tasks
1. Fill in the task title (required)
2. Add an optional description
3. Select priority level (Low, Medium, High)
4. Choose a due date (optional)
5. Select a category
6. Click "Add Task"

### Managing Tasks
- **Complete Task**: Click the green "Complete" button
- **Edit Task**: Click the blue "Edit" button to modify task details
- **Delete Task**: Click the red "Delete" button (requires confirmation)
- **Undo Completion**: Click "Undo" to mark a completed task as pending again

### Filtering and Searching
- **Search Box**: Type to search across all task fields
- **Filter Buttons**: Click to show only specific task statuses
- **Sort Dropdown**: Choose how to order your tasks

### Task Organization
- **Priority Colors**: 
  - 🔴 High Priority (Red)
  - 🟡 Medium Priority (Yellow)
  - 🔵 Low Priority (Blue)
- **Status Indicators**:
  - ⏰ Pending (Default)
  - ✅ Completed (Green border)
  - ⚠️ Overdue (Red border, red background)

## File Structure

```
Task_Manager/
├── index.html          # Main HTML file with the application structure
├── styles.css          # CSS styling and responsive design
├── script.js           # JavaScript functionality and CRUD operations
└── README.md           # This documentation file
```

## Technical Details

### Technologies Used
- **HTML5**: Semantic markup and form elements
- **CSS3**: Modern styling with Flexbox, Grid, and CSS animations
- **JavaScript ES6+**: Class-based architecture with modern JavaScript features
- **Local Storage**: Browser-based data persistence
- **Font Awesome**: Icon library for visual elements

### Browser Compatibility
- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

### Data Storage
- All data is stored locally in the browser's localStorage
- No external databases or servers required
- Data persists between browser sessions
- Export/import functionality can be easily added

## Customization

### Adding New Categories
To add new task categories, modify the `select` elements in both the add and edit forms in `index.html`:

```html
<option value="new-category">New Category</option>
```

### Changing Colors
Modify the CSS variables and color classes in `styles.css` to match your preferred color scheme.

### Adding New Features
The modular JavaScript architecture makes it easy to add new features:
- New task properties can be added to the task object
- Additional filters can be implemented in the `filterTasks()` method
- New sorting options can be added to the `sortTasks()` method

## Future Enhancements

Potential features that could be added:
- **Task Export/Import**: JSON or CSV file support
- **Task Templates**: Predefined task structures
- **Recurring Tasks**: Daily, weekly, or monthly repeating tasks
- **Task Dependencies**: Tasks that depend on other tasks
- **Time Tracking**: Log time spent on tasks
- **Collaboration**: Share tasks with others
- **Cloud Sync**: Multiple device synchronization

## License

This project is open source and available under the MIT License.

## Support

For questions or suggestions, please open an issue in the project repository.

---

**Enjoy organizing your tasks and boosting your productivity! 🚀**
