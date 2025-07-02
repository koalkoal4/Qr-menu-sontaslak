import { RealtimePostgresChangesPayload, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

export const subscribeToRealtimeUpdates = (supabase: SupabaseClient, table: string, callback: (payload: RealtimePostgresChangesPayload<any>) => void): RealtimeChannel => {
  const channel = supabase.channel(`realtime-${table}`).on('postgres_changes', { event: '*', schema: 'public', table }, callback).subscribe();
  return channel;
};

export const unsubscribeFromRealtimeUpdates = (supabase: SupabaseClient, subscription: RealtimeChannel) => {
  if (subscription) supabase.removeChannel(subscription);
};