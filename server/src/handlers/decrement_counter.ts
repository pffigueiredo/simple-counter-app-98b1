
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type Counter } from '../schema';
import { eq, sql } from 'drizzle-orm';

export async function decrementCounter(): Promise<Counter> {
  try {
    // First, try to get existing counter
    const existingCounters = await db.select()
      .from(countersTable)
      .limit(1)
      .execute();

    let result;
    
    if (existingCounters.length === 0) {
      // No counter exists, create one with value -1
      const insertResult = await db.insert(countersTable)
        .values({
          value: -1
        })
        .returning()
        .execute();
      
      result = insertResult[0];
    } else {
      // Counter exists, decrement it
      const updateResult = await db.update(countersTable)
        .set({
          value: sql`${countersTable.value} - 1`,
          updated_at: sql`now()`
        })
        .where(eq(countersTable.id, existingCounters[0].id))
        .returning()
        .execute();
      
      result = updateResult[0];
    }

    return {
      id: result.id,
      value: result.value,
      updated_at: result.updated_at
    };
  } catch (error) {
    console.error('Counter decrement failed:', error);
    throw error;
  }
}
