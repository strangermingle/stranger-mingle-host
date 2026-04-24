/**
 * Real chat utilities using Supabase RPCs and realtime
 */

/**
 * Generate a unique anonymous ID for chat users
 */
export const generateAnonymousId = (): string => `anon_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

/**
 * Generate a unique session ID
 */
export const generateSessionId = (): string => `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

/**
 * Simple chat session management using localStorage
 */
export interface ChatSession {
  sessionId: string;
  userAAnonymousId: string;
  userBAnonymousId: string | null;
  userChoice: 'global' | 'local';
  status: 'waiting' | 'active' | 'ended';
  messages: any[];
  createdAt: string;
  lastPing: string;
}

/**
 * Create a new chat session in localStorage
 */
export const createChatSession = async (
  supabase: any,
  userChoice: 'global' | 'local',
  userAAnonymousId: string,
  userLocation?: { lat: number; lng: number }
): Promise<{ sessionId: string; userAAnonymousId: string }> => {
  const { data, error } = await supabase.rpc('rpc_create_session', {
    p_user_a_anonymous_id: userAAnonymousId,
    p_connection_type: userChoice,
    p_user_lat: userLocation?.lat ?? null,
    p_user_lng: userLocation?.lng ?? null
  });
  if (error) throw error;
  const sessionId = data as string;
  return { sessionId, userAAnonymousId };
};

/**
 * Get current session from localStorage
 */
export const getCurrentSession = (): ChatSession | null => {
  const stored = localStorage.getItem('chat_session');
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

/**
 * Update session in localStorage
 */
export const updateSession = (session: ChatSession): void => {
  localStorage.setItem('chat_session', JSON.stringify(session));
};

/**
 * Add a message to the current session
 */
export const addMessageToSession = (message: any): void => {
  const session = getCurrentSession();
  if (session) {
    session.messages.push({
      ...message,
      id: message.id || Date.now(),
      timestamp: message.timestamp || new Date().toISOString()
    });
    updateSession(session);
  }
};

/**
 * Get messages for current session
 */
export const getSessionMessages = (sessionId: string): any[] => {
  const session = getCurrentSession();
  if (session && session.sessionId === sessionId) {
    return session.messages;
  }
  return [];
};

/**
 * End current session
 */
export const endCurrentSession = async (supabase: any, sessionId: string, actorAnonymousId: string): Promise<void> => {
  await supabase.rpc('rpc_end_session', { p_session_id: sessionId, p_actor_anonymous_id: actorAnonymousId });
};

/**
 * Send chat message (stores locally)
 */
export const sendChatMessage = async (
  supabase: any,
  sessionId: string,
  senderAnonymousId: string,
  messageText: string
): Promise<string> => {
  const { data, error } = await supabase.rpc('rpc_send_message', {
    p_session_id: sessionId,
    p_sender_anonymous_id: senderAnonymousId,
    p_message_text: messageText
  });
  if (error) throw error;
  return data as string;
};

/**
 * Send system message
 */
export const sendSystemMessage = (
  sessionId: string,
  messageText: string
): void => {
  const message = {
    session_id: sessionId,
    sender_anonymous_id: 'system',
    message_text: messageText,
    message_type: 'system',
    timestamp: new Date().toISOString()
  };
  addMessageToSession(message);
};

/**
 * Clean up ended sessions
 */
export const cleanupEndedSessions = (): void => {
  const session = getCurrentSession();
  if (session && session.status === 'ended') {
    localStorage.removeItem('chat_session');
  }
};

/**
 * Clean up stale sessions
 */
export const cleanupStaleSessions = (): void => {
  const session = getCurrentSession();
  if (session) {
    const lastPing = new Date(session.lastPing);
    const now = new Date();
    const diff = now.getTime() - lastPing.getTime();
    
    // Clean up if last ping was more than 30 seconds ago
    if (diff > 30000 && session.status === 'waiting') {
      session.status = 'ended';
      updateSession(session);
    }
  }
};

/**
 * Heartbeat session
 */
export const heartbeatSession = async (supabase: any, sessionId: string, actorAnonymousId: string): Promise<boolean> => {
  const { data } = await supabase.rpc('rpc_heartbeat', { p_session_id: sessionId, p_actor_anonymous_id: actorAnonymousId });
  return data === true;
};

/**
 * Connect to a session (simulated)
 */
export const connectToSession = async (
  supabase: any,
  sessionId: string,
  userBAnonymousId: string,
  userBLocation?: { lat: number; lng: number }
): Promise<boolean> => {
  const { data, error } = await supabase.rpc('rpc_join_waiting_session', {
    p_session_id: sessionId,
    p_user_b_anonymous_id: userBAnonymousId,
    p_user_b_lat: userBLocation?.lat ?? null,
    p_user_b_lng: userBLocation?.lng ?? null
  });
  if (error) throw error;
  return data === true;
};

/**
 * Find matching user (simulated - returns null for now)
 */
export const findMatchingUser = async (
  supabase: any,
  userChoice: 'global' | 'local',
  userLocation?: { lat: number; lng: number },
  excludeAnonymousId?: string
): Promise<any> => {
  if (userChoice === 'global') {
    // Exclude my own waiting session
    const { data } = await supabase.rpc('find_waiting_session_global', {
      p_exclude_anonymous_id: excludeAnonymousId || null
    });
    return Array.isArray(data) ? data[0] ?? null : data ?? null;
  }
  if (userChoice === 'local' && userLocation) {
    const radiusSteps = [10, 20, 30, 40, 50];
    for (const r of radiusSteps) {
      const { data } = await supabase.rpc('find_users_within_radius', {
        user_lat: userLocation.lat,
        user_lng: userLocation.lng,
        radius_km: r
      });
      if (data?.length) return data[0];
    }
  }
  return null;
};

/**
 * Subscribe to session messages (simulated - uses polling)
 */
export const subscribeToSessionMessages = (
  supabase: any,
  sessionId: string,
  onMessage: (message: any) => void,
  onError?: (error: any) => void
) => {
  const seen = new Set<string>();
  
  // Robust guard for realtime
  if (typeof window === 'undefined' || typeof globalThis.WebSocket === 'undefined' || !globalThis.WebSocket) {
    if (onError) onError('WebSocket not available');
    return { unsubscribe: () => {} };
  }

  const channel = supabase
    .channel(`chat:${sessionId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `session_id=eq.${sessionId}` }, (payload: any) => {
      const id = payload?.new?.id;
      if (!id || seen.has(id)) return;
      seen.add(id);
      onMessage(payload.new);
    })
    .subscribe((status: any) => {
      if (status !== 'SUBSCRIBED' && onError) onError(status);
    });
  return { unsubscribe: () => channel.unsubscribe() };
};

/**
 * Subscribe to session status updates (simulated)
 */
export const subscribeToSessionStatus = (
  supabase: any,
  sessionId: string,
  onStatus: (status: 'waiting' | 'active' | 'ended') => void,
  onError?: (error: any) => void
) => {

  // Robust guard for realtime
  if (typeof window === 'undefined' || typeof globalThis.WebSocket === 'undefined' || !globalThis.WebSocket) {
    if (onError) onError('WebSocket not available');
    return { unsubscribe: () => {} };
  }

  const channel = supabase
    .channel(`chat_status:${sessionId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'chat_sessions', filter: `session_id=eq.${sessionId}` },
      (payload: any) => {
        const s = payload?.new?.status;
        if (s) onStatus(s);
      }
    )
    .subscribe((status: any) => {
      if (status !== 'SUBSCRIBED' && onError) onError(status);
    });
  return { unsubscribe: () => channel.unsubscribe() };
};
