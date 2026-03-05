/**
 * Drafts Service - Supabase operations for saving/loading calculator projects
 */

import { supabase } from './supabase';
import type { PortfolioProject } from '../types/portfolio';

// Database row type matching Supabase `drafts` table
interface DraftRow {
  id: string;
  user_id: string;
  name: string;
  calculator_type: string;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Convert database row to PortfolioProject
 */
function rowToProject(row: DraftRow): PortfolioProject {
  // Spread stored data first, then override with explicit columns
  return {
    // Default values for required fields
    location: '',
    totalInvestment: 0,
    roi: 0,
    avgCashFlow: 0,
    breakEvenMonths: 0,
    investmentScore: 0,
    currency: 'IDR',
    // Spread all stored data (includes these values if saved)
    ...row.data,
    // Override with explicit column values
    id: row.id,
    calculatorId: row.calculator_type,
    projectName: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // Raw calculator data for editing/comparing
    data: row.data.data || row.data,
  };
}

/**
 * Convert PortfolioProject to database row format
 */
function projectToRow(project: PortfolioProject, userId: string): Omit<DraftRow, 'id' | 'created_at' | 'updated_at'> {
  // Extract the fields that go into separate columns
  const { id, calculatorId, projectName, createdAt, updatedAt, ...data } = project;

  return {
    user_id: userId,
    name: projectName,
    calculator_type: calculatorId,
    data: {
      ...data,
      // Store original id for reference
      originalId: id,
    },
  };
}

/**
 * Fetch all drafts for a user
 */
export async function fetchUserDrafts(userId: string): Promise<{ data: PortfolioProject[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('drafts')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    const projects = (data as DraftRow[]).map(rowToProject);
    return { data: projects, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

/**
 * Create a new draft
 */
export async function createDraft(
  project: Omit<PortfolioProject, 'id' | 'createdAt' | 'updatedAt'>,
  userId: string
): Promise<{ data: PortfolioProject | null; error: Error | null }> {
  try {
    const row = projectToRow(project as PortfolioProject, userId);

    const { data, error } = await supabase
      .from('drafts')
      .insert(row)
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: rowToProject(data as DraftRow), error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

/**
 * Update an existing draft
 */
export async function updateDraft(
  id: string,
  updates: Partial<PortfolioProject>,
  userId: string
): Promise<{ data: PortfolioProject | null; error: Error | null }> {
  try {
    // Fetch current draft first to merge data
    const { data: current, error: fetchError } = await supabase
      .from('drafts')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      return { data: null, error: new Error(fetchError.message) };
    }

    const currentRow = current as DraftRow;

    // Merge updates
    const updatePayload: Partial<DraftRow> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.projectName) {
      updatePayload.name = updates.projectName;
    }
    if (updates.calculatorId) {
      updatePayload.calculator_type = updates.calculatorId;
    }

    // Merge data fields
    const { id: _, calculatorId, projectName, createdAt, updatedAt, ...dataUpdates } = updates;
    if (Object.keys(dataUpdates).length > 0) {
      updatePayload.data = {
        ...currentRow.data,
        ...dataUpdates,
      };
    }

    const { data, error } = await supabase
      .from('drafts')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: rowToProject(data as DraftRow), error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

/**
 * Delete a draft
 */
export async function deleteDraft(
  id: string,
  userId: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('drafts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
}

/**
 * Get a single draft by ID
 */
export async function getDraftById(
  id: string,
  userId: string
): Promise<{ data: PortfolioProject | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('drafts')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: rowToProject(data as DraftRow), error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}
