'use server';

import { supabase } from "@/lib/supabase";

export async function testSupabaseConnection() {
  try {
    // Test basic query
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });

    if (testError) {
      return {
        success: false,
        message: 'Supabase connection test failed',
        error: testError.message,
      };
    }

    // Test PostGIS extension
    const { data: postgisData, error: postgisError } = await supabase.rpc('postgis_version');

    if (postgisError) {
      return {
        success: false,
        message: 'PostGIS extension not working',
        error: postgisError.message,
      };
    }

    return {
      success: true,
      message: 'Supabase and PostGIS are working correctly!',
      data: {
        profilesCount: testData,
        postgisVersion: postgisData,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: 'Unexpected error occurred',
      error: (error as Error).message,
    };
  }
}
