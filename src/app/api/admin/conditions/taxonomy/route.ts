import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface ConditionNode {
  id: string;
  slug: string;
  name: string;
  level: number;
  icon: string | null;
  description: string | null;
  studyCount: number;
  humanStudyCount: number;
  hasPage: boolean;
  pageThreshold: number;
  meshIds: string[] | null;
  openalexIds: string[] | null;
  synonyms: string[] | null;
  children: ConditionNode[];
}

/**
 * GET /api/admin/conditions/taxonomy
 * Returns the condition taxonomy as a hierarchical tree with study counts
 */
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch all conditions
    const { data: conditions, error } = await supabase
      .from('condition_taxonomy')
      .select('*')
      .eq('enabled', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!conditions || conditions.length === 0) {
      return NextResponse.json({ tree: [], stats: { total: 0, withStudies: 0, categories: 0 } });
    }

    // Build tree structure
    const nodeMap = new Map<string, ConditionNode>();
    const rootNodes: ConditionNode[] = [];

    // First pass: create all nodes
    for (const condition of conditions) {
      const node: ConditionNode = {
        id: condition.id,
        slug: condition.slug,
        name: condition.name,
        level: condition.level,
        icon: condition.icon,
        description: condition.description,
        studyCount: condition.study_count || 0,
        humanStudyCount: condition.human_study_count || 0,
        hasPage: condition.has_page || false,
        pageThreshold: condition.page_threshold || 10,
        meshIds: condition.mesh_ids,
        openalexIds: condition.openalex_ids,
        synonyms: condition.synonyms,
        children: []
      };
      nodeMap.set(condition.id, node);
    }

    // Second pass: build hierarchy
    for (const condition of conditions) {
      const node = nodeMap.get(condition.id)!;
      if (condition.parent_id && nodeMap.has(condition.parent_id)) {
        nodeMap.get(condition.parent_id)!.children.push(node);
      } else if (condition.level === 1) {
        rootNodes.push(node);
      }
    }

    // Sort children by study count (descending), then by name
    const sortChildren = (nodes: ConditionNode[]) => {
      nodes.sort((a, b) => {
        if (b.studyCount !== a.studyCount) return b.studyCount - a.studyCount;
        return a.name.localeCompare(b.name);
      });
      for (const node of nodes) {
        if (node.children.length > 0) {
          sortChildren(node.children);
        }
      }
    };
    sortChildren(rootNodes);

    // Calculate stats
    const stats = {
      total: conditions.length,
      categories: conditions.filter(c => c.level === 1).length,
      withStudies: conditions.filter(c => (c.study_count || 0) > 0).length,
      readyForPages: conditions.filter(c =>
        (c.study_count || 0) >= (c.page_threshold || 10) && !c.has_page
      ).length
    };

    return NextResponse.json({ tree: rootNodes, stats });

  } catch (error) {
    console.error('[Taxonomy API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
