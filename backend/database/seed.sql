USE devflow;

-- =========================================
-- USERS
-- =========================================

INSERT INTO users (name, email)
VALUES
    ('Heshwanthini', 'heshwanthini@example.com'),
    ('Arun Kumar', 'arun@example.com'),
    ('Priya Sharma', 'priya@example.com');

-- =========================================
-- PROJECTS
-- =========================================

INSERT INTO projects
    (user_id, name, description, status, progress, technologies)
VALUES
    (
        1,
        'DevFlow',
        'Developer productivity dashboard and task management platform.',
        'In Progress',
        65,
        JSON_ARRAY('React', 'JavaScript', 'Vite', 'Node.js', 'Express', 'MySQL')
    ),
    (
        1,
        'RentHub',
        'Property rental management application.',
        'In Progress',
        45,
        JSON_ARRAY('React', 'Node.js', 'Express', 'MySQL')
    ),
    (
        2,
        'NOC College Management',
        'College management system for students, faculty and administration.',
        'Completed',
        100,
        JSON_ARRAY('React', 'Node.js', 'MySQL')
    ),
    (
        2,
        'SmartHome Analytics',
        'Dashboard for monitoring smart home devices and analytics.',
        'In Progress',
        70,
        JSON_ARRAY('JavaScript', 'Node.js', 'MySQL')
    ),
    (
        3,
        'QuickCart API',
        'Backend API for an online shopping platform.',
        'In Progress',
        55,
        JSON_ARRAY('Node.js', 'Express', 'MySQL')
    );

-- =========================================
-- TASKS
-- =========================================

INSERT INTO tasks
    (project_id, title, description, priority, status, progress, due_date)
VALUES
    (
        1,
        'Create Responsive Navbar',
        'Build a responsive navigation bar for the DevFlow dashboard.',
        'High',
        'Completed',
        100,
        '2026-09-03'
    ),
    (
        1,
        'Implement Search Functionality',
        'Add search functionality for projects and tasks.',
        'High',
        'In Progress',
        60,
        '2026-09-07'
    ),
    (
        1,
        'Build Analytics Dashboard',
        'Create charts and productivity statistics for the dashboard.',
        'Medium',
        'In Progress',
        40,
        '2026-09-12'
    ),
    (
        1,
        'Implement API Integration',
        'Connect the DevFlow frontend with the Task Management REST API.',
        'High',
        'To Do',
        0,
        '2026-09-20'
    ),
    (
        2,
        'Implement User Authentication',
        'Create the authentication flow for RentHub users.',
        'High',
        'In Progress',
        50,
        '2026-09-08'
    ),
    (
        2,
        'Create Property Listing',
        'Build the property listing functionality.',
        'Medium',
        'To Do',
        0,
        '2026-09-15'
    ),
    (
        3,
        'Create Student Module',
        'Implement student management functionality.',
        'High',
        'Completed',
        100,
        '2026-08-20'
    ),
    (
        3,
        'Create Faculty Module',
        'Implement faculty management functionality.',
        'Medium',
        'Completed',
        100,
        '2026-08-25'
    ),
    (
        4,
        'Device Monitoring',
        'Implement real-time device monitoring.',
        'High',
        'In Progress',
        75,
        '2026-09-10'
    ),
    (
        4,
        'Analytics Reports',
        'Generate smart home usage reports.',
        'Low',
        'To Do',
        0,
        '2026-09-18'
    ),
    (
        5,
        'Product API',
        'Create CRUD endpoints for products.',
        'High',
        'In Progress',
        65,
        '2026-09-11'
    ),
    (
        5,
        'Cart Management',
        'Implement shopping cart functionality.',
        'Medium',
        'Blocked',
        20,
        '2026-09-16'
    );