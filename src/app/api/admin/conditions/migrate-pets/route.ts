import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';
import { createClient } from '@supabase/supabase-js';

/**
 * Migration endpoint to update pet conditions to use 'pets' category
 */
export async function POST(request: NextRequest) {
  try {
    const authError = requireAdminAuth(request);
    if (authError) return authError;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // First, get all conditions that should be in the pets category
    const petSlugs = [
      // Dog conditions
      'dog-anxiety', 'dog-pain', 'dog-arthritis', 'dog-seizures',
      'dog-separation-anxiety', 'dog-thunderstorm', 'dog-appetite',
      'dog-nausea', 'dog-allergies', 'dog-hip-dysplasia', 'senior-dogs',
      'puppies', 'aggressive-dogs',
      // Cat conditions
      'cat-anxiety', 'cat-pain', 'cat-arthritis', 'cat-seizures',
      'cat-appetite', 'cat-aggression', 'cat-kidney', 'cat-hyperthyroid',
      'cat-cancer', 'cat-stomatitis', 'senior-cats',
      // Horse conditions
      'horse-anxiety', 'horse-performance', 'horse-ulcers',
      'horse-laminitis', 'horse-cushings', 'horse-navicular',
      // Small pets
      'ferrets', 'hamsters', 'rabbits', 'guinea-pigs', 'reptiles', 'small-pets',
      // Birds
      'birds', 'bird-anxiety', 'feather-plucking', 'parrots',
      // General pet conditions
      'veterinary', 'senior-pets', 'pet-travel', 'pet-fireworks'
    ];

    // Update conditions with explicit slugs
    const { data: updatedBySlug, error: slugError } = await supabase
      .from('kb_conditions')
      .update({ category: 'pets' })
      .in('slug', petSlugs)
      .select('slug');

    if (slugError) {
      console.error('[Migrate Pets] Slug update error:', slugError);
      return NextResponse.json({ error: slugError.message }, { status: 500 });
    }

    // Also update any conditions with slugs starting with dog-, cat-, horse-, bird-, pet-
    const { data: updatedByPattern, error: patternError } = await supabase
      .from('kb_conditions')
      .update({ category: 'pets' })
      .or('slug.like.dog-%,slug.like.cat-%,slug.like.horse-%,slug.like.bird-%,slug.like.pet-%')
      .select('slug');

    if (patternError) {
      console.error('[Migrate Pets] Pattern update error:', patternError);
    }

    // Get final count of pet conditions
    const { count } = await supabase
      .from('kb_conditions')
      .select('*', { count: 'exact', head: true })
      .eq('category', 'pets');

    return NextResponse.json({
      success: true,
      message: 'Pet conditions updated to pets category',
      updatedBySlug: updatedBySlug?.length || 0,
      updatedByPattern: updatedByPattern?.length || 0,
      totalPetConditions: count || 0,
      updatedSlugs: [...(updatedBySlug || []), ...(updatedByPattern || [])].map(c => c.slug)
    });

  } catch (error) {
    console.error('[Migrate Pets] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  return NextResponse.json({
    endpoint: '/api/admin/conditions/migrate-pets',
    method: 'POST',
    description: 'Update all pet-related conditions to use the pets category'
  });
}
