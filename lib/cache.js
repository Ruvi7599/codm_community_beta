// Simple in-memory cache to persist client-side state across navigations
export const appCache = {
  feedPosts: null,
  feedPage: 1,
  feedHasMore: true,
  activeUsers: null,
  
  // Messages Cache
  messagesContacts: null,
  messagesUnreadCounts: null,
  activeChats: {}, // { [chatId]: { messages: [], hasMore: boolean } }
};
