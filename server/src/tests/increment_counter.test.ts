
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { countersTable } from '../db/schema';
import { incrementCounter } from '../handlers/increment_counter';
import { eq } from 'drizzle-orm';

describe('incrementCounter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a counter with value 1 when no counter exists', async () => {
    const result = await incrementCounter();

    expect(result.id).toBeDefined();
    expect(result.value).toEqual(1);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should increment existing counter value by 1', async () => {
    // Create initial counter
    await db.insert(countersTable)
      .values({ value: 5 })
      .execute();

    const result = await incrementCounter();

    expect(result.value).toEqual(6);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save incremented value to database', async () => {
    // Create initial counter
    const initialResult = await db.insert(countersTable)
      .values({ value: 10 })
      .returning()
      .execute();

    const counterId = initialResult[0].id;

    // Increment counter
    await incrementCounter();

    // Verify in database
    const counters = await db.select()
      .from(countersTable)
      .where(eq(countersTable.id, counterId))
      .execute();

    expect(counters).toHaveLength(1);
    expect(counters[0].value).toEqual(11);
    expect(counters[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle multiple increments correctly', async () => {
    // First increment - creates counter
    const first = await incrementCounter();
    expect(first.value).toEqual(1);

    // Second increment
    const second = await incrementCounter();
    expect(second.value).toEqual(2);

    // Third increment
    const third = await incrementCounter();
    expect(third.value).toEqual(3);

    // Verify final state in database
    const counters = await db.select()
      .from(countersTable)
      .execute();

    expect(counters).toHaveLength(1);
    expect(counters[0].value).toEqual(3);
  });

  it('should update timestamp when incrementing', async () => {
    // Create initial counter
    const initialResult = await db.insert(countersTable)
      .values({ value: 1 })
      .returning()
      .execute();

    const originalTimestamp = initialResult[0].updated_at;

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    // Increment counter
    const result = await incrementCounter();

    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(originalTimestamp.getTime());
  });
});
