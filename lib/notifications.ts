export interface NotificationData {
  type: 'system';
  title: string;
  message: string;
  data?: {
    mangaId?: string;
    chapterId?: string;
    commentId?: string;
    fromUser?: string;
  };
}

export async function createNotification(userId: string, notificationData: NotificationData) {
  try {
    const response = await fetch('/api/notifications/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        ...notificationData
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create notification');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}















export async function createNewCommentNotification(
  commentOwnerId: string,
  commenterUsername: string,
  mangaId: string,
  chapterId?: string,
  commentId?: string
) {
  try {
    await createNotification(commentOwnerId, {
      type: 'system',
      title: 'Bình luận mới',
      message: `${commenterUsername} đã đăng bình luận mới`,
      data: {
        mangaId,
        chapterId,
        commentId
      }
    });
  } catch (error) {
    console.error('Error creating new comment notification:', error);
  }
}







export async function createCommentReplyNotification(
  commentOwnerId: string, 
  replyAuthorId: string, 
  replyAuthorUsername: string,
  mangaId: string,
  chapterId?: string,
  commentId?: string
) {
  if (commentOwnerId === replyAuthorId) return; // Don't notify self
  
  try {
    await createNotification(commentOwnerId, {
      type: 'system',
      title: 'Phản hồi mới',
      message: `${replyAuthorUsername} đã phản hồi bình luận của bạn`,
      data: {
        mangaId,
        chapterId,
        commentId,
        fromUser: replyAuthorId
      }
    });
  } catch (error) {
    console.error('Error creating comment reply notification:', error);
  }
}






