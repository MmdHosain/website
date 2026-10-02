export interface QueryResult<Row = any> { rows: Row[]; rowCount?: number | null; }
export interface QueryExecutor { query(text: string, params?: any[]): Promise<QueryResult>; }
export interface Database extends QueryExecutor {
  transaction<T>(work: (client: QueryExecutor) => Promise<T>): Promise<T>;
}
