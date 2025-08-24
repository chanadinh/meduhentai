'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  MessageCircle, 
  Send, 
  Edit3, 
  Trash2, 
  ThumbsUp, 
  ThumbsDown,
  Reply
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Comment {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
    role: string;
  };
  content: string;
  createdAt: string;
  isEdited: boolean;
  isDeleted: boolean;
  likes: string[];
  dislikes: string[];
  replies: Comment[];
}

interface CommentsProps {
  mangaId: string;
  chapterId?: string;
}

export default function Comments({ mangaId, chapterId }: CommentsProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'liked' | 'disliked'>('recent');

  useEffect(() => {
    fetchComments();
  }, [mangaId, chapterId, sortBy]);

  const fetchComments = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await fetch(
        `/api/comments?mangaId=${mangaId}&chapterId=${chapterId}&page=${pageNum}&limit=3&sortBy=${sortBy}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      
      const data = await response.json();
      
      if (append) {
        setComments(prev => [...prev, ...data.comments]);
      } else {
        setComments(data.comments);
      }
      
      setHasMore(data.hasNextPage);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Không thể tải bình luận');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      fetchComments(page + 1, true);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    try {
      setSubmitting(true);
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment.trim(),
          mangaId,
          chapterId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit comment');
      }

      const data = await response.json();
      
      // Add new comment to the beginning
      setComments(prev => [data.comment, ...prev]);
      setNewComment('');
      
      toast.success('Bình luận đã được đăng!');
      
      // Create notification for new comment
      if (session?.user?.id) {
        try {
          await fetch('/api/notifications/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'new_comment',
              userId: data.comment.user._id,
              title: 'Bình luận mới',
              message: `${session.user.username || 'User'} đã bình luận về manga của bạn`,
              data: {
                mangaId,
                chapterId,
                commentId: data.comment._id,
                fromUser: session.user.id
              }
            }),
          });
        } catch (error) {
          console.error('Error creating new comment notification:', error);
        }
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Không thể đăng bình luận');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editContent.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update comment');
      }

      const data = await response.json();
      
      setComments(prev => prev.map(comment => 
        comment._id === commentId 
          ? { ...comment, content: data.comment.content, isEdited: true }
          : comment
      ));
      
      setEditingComment(null);
      setEditContent('');
      toast.success('Bình luận đã được cập nhật!');
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Không thể cập nhật bình luận');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      setComments(prev => prev.filter(comment => comment._id !== commentId));
      toast.success('Bình luận đã được xóa!');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Không thể xóa bình luận');
    }
  };

  const handleReaction = async (commentId: string, reactionType: 'like' | 'dislike') => {
    if (!session) {
      toast.error('Vui lòng đăng nhập để thích/bỏ thích bình luận');
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reactionType }),
      });

      if (!response.ok) {
        throw new Error('Failed to update reaction');
      }

      const data = await response.json();
      
      setComments(prev => prev.map(comment => 
        comment._id === commentId 
          ? { 
              ...comment, 
              likes: data.likes, 
              dislikes: data.dislikes 
            }
          : comment
      ));
    } catch (error) {
      console.error('Error updating reaction:', error);
      toast.error('Không thể cập nhật phản ứng');
    }
  };

  const handleReply = async (commentId: string) => {
    if (!replyContent.trim() || submittingReply) return;

    try {
      setSubmittingReply(true);
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: replyContent.trim(),
          mangaId,
          chapterId,
          parentComment: commentId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit reply');
      }

      const data = await response.json();
      
      // Add reply to the parent comment
      setComments(prev => prev.map(comment => 
        comment._id === commentId 
          ? { ...comment, replies: [...comment.replies, data.comment] }
          : comment
      ));
      
      setReplyingTo(null);
      setReplyContent('');
      toast.success('Phản hồi đã được đăng!');
      
      // Create notification for the parent comment owner
      if (session?.user?.id) {
        const parentComment = comments.find(c => c._id === commentId);
        if (parentComment) {
          try {
            await fetch('/api/notifications/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'comment_reply',
                userId: parentComment.user._id,
                title: 'Phản hồi mới',
                message: `${session?.user?.username || 'User'} đã phản hồi bình luận của bạn`,
                data: {
                  mangaId,
                  chapterId,
                  commentId,
                  fromUser: session?.user?.id
                }
              }),
            });
          } catch (error) {
            console.error('Error creating notification:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      toast.error('Không thể đăng phản hồi');
    } finally {
      setSubmittingReply(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    return commentDate.toLocaleDateString('vi-VN');
  };

  const canModifyComment = (comment: Comment) => {
    return session?.user?.id === comment.user._id || session?.user?.role === 'admin';
  };

  const canModifyReply = (reply: Comment) => {
    return session?.user?.id === reply.user._id || session?.user?.role === 'admin';
  };

  if (!session) {
    return (
      <div className="bg-white rounded-lg p-6 border border-dark-200">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-dark-300" />
          <h3 className="text-lg font-semibold text-dark-900 mb-2">
            Đăng nhập để bình luận
          </h3>
          <p className="text-dark-600 mb-4">
            Bạn cần đăng nhập để xem và thêm bình luận
          </p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-full font-medium transition-all duration-200"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-dark-200">
      {/* Comment Form */}
      <div className="mb-6">
        <h3 className="font-semibold text-dark-900 mb-4">
          Thêm bình luận
        </h3>
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Viết bình luận của bạn..."
            className="w-full p-3 border border-dark-200 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={3}
            disabled={submitting}
          />
          <div className="flex justify-between items-center">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {submitting ? 'Đang đăng...' : 'Đăng bình luận'}
            </button>
          </div>
        </form>
      </div>

      {/* Sort Options */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-semibold text-dark-900">
          Bình luận ({comments.length})
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-dark-600">Sắp xếp:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'recent' | 'liked' | 'disliked')}
            className="text-sm border border-dark-200 rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="recent">Mới nhất</option>
            <option value="liked">Nhiều thích nhất</option>
            <option value="disliked">Nhiều không thích nhất</option>
          </select>
        </div>
      </div>
      
      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-dark-500 bg-white rounded-lg border border-dark-200">
            <MessageCircle className="h-12 w-12 mx-auto mb-2 text-dark-300" />
            <p>Chưa có bình luận nào</p>
          </div>
        ) : (
          <>
            {comments.map((comment) => (
              <div key={comment._id} className="bg-white rounded-lg p-4 border border-dark-200">
                <div className="flex items-start space-x-3">
                  <img
                    src={comment.user.avatar || '/medusa.ico'}
                    alt={comment.user.username}
                    className="h-10 w-10 rounded-full border-2 border-dark-200"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-dark-900">
                        {comment.user.username}
                      </span>
                      {comment.user.role === 'admin' && (
                        <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full">
                          Admin
                        </span>
                      )}
                      <span className="text-sm text-dark-500">
                        {formatTimeAgo(comment.createdAt)}
                      </span>
                      {comment.isEdited && (
                        <span className="text-xs text-dark-400">(đã chỉnh sửa)</span>
                      )}
                    </div>
                    
                    <p className="text-dark-700 mb-3">{comment.content}</p>
                    
                    {/* Comment Actions */}
                    <div className="flex items-center space-x-4 text-sm">
                      <button
                        onClick={() => handleReaction(comment._id, 'like')}
                        className={`flex items-center space-x-1 ${
                          comment.likes.includes(session?.user?.id || '')
                            ? 'text-primary-600'
                            : 'text-dark-500 hover:text-primary-600'
                        }`}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>{comment.likes.length}</span>
                      </button>
                      
                      <button
                        onClick={() => handleReaction(comment._id, 'dislike')}
                        className={`flex items-center space-x-1 ${
                          comment.dislikes.includes(session?.user?.id || '')
                            ? 'text-red-600'
                            : 'text-dark-500 hover:text-red-600'
                        }`}
                      >
                        <ThumbsDown className="h-4 w-4" />
                        <span>{comment.dislikes.length}</span>
                      </button>
                      
                      <button
                        onClick={() => setReplyingTo(comment._id)}
                        className="flex items-center space-x-1 text-dark-500 hover:text-primary-600"
                      >
                        <Reply className="h-4 w-4" />
                        <span>Phản hồi</span>
                      </button>
                      
                      {canModifyComment(comment) && (
                        <>
                          <button
                            onClick={() => {
                              setEditingComment(comment._id);
                              setEditContent(comment.content);
                            }}
                            className="text-dark-500 hover:text-primary-600"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="text-dark-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                    
                    {/* Reply Form */}
                    {replyingTo === comment._id && (
                      <div className="mt-4 pl-4 border-l-2 border-primary-200">
                        <form onSubmit={(e) => { e.preventDefault(); handleReply(comment._id); }} className="space-y-3">
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Viết phản hồi..."
                            className="w-full p-2 border border-dark-200 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            rows={2}
                            disabled={submittingReply}
                          />
                          <div className="flex items-center space-x-2">
                            <button
                              type="submit"
                              disabled={!replyContent.trim() || submittingReply}
                              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                            >
                              <Send className="h-3 w-3" />
                              {submittingReply ? 'Đang đăng...' : 'Đăng phản hồi'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyContent('');
                              }}
                              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-medium transition-all duration-200 text-sm"
                            >
                              Hủy
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                    
                    {/* Edit Form */}
                    {editingComment === comment._id && (
                      <div className="mt-4">
                        <form onSubmit={(e) => { e.preventDefault(); handleEditComment(comment._id); }} className="space-y-3">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full p-2 border border-dark-200 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            rows={3}
                          />
                          <div className="flex items-center space-x-2">
                            <button
                              type="submit"
                              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full font-medium transition-all duration-200 text-sm flex items-center gap-2"
                            >
                              <Edit3 className="h-3 w-3" />
                              Cập nhật
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingComment(null);
                                setEditContent('');
                              }}
                              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-medium transition-all duration-200 text-sm"
                            >
                              Hủy
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                    
                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {comment.replies.map((reply) => (
                          <div key={reply._id} className="pl-4 border-l-2 border-primary-200">
                            <div className="flex items-start space-x-3">
                              <img
                                src={reply.user.avatar || '/medusa.ico'}
                                alt={reply.user.username}
                                className="h-8 w-8 rounded-full border-2 border-dark-200"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="font-medium text-dark-900">
                                    {reply.user.username}
                                  </span>
                                  {reply.user.role === 'admin' && (
                                    <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full">
                                      Admin
                                    </span>
                                  )}
                                  <span className="text-sm text-dark-500">
                                    {formatTimeAgo(reply.createdAt)}
                                  </span>
                                  {reply.isEdited && (
                                    <span className="text-xs text-dark-400">(đã chỉnh sửa)</span>
                                  )}
                                </div>
                                
                                <p className="text-dark-700 mb-2">{reply.content}</p>
                                
                                {/* Reply Actions */}
                                <div className="flex items-center space-x-4 text-sm">
                                  <button
                                    onClick={() => handleReaction(reply._id, 'like')}
                                    className={`flex items-center space-x-1 ${
                                      reply.likes.includes(session?.user?.id || '')
                                        ? 'text-primary-600'
                                        : 'text-dark-500 hover:text-primary-600'
                                    }`}
                                  >
                                    <ThumbsUp className="h-4 w-4" />
                                    <span>{reply.likes.length}</span>
                                  </button>
                                  
                                  <button
                                    onClick={() => handleReaction(reply._id, 'dislike')}
                                    className={`flex items-center space-x-1 ${
                                      reply.dislikes.includes(session?.user?.id || '')
                                        ? 'text-red-600'
                                        : 'text-dark-500 hover:text-red-600'
                                    }`}
                                  >
                                    <ThumbsDown className="h-4 w-4" />
                                    <span>{reply.dislikes.length}</span>
                                  </button>
                                  
                                  {canModifyReply(reply) && (
                                    <>
                                      <button
                                        onClick={() => {
                                          setEditingComment(reply._id);
                                          setEditContent(reply.content);
                                        }}
                                        className="text-dark-500 hover:text-primary-600"
                                      >
                                        <Edit3 className="h-4 w-4" />
                                      </button>
                                      
                                      <button
                                        onClick={() => handleDeleteComment(reply._id)}
                                        className="text-dark-500 hover:text-red-600"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Show More Button */}
            {hasMore && (
              <div className="text-center pt-6">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-3 bg-white hover:bg-gray-50 text-purple-600 border-2 border-purple-200 hover:border-purple-300 rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                      <span>Đang tải...</span>
                    </div>
                  ) : (
                    'Xem thêm bình luận'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
