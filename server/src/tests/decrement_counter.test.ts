
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { countersTable } from '../db/schema';
import { decrementCounter } from '../handlers/decrement_counter';
import { eq } from 'drizzle-orm';

describe('decrementCounter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create counter with value -1 when no counter exists', async () => {
    const result = await decrementCounter();

    expect(result.id).toBeDefined();
    expect(result.value).toEqual(-1);
    expect(result.updated_at).toBeInstanceOf(Date);

    // Verify counter was saved to database
    const counters = await db.select()
      .from(countersTable)
      .where(eq(countersTable.id, result.id))
      .execute();

    expect(counters).toHaveLength(1);
    expect(counters[0].value).toEqual(-1);
  });

  it('should decrement existing counter by 1', async () => {
    // Create initial counter with value 5
    const initialCounter = await db.insert(countersTable)
      .values({ value: 5 })
      .returning()
      .execute();

    const result = await decrementCounter();

    expect(result.id).toEqual(initialCounter[0].id);
    expect(result.value).toEqual(4);
    expect(result.updated_at).toBeInstanceOf(Date);

    // Verify counter was updated in database
    const counters = await db.select()
      .from(countersTable)
      .where(eq(countersTable.id, result.id))
      .execute();

    expect(counters).toHaveLength(1);
    expect(counters[0].value).toEqual(4);
  });

  it('should handle negative values correctly', async () => {
    // Create counter with value -2
    const initialCounter = await db.insert(countersTable)
      .values({ value: -2 })
      .returning()
      .execute();

    const result = await decrementCounter();

    expect(result.value).toEqual(-3);

    // Verify in database
    const counters = await db.select()
      .from(countersTable)
      .where(eq(countersTable.id, result.id))
      .execute();

    expect(counters[0].value).toEqual(-3);
  });

  it('should update timestamp when decrementing existing counter', async () => {
    // Create counter
    const initialCounter = await db.insert(countersTable)
      .values({ value: 0 })
      .returning()
      .execute();

    const originalTimestamp = initialCounter[0].updated_at;

    // Small delay to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const result = await decrementCounter();

    expect(result.updated_at.getTime()).toBeGreaterThan(originalTimestamp.getTime());
  });
});
