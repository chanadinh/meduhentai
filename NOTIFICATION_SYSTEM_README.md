# Notification System for Manga Comments

This document describes the notification system that automatically sends notifications to manga uploaders when someone comments on their manga.

## Overview

The notification system automatically creates notifications in the following scenarios:

1. **Manga Comment Notifications**: When someone comments on a manga, the uploader receives a notification
2. **Comment Reply Notifications**: When someone replies to a comment, the comment owner receives a notification
3. **Comment Reaction Notifications**: When someone likes/dislikes a comment, the comment owner receives a notification

## How It Works

### 1. Manga Comment Notifications

When a user creates a comment on a manga:

- The system checks if the commenter is not the manga uploader
- If not, it creates a notification with type `manga_comment`
- The notification includes:
  - Recipient: Manga uploader
  - Title: "Bình luận mới trên manga của bạn"
  - Message: "{username} đã bình luận trên manga "{manga_title}""
  - Data: mangaId, chapterId (if applicable), commentId, fromUser

### 2. Comment Reply Notifications

When a user replies to a comment:

- The system checks if the replier is not the comment owner
- If not, it creates a notification with type `comment_reply`
- The notification includes:
  - Recipient: Comment owner
  - Title: "Phản hồi mới"
  - Message: "{username} đã phản hồi bình luận của bạn"
  - Data: mangaId, chapterId (if applicable), commentId, fromUser

### 3. Comment Reaction Notifications

When a user likes or dislikes a comment:

- The system checks if the reactor is not the comment owner
- If not, it creates a notification with type `like` or `unlike`
- The notification includes:
  - Recipient: Comment owner
  - Title: "Thích bình luận" / "Bỏ thích bình luận" / etc.
  - Message: "{username} đã thích/không thích bình luận của bạn"
  - Data: mangaId, chapterId (if applicable), commentId, fromUser

## Database Schema

### Notification Model

```typescript
interface INotification {
  userId: mongoose.Types.ObjectId;        // Who receives the notification
  type: 'manga_comment' | 'comment_reply' | 'like' | 'unlike';
  title: string;                          // Notification title
  message: string;                        // Notification message
  data: {
    mangaId?: mongoose.Types.ObjectId;    // Related manga
    chapterId?: mongoose.Types.ObjectId;  // Related chapter (if applicable)
    commentId?: mongoose.Types.ObjectId;  // Related comment
    fromUser?: mongoose.Types.ObjectId;   // Who triggered the notification
  };
  isRead: boolean;                        // Whether notification has been read
  createdAt: Date;                        // When notification was created
  updatedAt: Date;                        // When notification was last updated
}
```

## API Endpoints

### Creating Notifications

Notifications are automatically created through these API calls:

- `POST /api/comments` - Creates manga comment and reply notifications
- `POST /api/comments/[id]/reactions` - Creates reaction notifications

### Fetching Notifications

- `GET /api/notifications` - Fetch user's notifications with pagination
- `PUT /api/notifications` - Mark notifications as read/unread

### Notification Cleanup

Notifications are automatically cleaned up when:

- Comments are deleted
- Manga are deleted
- Chapters are deleted
- Users are deleted

## Frontend Integration

The `NotificationDropdown` component automatically:

- Fetches notifications from the API
- Displays unread notification count
- Shows notification list with actions
- Handles marking notifications as read/unread
- Navigates to relevant manga/comment sections

## Duplicate Prevention

The system prevents duplicate notifications by:

- Checking for existing notifications within 24 hours
- Using unique combinations of type, userId, and data fields
- Special handling for manga_comment type to prevent spam

## Error Handling

- Notification creation failures don't break the main functionality
- Errors are logged but don't prevent comments/reactions from being saved
- Graceful degradation if notification system is unavailable

## Testing

Use the test script to verify the notification system:

```bash
node scripts/test-notifications.js
```

This script will:
1. Create test users and manga
2. Create a test comment
3. Verify notification creation
4. Clean up test data

## Configuration

The notification system requires:

- MongoDB connection
- User authentication (NextAuth.js)
- Proper user roles and permissions
- Notification model in database

## Future Enhancements

Potential improvements:

- Email notifications
- Push notifications
- Notification preferences per user
- Notification frequency limits
- Rich notification content (images, links)
- Notification categories and filtering
