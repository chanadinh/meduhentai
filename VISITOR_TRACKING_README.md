# Visitor Tracking System

This system tracks website visitors and provides comprehensive analytics for your manga website.

## Features

### 🎯 **Visitor Tracking**
- **IP Address Tracking**: Records visitor IP addresses for unique identification
- **Device Detection**: Automatically detects mobile, desktop, and tablet devices
- **Browser & OS Detection**: Identifies browsers and operating systems
- **Bot Filtering**: Excludes search engine bots and crawlers from tracking
- **Referrer Tracking**: Records where visitors came from

### 📊 **Analytics Dashboard**
- **Total Visitors**: Count of all page views
- **Unique Visitors**: Count of unique IP addresses
- **Daily Statistics**: Today's visitor count
- **Device Distribution**: Breakdown by device type
- **Browser Statistics**: Top browsers used
- **Recent Visitors**: Latest visitor activity

### 🔒 **Privacy & Security**
- **Bot Detection**: Automatically filters out bots and crawlers
- **IP Anonymization**: Only stores IP addresses, no personal data
- **GDPR Compliant**: Minimal data collection approach
- **Admin Only Access**: Analytics dashboard restricted to admin users

## Components

### 1. **Visitor Model** (`models/Visitor.ts`)
- MongoDB schema for storing visitor data
- Indexed fields for efficient queries
- Tracks visit count, pages viewed, and device information

### 2. **API Endpoint** (`app/api/analytics/track`)
- **POST**: Records page views and visitor data
- **GET**: Retrieves analytics data for dashboard
- Handles both new and returning visitors

### 3. **Visitor Tracker** (`components/VisitorTracker.tsx`)
- Automatically tracks page views
- Integrated into root layout
- Silent operation (no user interruption)

### 4. **Analytics Dashboard** (`app/admin/analytics/page.tsx`)
- Admin-only access
- Real-time visitor statistics
- Device and browser breakdowns
- Recent visitor activity table

### 5. **Visitor Counter** (`components/VisitorCounter.tsx`)
- Public display component
- Shows total and daily visitor counts
- Can be added to any page

## Installation & Setup

### 1. **Database Setup**
The system automatically creates the necessary MongoDB collections when first used.

### 2. **Integration**
The `VisitorTracker` component is automatically included in the root layout and will start tracking immediately.

### 3. **Admin Access**
Access the analytics dashboard at `/admin/analytics` (admin users only).

## Usage Examples

### **Track Custom Events**
```typescript
import { useVisitorTracking } from '@/lib/use-visitor-tracking';

function MyComponent() {
  const { trackEvent } = useVisitorTracking();
  
  const handleMangaRead = () => {
    trackEvent('manga_read', { mangaId: '123', chapter: '1' });
  };
  
  return <button onClick={handleMangaRead}>Read Manga</button>;
}
```

### **Display Visitor Counter**
```typescript
import VisitorCounter from '@/components/VisitorCounter';

function Footer() {
  return (
    <footer>
      <VisitorCounter />
    </footer>
  );
}
```

### **Custom Tracking Hook**
```typescript
import { useVisitorTracking } from '@/lib/use-visitor-tracking';

function MyPage() {
  // Automatically tracks page views
  useVisitorTracking({
    enabled: true,
    trackReferrer: true,
    trackPageViews: true
  });
  
  return <div>My Page Content</div>;
}
```

## API Endpoints

### **POST /api/analytics/track**
Track a page view or custom event.

**Request Body:**
```json
{
  "page": "/manga/123",
  "referrer": "https://google.com",
  "event": "manga_read",
  "eventData": { "mangaId": "123" }
}
```

**Response:**
```json
{
  "success": true,
  "visitorId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "isNewVisitor": false
}
```

### **GET /api/analytics/track**
Retrieve analytics data.

**Response:**
```json
{
  "success": true,
  "analytics": {
    "totalVisitors": 1250,
    "uniqueVisitors": 890,
    "todayVisitors": 45,
    "deviceStats": [
      { "_id": "mobile", "count": 650 },
      { "_id": "desktop", "count": 500 },
      { "_id": "tablet", "count": 100 }
    ],
    "browserStats": [
      { "_id": "Chrome", "count": 800 },
      { "_id": "Safari", "count": 300 },
      { "_id": "Firefox", "count": 150 }
    ]
  }
}
```

## Data Structure

### **Visitor Document**
```typescript
{
  _id: ObjectId,
  ip: string,                    // Visitor IP address
  userAgent: string,             // Browser user agent
  deviceType: 'mobile' | 'desktop' | 'tablet',
  browser?: string,              // Detected browser
  os?: string,                   // Detected OS
  firstVisit: Date,              // First visit timestamp
  lastVisit: Date,               // Last visit timestamp
  visitCount: number,            // Total visits from this IP
  pagesViewed: string[],         // Array of pages visited
  referrer?: string,             // Where visitor came from
  isUnique: boolean,             // Is this a unique visitor
  createdAt: Date,
  updatedAt: Date
}
```

## Privacy Considerations

- **No Personal Data**: Only collects technical information (IP, device, browser)
- **Bot Filtering**: Automatically excludes search engines and bots
- **Admin Access**: Analytics data only visible to admin users
- **Minimal Storage**: Only stores necessary tracking information

## Performance

- **Efficient Indexing**: Database indexes for fast queries
- **Async Operations**: Non-blocking tracking operations
- **Error Handling**: Graceful fallbacks if tracking fails
- **Rate Limiting**: Built-in protection against abuse

## Troubleshooting

### **Common Issues**

1. **Tracking Not Working**
   - Check browser console for errors
   - Verify API endpoint is accessible
   - Check MongoDB connection

2. **High Memory Usage**
   - Review database indexes
   - Consider data retention policies
   - Monitor collection sizes

3. **Bot Traffic**
   - Verify bot detection patterns
   - Check user agent strings
   - Review tracking logs

### **Debug Mode**
Enable console logging by setting environment variable:
```bash
DEBUG_VISITOR_TRACKING=true
```

## Future Enhancements

- **Geolocation**: Country/city detection
- **Session Tracking**: User session management
- **Conversion Tracking**: Goal completion tracking
- **Real-time Updates**: WebSocket-based live updates
- **Export Features**: Data export capabilities
- **Advanced Filtering**: Custom visitor segments

## Support

For issues or questions about the visitor tracking system, check the console logs or review the API responses for error details.
