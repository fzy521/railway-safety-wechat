# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Railway Safety Monitoring System** (梁邹铁路专用线运营安全监控系统) - a web-based safety management application for dedicated railway lines. It's a client-side only application using HTML5, CSS3, JavaScript (ES6+), Tailwind CSS, ECharts.js, and Anime.js.

## Architecture

### Frontend Stack
- **HTML5/CSS3**: Static markup and styling
- **Tailwind CSS**: UI framework via CDN
- **JavaScript ES6+**: Modern JavaScript with class-based architecture
- **ECharts.js**: Data visualization and charts
- **Anime.js**: Animation effects
- **No build system**: Direct browser execution via CDN links

### Key Files
- `main.js`: Core application logic and chart initialization
- `api-service.js`: Mock API service layer with all data simulation
- Individual HTML files for each module (index.html, risk-assessment.html, etc.)

### Data Flow
1. All data is mocked in `api-service.js` using JavaScript arrays and objects
2. No backend integration - everything runs client-side
3. Authentication uses localStorage/sessionStorage with predefined users
4. Charts are initialized on page load and update via setInterval for "real-time" effect

## Development Commands

Since this is a static web application with no build system:

### Running the Application
```bash
# Serve locally using any HTTP server
python -m http.server 8000
# or
npx http-server
# or open index.html directly in browser
```

### Testing
No test framework is configured. Manual testing required for all functionality.

### Code Style
- ES6+ JavaScript with class syntax
- Chinese language for all user-facing content
- No linting configuration exists

## Key Technical Patterns

### Authentication
```javascript
// Users stored in api-service.js with roles:
// - admin (超级管理员): Full system access
// - safety_manager (安全管理员): Safety and risk management
// - train_manager (培训管理员): Training and certificates
// - operator1 (普通用户): View-only access
```

### Chart Initialization Pattern
```javascript
// All charts follow this pattern:
1. Initialize ECharts instance
2. Set option with Chinese labels
3. Update data via setInterval for "real-time" effect
4. Handle window resize for responsiveness
```

### Data Management
- All data structures defined in `api-service.js` constructor
- Mock data includes users, roles, permissions, safety records, incidents, etc.
- No persistent storage - data resets on page refresh

## Module-Specific Notes

### Safety Dashboard (index.html)
- Real-time safety metrics with gauge chart
- Railway line visualization with station status
- Risk alerts and notifications panel

### Risk Assessment (risk-assessment.html)
- Risk matrix 5x5 grid (概率 x 严重程度)
- Risk trend analysis with line charts
- Risk tracking with status workflow

### Incident Management (incident-report.html)
- Structured incident reporting form
- Classification system with statistics
- Corrective action tracking

### Training Management (training-management.html)
- Interactive training calendar
- Certificate expiry tracking
- Training effectiveness evaluation

## Important Considerations

1. **Security**: This is a demo system with plain-text passwords and no real authentication
2. **Production Readiness**: Would need backend API, database, proper authentication
3. **Language**: All UI content and documentation is in Chinese
4. **Data Persistence**: Currently all data is lost on page refresh
5. **Browser Compatibility**: Uses modern ES6+ features - ensure compatible browser

## Common Tasks

### Adding a New Chart
1. Add chart container div to HTML
2. Create initialization function in main.js
3. Call function in initializeCharts()
4. Add data structure to api-service.js if needed

### Adding New Mock Data
1. Add data arrays to ApiService constructor
2. Create getter methods in ApiService class
3. Update related charts/components to use new data

### Modifying User Roles/Permissions
1. Update users/roles arrays in api-service.js
2. Modify permission checks in main.js
3. Update UI elements that check permissions