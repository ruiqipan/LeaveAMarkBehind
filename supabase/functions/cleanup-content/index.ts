import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    console.log('Starting content cleanup...');

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Deactivate marks older than 24 hours
    const { data: deactivatedMarks, error: deactivateError } = await supabase
      .from('marks')
      .update({ is_active: false })
      .eq('is_active', true)
      .lt('created_at', twentyFourHoursAgo.toISOString())
      .select('id');

    if (deactivateError) {
      console.error('Error deactivating marks:', deactivateError);
      throw deactivateError;
    }

    const deactivatedCount = deactivatedMarks?.length || 0;
    console.log(`Deactivated ${deactivatedCount} marks`);

    // Delete expired snapshots (older than 36 hours from creation)
    const { data: deletedSnapshots, error: deleteError } = await supabase
      .from('snapshots')
      .delete()
      .lt('expires_at', now.toISOString())
      .select('id');

    if (deleteError) {
      console.error('Error deleting snapshots:', deleteError);
      throw deleteError;
    }

    const deletedSnapshotsCount = deletedSnapshots?.length || 0;
    console.log(`Deleted ${deletedSnapshotsCount} expired snapshots`);

    // Optional: Clean up old mark_views (keep last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const { data: deletedViews, error: viewsError } = await supabase
      .from('mark_views')
      .delete()
      .lt('viewed_at', sevenDaysAgo.toISOString())
      .select('id');

    if (viewsError) {
      console.error('Error cleaning up views:', viewsError);
      // Don't throw - this is optional cleanup
    }

    const deletedViewsCount = deletedViews?.length || 0;
    console.log(`Cleaned up ${deletedViewsCount} old mark views`);

    console.log('Content cleanup complete');

    return new Response(
      JSON.stringify({
        message: 'Content cleanup completed successfully',
        marks_deactivated: deactivatedCount,
        snapshots_deleted: deletedSnapshotsCount,
        views_cleaned: deletedViewsCount,
        timestamp: now.toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in content cleanup:', error);

    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.toString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
