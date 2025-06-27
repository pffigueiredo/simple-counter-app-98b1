
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { countersTable } from '../db/schema';
import { getCounter } from '../handlers/get_counter';

describe('getCounter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create and return a counter with value 0 when none exists', async () => {
    const result = await getCounter();

    expect(result.id).toBeDefined();
    expect(result.value).toEqual(0);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should return existing counter when one exists', async () => {
    // Create a counter with a specific value
    const insertedCounter = await db.insert(countersTable)
      .values({
        value: 42
      })
      .returning()
      .execute();

    const result = await getCounter();

    expect(result.id).toEqual(insertedCounter[0].id);
    expect(result.value).toEqual(42);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save counter to database when creating new one', async () => {
    const result = await getCounter();

    // Verify counter was saved to database
    const counters = await db.select()
      .from(countersTable)
      .execute();

    expect(counters).toHaveLength(1);
    expect(counters[0].id).toEqual(result.id);
    expect(counters[0].value).toEqual(0);
    expect(counters[0].updated_at).toBeInstanceOf(Date);
  });

  it('should return first counter when multiple exist', async () => {
    // Create multiple counters
    await db.insert(countersTable)
      .values([
        { value: 10 },
        { value: 20 },
        { value: 30 }
      ])
      .execute();

    const result = await getCounter();

    expect(result.value).toEqual(10); // Should return the first one
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);
  });
});
