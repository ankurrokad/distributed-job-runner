import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { PgTable } from 'drizzle-orm/pg-core';
import { eq, and, isNull, SQL, count } from 'drizzle-orm';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

/**
 * Base repository class providing type-safe CRUD operations for all tables.
 * 
 * @template TTable - The Drizzle table schema type
 * @template TSelect - The inferred select model type (auto-inferred from TTable)
 * @template TInsert - The inferred insert model type (auto-inferred from TTable)
 */
export abstract class BaseRepository<
  TTable extends PgTable<any>,
  TSelect extends InferSelectModel<TTable> = InferSelectModel<TTable>,
  TInsert extends InferInsertModel<TTable> = InferInsertModel<TTable>
> {
  protected db: NodePgDatabase;
  protected table: TTable;
  protected primaryKeyColumn: keyof TSelect;

  constructor(db: NodePgDatabase, table: TTable, primaryKeyColumn: keyof TSelect) {
    this.db = db;
    this.table = table;
    this.primaryKeyColumn = primaryKeyColumn;
  }

  /**
   * Create a new record
   */
  async create(data: TInsert): Promise<TSelect> {
    const result = await this.db.insert(this.table as any).values(data as any).returning();
    return (Array.isArray(result) ? result[0] : result) as TSelect;
  }

  /**
   * Find a record by its primary key
   */
  async findById(id: TSelect[keyof TSelect]): Promise<TSelect | null> {
    const tableColumn = (this.table as any)[this.primaryKeyColumn as string];
    const conditions = this.buildConditionsWithSoftDelete(
      eq(tableColumn, id)
    );

    const [result] = await this.db
      .select()
      .from(this.table as any)
      .where(conditions as any)
      .limit(1);

    return (result as TSelect) || null;
  }

  /**
   * Find a single record matching the given conditions
   */
  async findOne(conditions: SQL<unknown>): Promise<TSelect | null> {
    const finalConditions = this.buildConditionsWithSoftDelete(conditions);

    const [result] = await this.db
      .select()
      .from(this.table as any)
      .where(finalConditions as any)
      .limit(1);

    return (result as TSelect) || null;
  }

  /**
   * Find multiple records matching the given conditions (optional)
   */
  async findMany(conditions?: SQL<unknown>): Promise<TSelect[]> {
    const softDeleteCondition = this.buildSoftDeleteCondition();
    const finalConditions = conditions
      ? (softDeleteCondition ? and(conditions, softDeleteCondition) : conditions)
      : softDeleteCondition;

    const query = this.db.select().from(this.table as any);
    const results = finalConditions
      ? await query.where(finalConditions as any)
      : await query;

    return results as TSelect[];
  }

  /**
   * Update records matching the given conditions
   */
  async update(conditions: SQL<unknown>, data: Partial<TInsert>): Promise<TSelect[]> {
    const finalConditions = this.buildConditionsWithSoftDelete(conditions);

    const results = await this.db
      .update(this.table as any)
      .set(data as any)
      .where(finalConditions as any)
      .returning();

    return (Array.isArray(results) ? results : [results]) as TSelect[];
  }

  /**
   * Update a record by its primary key
   */
  async updateById(
    id: TSelect[keyof TSelect],
    data: Partial<TInsert>
  ): Promise<TSelect | null> {
    const tableColumn = (this.table as any)[this.primaryKeyColumn as string];
    const conditions = this.buildConditionsWithSoftDelete(
      eq(tableColumn, id)
    );

    const result = await this.db
      .update(this.table as any)
      .set(data as any)
      .where(conditions as any)
      .returning();

    const results = Array.isArray(result) ? result : [result];
    return (results[0] as TSelect) || null;
  }

  /**
   * Delete records matching the given conditions (hard delete)
   */
  async delete(conditions: SQL<unknown>): Promise<void> {
    const finalConditions = this.buildConditionsWithSoftDelete(conditions);

    await this.db.delete(this.table as any).where(finalConditions as any);
  }

  /**
   * Delete a record by its primary key (hard delete)
   */
  async deleteById(id: TSelect[keyof TSelect]): Promise<void> {
    const tableColumn = (this.table as any)[this.primaryKeyColumn as string];
    const conditions = this.buildConditionsWithSoftDelete(
      eq(tableColumn, id)
    );

    await this.db.delete(this.table as any).where(conditions as any);
  }

  /**
   * Count records matching the given conditions (optional)
   */
  async count(conditions?: SQL<unknown>): Promise<number> {
    const softDeleteCondition = this.buildSoftDeleteCondition();
    const finalConditions = conditions
      ? (softDeleteCondition ? and(conditions, softDeleteCondition) : conditions)
      : softDeleteCondition;

    const query = this.db
      .select({ count: count() as any })
      .from(this.table as any);
    
    const results = finalConditions
      ? await query.where(finalConditions as any)
      : await query;

    return Number(results[0]?.count ?? 0);
  }

  /**
   * Build conditions that include soft delete check if the table has a deletedAt field
   */
  protected buildConditionsWithSoftDelete(conditions: SQL<unknown>): SQL<unknown> {
    const softDeleteCondition = this.buildSoftDeleteCondition();
    
    if (softDeleteCondition) {
      return and(conditions, softDeleteCondition) as SQL<unknown>;
    }
    
    return conditions;
  }

  /**
   * Build soft delete condition if the table has a deletedAt field
   */
  protected buildSoftDeleteCondition(): SQL<unknown> | undefined {
    // Check if table has deletedAt column by trying to access it
    // This is a runtime check - if the property doesn't exist, it will be undefined
    try {
      const tableAny = this.table as any;
      if ('deletedAt' in tableAny && tableAny.deletedAt) {
        return isNull(tableAny.deletedAt);
      }
    } catch {
      // Property doesn't exist, table doesn't support soft deletes
    }
    return undefined;
  }
}
