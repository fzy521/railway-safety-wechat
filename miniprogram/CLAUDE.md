# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **WeChat Mini Program (微信小程序)** for railway safety monitoring called "铁路安全监控" (Railway Safety Monitoring). The application provides real-time monitoring of railway safety metrics, incident tracking, risk management, and inspection task management.

- **App ID**: wx44d680a5026d9661
- **Cloud Environment**: cloud1-9gz3lqctb5e4f85d
- **Development Platform**: WeChat Developer Tools

## Architecture

WeChat Mini Program with WeChat Cloud Development backend:

- **Frontend**: Mini Program pages using WXML/WXSS/JavaScript
- **Backend**: WeChat Cloud Functions (serverless)
- **Database**: WeChat Cloud Database (currently using mock data for rapid deployment)
- **File Structure**:
  ```
  ├── pages/                    # Mini program pages
  │   ├── dashboard/           # Monitoring dashboard
  │   ├── incident/            # Incident management
  │   ├── inspection/          # Inspection management
  │   ├── risk/                # Risk management
  │   ├── profile/             # User profile
  │   ├── login/               # Authentication
  │   └── index/               # Entry point
  ├── cloudfunctions/          # Cloud functions
  │   ├── login/               # User login/auth
  │   ├── getSafetyMetrics/    # Dashboard data
  │   ├── getIncidents/        # Incident data
  │   ├── getInspections/      # Inspection data
  │   └── initDatabase/        # DB initialization
  ├── package-safety/          # Sub-package for safety features
  └── images/                  # Static assets
  ```

## Development Commands

### Running the Project

1. Open WeChat Developer Tools
2. Import project from directory
3. Ensure "Use npm modules" is enabled in project settings
4. Click "Compile" to run in simulator

### Testing Cloud Functions

Functions can be tested directly in WeChat Developer Tools:

1. Open "Cloud Functions" panel
2. Right-click function → "Test in cloud"
3. Or use local testing with mock data

### Debugging

- **Frontend**: Use WeChat Developer Tools debugger
- **Cloud Functions**: Check logs in WeChat Developer Tools → Cloud Functions panel
- **API Testing**: Use Postman or WeChat's built-in API testing tool

## Key Technical Details

### Data Flow

Currently using **mock data** for rapid deployment. All cloud functions return mock data with the structure defined in their respective files. To transition to real database:

1. Uncomment database queries in cloud functions
2. Update data access logic in frontend pages
3. Run database initialization via `initDatabase` cloud function

### Authentication

- User login handled via WeChat OAuth
- User info stored in `users` collection in cloud database
- Global auth state managed in `app.js` with `checkLoginStatus()` and `getUserInfo()`

### Canvas Charts

Dashboard page uses native canvas API (`drawColumnChart`) to render weekly incident trends. Key considerations:

- Canvas sizing must account for device pixel ratio
- Chart data update via `updateChart()` method
- Currently drawing mock data - will need to connect to real metrics

### Cloud Function Patterns

All cloud functions follow this pattern:
```javascript
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  try {
    // Function logic
    return { success: true, data: result }
  } catch (err) {
    return { success: false, error: err.message }
  }
}
```

### Styling Approach

- Uses WXSS (WeChat Style Sheets) - similar to CSS
- Color scheme follows WeChat design guidelines
- Responsive design using `rpx` units (responsive pixels)
- Global styles in `app.wxss`, page-specific styles in respective `.wxss` files

## Important Considerations

### TODOs for Production

1. **Database Integration**: Replace mock data with actual database queries
2. **Role-Based Access**: Current roles are `visitor` (read-only) - expand for operators, administrators
3. **Real-time Updates**: Consider WebSocket implementation for live monitoring
4. **Offline Support**: Implement caching for inspection data
5. **Push Notifications**: Configure for incident alerts

### WeChat-Specific Requirements

- **Permissions**: App requires `scope.userLocation` for inspection point positioning
- **Background Modes**: `audio` and `location` modes declared in `app.json`
- **File Size**: Individual files cannot exceed 2MB, total package cannot exceed 20MB
- **API Rate Limits**: Cloud functions have invocation limits - implement caching where appropriate

### Navigation Structure

Tab bar navigation with 5 main sections:
1. Dashboard (monitor)
2. Risk
3. Incident
4. Inspection
5. Profile

Sub-package `package-safety` contains additional pages for training, certificates, and reports.

### Common Patterns

**API Calls**: All data loaded via `wx.cloud.callFunction()`
- Use `async/await` for cleaner code
- Always provide fallback to mock data on failure
- Show loading indicators with `wx.showLoading()`

**Error Handling**: Global error functions in `app.js`
- `app.showError(message)` for errors
- `app.showSuccess(message)` for success

**Pull-to-Refresh**: Implemented on list pages
- Use `onPullDownRefresh()` lifecycle hook
- Call `wx.stopPullDownRefresh()` when complete

**Infinite Scroll**: Implemented on inspection/incident pages
- Use `onReachBottom()` lifecycle hook
- Track pagination state in `data.page`

## Testing Strategy

1. **Unit Testing**: Test cloud functions in isolation using WeChat's testing tool
2. **Integration Testing**: Test frontend-backend integration
3. **User Acceptance**: Test on actual devices (iOS/Android)
4. **Performance**: Monitor cloud function cold starts and response times

## Deployment

1. Upload cloud functions in WeChat Developer Tools
2. Test in development environment
3. Submit for review via WeChat Mini Program platform
4. Deploy to production after approval

## Common Issues

- **Cold Starts**: Cloud functions may have latency on first invocation
- **Mock Data Consistency**: Ensure mock data maintains realistic relationships
- **Canvas Rendering**: Canvas may not render properly in some Android versions - test thoroughly
- **Permissions**: Users must grant location permission for inspection features
