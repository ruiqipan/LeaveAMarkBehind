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

    console.log('Starting snapshot generation...');

    // Get all active marks from the last 24 hours
    const { data: recentMarks, error: marksError } = await supabase
      .from('marks')
      .select('*')
      .eq('is_active', true)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (marksError) {
      console.error('Error fetching marks:', marksError);
      throw marksError;
    }

    console.log(`Found ${recentMarks?.length || 0} active marks`);

    if (!recentMarks || recentMarks.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active marks to snapshot', snapshots_created: 0 }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Group marks by location cluster (round to 0.001 degrees ≈ 100m)
    const locationClusters = new Map();

    for (const mark of recentMarks) {
      const roundedLat = Math.round(mark.latitude * 1000) / 1000;
      const roundedLng = Math.round(mark.longitude * 1000) / 1000;
      const clusterId = `${roundedLat}_${roundedLng}`;

      if (!locationClusters.has(clusterId)) {
        locationClusters.set(clusterId, []);
      }

      locationClusters.get(clusterId).push(mark);
    }

    console.log(`Grouped into ${locationClusters.size} location clusters`);

    const snapshotsToCreate = [];
    const today = new Date().toISOString().split('T')[0];

    // Process each location cluster
    for (const [clusterId, marks] of locationClusters.entries()) {
      // Calculate engagement score for each mark
      const marksWithEngagement = marks.map((mark) => ({
        ...mark,
        engagement: (mark.view_count || 0) + (mark.add_count || 0) * 2,
      }));

      // Separate by type
      const textMarks = marksWithEngagement.filter((m) => m.type === 'text');
      const audioMarks = marksWithEngagement.filter((m) => m.type === 'audio');
      const imageMarks = marksWithEngagement.filter((m) => m.type === 'image');

      // Sort by engagement and take top 5
      const topTexts = textMarks
        .sort((a, b) => b.engagement - a.engagement)
        .slice(0, 5)
        .map((m) => m.id);

      const topAudios = audioMarks
        .sort((a, b) => b.engagement - a.engagement)
        .slice(0, 5)
        .map((m) => m.id);

      const images = imageMarks.map((m) => m.id);

      // Only create snapshot if there's content
      if (topTexts.length > 0 || topAudios.length > 0 || images.length > 0) {
        snapshotsToCreate.push({
          location_cluster_id: clusterId,
          snapshot_date: today,
          top_texts: topTexts,
          top_audios: topAudios,
          images: images,
        });
      }
    }

    console.log(`Creating ${snapshotsToCreate.length} snapshots`);

    // Insert snapshots (upsert to handle duplicates)
    if (snapshotsToCreate.length > 0) {
      const { error: insertError } = await supabase
        .from('snapshots')
        .upsert(snapshotsToCreate, {
          onConflict: 'location_cluster_id,snapshot_date',
          ignoreDuplicates: false,
        });

      if (insertError) {
        console.error('Error inserting snapshots:', insertError);
        throw insertError;
      }
    }

    console.log('Snapshot generation complete');

    return new Response(
      JSON.stringify({
        message: 'Snapshots generated successfully',
        snapshots_created: snapshotsToCreate.length,
        locations_processed: locationClusters.size,
        total_marks: recentMarks.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in snapshot generation:', error);

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
