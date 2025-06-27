
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type Counter } from '../schema';

export async function getCounter(): Promise<Counter> {
  try {
    // First, try to get an existing counter
    const existingCounters = await db.select()
      .from(countersTable)
      .limit(1)
      .execute();

    if (existingCounters.length > 0) {
      return existingCounters[0];
    }

    // If no counter exists, create one with default value 0
    const result = await db.insert(countersTable)
      .values({
        value: 0
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Get counter failed:', error);
    throw error;
  }
}
