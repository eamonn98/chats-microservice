import { promises as fsPromises } from 'fs';

interface CachedQuery {
  queryName: string,
  cql: string
}

const queryCache: CachedQuery[] = [];

const getQuery = async (queryName: string) => {
  const cachedQueries = queryCache.filter(n => n.queryName === queryName);

  if (cachedQueries.length > 0) {
    return cachedQueries[0].cql;
  }

  // Lazy load the query from a file
  const cql = await fsPromises.readFile(`src/cypher/${queryName}.cql`, { encoding: 'utf-8' });

  queryCache.push({ queryName, cql });

  return cql;
}

export { getQuery };