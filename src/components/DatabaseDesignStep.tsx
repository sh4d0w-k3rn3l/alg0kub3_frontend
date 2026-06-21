'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Plus, X, Database, ChevronDown, Trash2, Table2, Key, Search, Layers } from 'lucide-react';

interface Index {
  name: string;
  columns: string;
  type: string;
}

interface Column {
  name: string;
  type: string;
  constraints: string[];
}

interface SqlTableData {
  name: string;
  description: string;
  columns: Column[];
  indexes: Index[];
}

interface NoSqlField {
  name: string;
  type: string;
}

interface NoSqlCollection {
  name: string;
  fields: NoSqlField[];
  indexes: Index[];
}

interface DynamoKey {
  name: string;
  type: string;
}

interface Gsi {
  name: string;
  partitionKey: string;
  sortKey: string;
}

interface DynamoTable {
  name: string;
  partitionKey: DynamoKey;
  sortKey: DynamoKey;
  gsis: Gsi[];
  attributes: { name: string; type: string }[];
}

interface CachePattern {
  keyPattern: string;
  valueType: string;
  ttl: string;
  usage: string;
}

interface EsMapping {
  field: string;
  type: string;
}

interface EsIndex {
  name: string;
  mappings: EsMapping[];
  shards: string;
  replicas: string;
}

interface KafkaTopic {
  name: string;
  partitions: string;
  replication: string;
  retention: string;
  keyFormat: string;
  valueFormat: string;
}

interface StorageItem {
  key: string;
  name: string;
  tag: string;
  icon: string;
  catColor?: string;
  tables?: SqlTableData[] | DynamoTable[];
  collections?: NoSqlCollection[];
  patterns?: CachePattern[];
  indices?: EsIndex[];
  topics?: KafkaTopic[];
}

interface StorageCategory {
  label: string;
  color: string;
  items: { key: string; name: string; tag: string; icon: string }[];
}

const STORAGE_CATEGORIES: StorageCategory[] = [
  {
    label: 'SQL Database',
    color: '#3b82f6',
    items: [{ key: 'postgresql', name: 'PostgreSQL', tag: 'SQL', icon: '🐘' }],
  },
  {
    label: 'NoSQL Database',
    color: '#a855f7',
    items: [
      { key: 'mongodb', name: 'MongoDB', tag: 'NoSQL', icon: '🍃' },
      { key: 'cassandra', name: 'Cassandra', tag: 'NoSQL', icon: '👁' },
      { key: 'dynamodb', name: 'DynamoDB', tag: 'NoSQL', icon: '⚡' },
    ],
  },
  {
    label: 'Cache',
    color: '#ef4444',
    items: [
      { key: 'redis', name: 'Redis', tag: 'Cache', icon: '🔴' },
      { key: 'memcache', name: 'Memcache', tag: 'Cache', icon: '🟢' },
    ],
  },
  {
    label: 'Search Engine',
    color: '#f59e0b',
    items: [{ key: 'elasticsearch', name: 'Elasticsearch', tag: 'Search', icon: '🔍' }],
  },
  {
    label: 'Message Queue',
    color: '#22c55e',
    items: [{ key: 'kafka', name: 'Apache Kafka', tag: 'Queue', icon: '📨' }],
  },
];

const ALL_STORAGES = STORAGE_CATEGORIES.flatMap(c => c.items.map(i => ({ ...i, catColor: c.color })));

const SQL_TYPES = ['INT', 'BIGINT', 'SERIAL', 'VARCHAR', 'TEXT', 'BOOLEAN', 'TIMESTAMP', 'UUID', 'FLOAT', 'JSONB', 'ARRAY', 'DATE'];
const SQL_CONSTRAINTS = ['PK', 'NOT NULL', 'UNIQUE', 'DEFAULT', 'FK', 'CHECK', 'INDEX'];
const SQL_INDEX_TYPES = ['INDEX', 'UNIQUE', 'BTREE', 'HASH', 'GIN', 'GIST'];

const NOSQL_TYPES = ['String', 'Number', 'Boolean', 'ObjectId', 'Array', 'Object', 'Date', 'Binary', 'Decimal128'];
const CASSANDRA_TYPES = ['text', 'int', 'bigint', 'uuid', 'timeuuid', 'timestamp', 'boolean', 'blob', 'counter', 'map', 'set', 'list', 'float', 'double'];
const DYNAMO_KEY_TYPES = ['S', 'N', 'B'];

const ES_TYPES = ['text', 'keyword', 'integer', 'long', 'float', 'double', 'boolean', 'date', 'nested', 'object', 'geo_point', 'ip'];

interface SqlTableDesignerProps {
  storage: StorageItem;
  onUpdate: (storage: StorageItem) => void;
}

const SqlTableDesigner: React.FC<SqlTableDesignerProps> = ({ storage, onUpdate }) => {
  const [tableName, setTableName] = useState('');
  const tables = (storage.tables || []) as SqlTableData[];

  const addTable = () => {
    if (!tableName.trim()) return;
    const t: SqlTableData = { name: tableName.trim(), description: '', columns: [], indexes: [] };
    onUpdate({ ...storage, tables: [...tables, t] });
    setTableName('');
  };

  const updateTable = (idx: number, updated: SqlTableData) => {
    const next = tables.map((t, i) => (i === idx ? updated : t));
    onUpdate({ ...storage, tables: next });
  };

  const removeTable = (idx: number) => {
    onUpdate({ ...storage, tables: tables.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input data-testid="sql-table-name" value={tableName} onChange={e => setTableName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTable()}
          placeholder="Enter table name (e.g., users, orders)"
          className="flex-1 bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] outline-none focus:border-[#22c55e] placeholder-[#484f58]" />
        <button data-testid="sql-add-table" onClick={addTable}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-medium transition-colors">
          <Plus size={12} /> Add Table
        </button>
      </div>

      {tables.map((table, ti) => (
        <SqlTable key={ti} table={table} index={ti} onUpdate={(t) => updateTable(ti, t)} onRemove={() => removeTable(ti)} />
      ))}
    </div>
  );
};

interface SqlTableProps {
  table: SqlTableData;
  index: number;
  onUpdate: (table: SqlTableData) => void;
  onRemove: () => void;
}

const SqlTable: React.FC<SqlTableProps> = ({ table, index, onUpdate, onRemove }) => {
  const addColumn = () => {
    onUpdate({ ...table, columns: [...table.columns, { name: '', type: 'INT', constraints: [] }] });
  };

  const updateColumn = (ci: number, field: keyof Column, val: string | string[]) => {
    const cols = table.columns.map((c, i) => (i === ci ? { ...c, [field]: val } : c));
    onUpdate({ ...table, columns: cols });
  };

  const removeColumn = (ci: number) => {
    onUpdate({ ...table, columns: table.columns.filter((_, i) => i !== ci) });
  };

  const toggleConstraint = (ci: number, constraint: string) => {
    const col = table.columns[ci];
    const has = col.constraints.includes(constraint);
    const next = has ? col.constraints.filter(c => c !== constraint) : [...col.constraints, constraint];
    updateColumn(ci, 'constraints', next);
  };

  const addIndex = () => {
    onUpdate({ ...table, indexes: [...(table.indexes || []), { name: 'idx_', columns: '', type: 'INDEX' }] });
  };

  const updateIndex = (ii: number, field: keyof Index, val: string) => {
    const idxs = (table.indexes || []).map((idx, i) => (i === ii ? { ...idx, [field]: val } : idx));
    onUpdate({ ...table, indexes: idxs });
  };

  const removeIndex = (ii: number) => {
    onUpdate({ ...table, indexes: (table.indexes || []).filter((_, i) => i !== ii) });
  };

  return (
    <div data-testid={`sql-table-${index}`} className="rounded-lg border border-[#2d333b] overflow-hidden" style={{ backgroundColor: '#161b22' }}>
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#2d333b]" style={{ backgroundColor: '#1c2128' }}>
        <Table2 size={12} className="text-[#3b82f6]" />
        <span className="text-sm font-semibold text-white">{table.name}</span>
        <input value={table.description || ''} onChange={e => onUpdate({ ...table, description: e.target.value })}
          placeholder="Add description..."
          className="flex-1 bg-transparent text-xs text-[#8b949e] outline-none placeholder-[#484f58] ml-2" />
        <button data-testid={`sql-table-${index}-add-col`} onClick={addColumn}
          className="flex items-center gap-1 text-[10px] text-[#8b949e] hover:text-white px-2 py-0.5 rounded hover:bg-[#2d333b] transition-colors">
          <Plus size={10} /> Add Column
        </button>
        <button onClick={onRemove} className="text-[#484f58] hover:text-red-400 transition-colors p-1"><Trash2 size={12} /></button>
      </div>

      <div className="p-2 space-y-1.5">
        {table.columns.map((col, ci) => (
          <div key={ci} data-testid={`sql-col-${index}-${ci}`} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#0d1117] group">
            <input value={col.name} onChange={e => updateColumn(ci, 'name', e.target.value)}
              placeholder="Column name"
              className="w-32 bg-[#0d1117] border border-[#2d333b] rounded px-2 py-1 text-xs text-[#c9d1d9] outline-none focus:border-[#3b82f6] placeholder-[#484f58]" />
            <select value={col.type} onChange={e => updateColumn(ci, 'type', e.target.value)}
              className="bg-[#0d1117] border border-[#2d333b] rounded px-2 py-1 text-xs text-[#c9d1d9] outline-none focus:border-[#3b82f6]">
              {SQL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <div className="flex items-center gap-1 flex-1 flex-wrap">
              {SQL_CONSTRAINTS.map(c => (
                <button key={c} onClick={() => toggleConstraint(ci, c)}
                  className={`text-[9px] px-1.5 py-0.5 rounded font-medium transition-colors ${
                    col.constraints.includes(c)
                      ? 'bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/40'
                      : 'text-[#484f58] border border-[#2d333b] hover:text-[#8b949e]'
                  }`}>
                  {c}
                </button>
              ))}
            </div>
            <button onClick={() => removeColumn(ci)} className="opacity-0 group-hover:opacity-100 text-[#484f58] hover:text-red-400 transition-all"><X size={12} /></button>
          </div>
        ))}
        {table.columns.length === 0 && (
          <p className="text-[11px] text-[#484f58] text-center py-2">Click "Add Column" to start defining columns</p>
        )}
      </div>

      <div className="border-t border-[#2d333b] p-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold text-[#8b949e] uppercase tracking-wider">Indexes</span>
          <button data-testid={`sql-table-${index}-add-idx`} onClick={addIndex}
            className="flex items-center gap-1 text-[10px] text-[#22c55e] hover:text-[#16a34a] transition-colors">
            <Plus size={9} /> Add Index
          </button>
        </div>
        {(table.indexes || []).map((idx, ii) => (
          <div key={ii} className="flex items-center gap-2 px-2 py-1 group">
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#8b949e]/20 text-[#8b949e]">INDEX</span>
            <input value={idx.name} onChange={e => updateIndex(ii, 'name', e.target.value)}
              placeholder="idx_name"
              className="w-24 bg-[#0d1117] border border-[#2d333b] rounded px-2 py-0.5 text-[10px] text-[#c9d1d9] outline-none focus:border-[#3b82f6] placeholder-[#484f58]" />
            <input value={idx.columns} onChange={e => updateIndex(ii, 'columns', e.target.value)}
              placeholder="col1, col2"
              className="flex-1 bg-[#0d1117] border border-[#2d333b] rounded px-2 py-0.5 text-[10px] text-[#c9d1d9] outline-none focus:border-[#3b82f6] placeholder-[#484f58]" />
            <select value={idx.type} onChange={e => updateIndex(ii, 'type', e.target.value)}
              className="bg-[#0d1117] border border-[#2d333b] rounded px-2 py-0.5 text-[10px] text-[#c9d1d9] outline-none">
              {SQL_INDEX_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <button onClick={() => removeIndex(ii)} className="opacity-0 group-hover:opacity-100 text-[#484f58] hover:text-red-400"><X size={10} /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

interface NoSqlDesignerProps {
  storage: StorageItem;
  onUpdate: (storage: StorageItem) => void;
  typeOptions: string[];
}

const NoSqlDesigner: React.FC<NoSqlDesignerProps> = ({ storage, onUpdate, typeOptions }) => {
  const [collName, setCollName] = useState('');
  const collections = storage.collections || [];
  const label = storage.key === 'mongodb' ? 'Collection' : 'Table';

  const addCollection = () => {
    if (!collName.trim()) return;
    onUpdate({ ...storage, collections: [...collections, { name: collName.trim(), fields: [], indexes: [] }] });
    setCollName('');
  };

  const updateColl = (ci: number, updated: NoSqlCollection) => {
    onUpdate({ ...storage, collections: collections.map((c, i) => (i === ci ? updated : c)) });
  };

  const removeColl = (ci: number) => {
    onUpdate({ ...storage, collections: collections.filter((_, i) => i !== ci) });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input data-testid="nosql-coll-name" value={collName} onChange={e => setCollName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addCollection()}
          placeholder={`Enter ${label.toLowerCase()} name`}
          className="flex-1 bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] outline-none focus:border-[#a855f7] placeholder-[#484f58]" />
        <button data-testid="nosql-add-coll" onClick={addCollection}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#a855f7] hover:bg-[#9333ea] text-white text-xs font-medium transition-colors">
          <Plus size={12} /> Add {label}
        </button>
      </div>

      {collections.map((coll, ci) => (
        <div key={ci} data-testid={`nosql-coll-${ci}`} className="rounded-lg border border-[#2d333b] overflow-hidden" style={{ backgroundColor: '#161b22' }}>
          <div className="flex items-center gap-2 px-3 py-2 border-b border-[#2d333b]" style={{ backgroundColor: '#1c2128' }}>
            <Layers size={12} className="text-[#a855f7]" />
            <span className="text-sm font-semibold text-white">{coll.name}</span>
            <div className="flex-1" />
            <button onClick={() => {
              const updated = { ...coll, fields: [...coll.fields, { name: '', type: typeOptions[0] }] };
              updateColl(ci, updated);
            }} className="flex items-center gap-1 text-[10px] text-[#8b949e] hover:text-white px-2 py-0.5 rounded hover:bg-[#2d333b]">
              <Plus size={10} /> Add Field
            </button>
            <button onClick={() => removeColl(ci)} className="text-[#484f58] hover:text-red-400 p-1"><Trash2 size={12} /></button>
          </div>
          <div className="p-2 space-y-1.5">
            {coll.fields.map((f, fi) => (
              <div key={fi} className="flex items-center gap-2 px-2 py-1 group">
                <input value={f.name} onChange={e => {
                  const fields = coll.fields.map((ff, i) => (i === fi ? { ...ff, name: e.target.value } : ff));
                  updateColl(ci, { ...coll, fields });
                }} placeholder="Field name"
                  className="w-36 bg-[#0d1117] border border-[#2d333b] rounded px-2 py-1 text-xs text-[#c9d1d9] outline-none focus:border-[#a855f7] placeholder-[#484f58]" />
                <select value={f.type} onChange={e => {
                  const fields = coll.fields.map((ff, i) => (i === fi ? { ...ff, type: e.target.value } : ff));
                  updateColl(ci, { ...coll, fields });
                }} className="bg-[#0d1117] border border-[#2d333b] rounded px-2 py-1 text-xs text-[#c9d1d9] outline-none">
                  {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <button onClick={() => {
                  const fields = coll.fields.filter((_, i) => i !== fi);
                  updateColl(ci, { ...coll, fields });
                }} className="opacity-0 group-hover:opacity-100 text-[#484f58] hover:text-red-400"><X size={12} /></button>
              </div>
            ))}
            {coll.fields.length === 0 && <p className="text-[11px] text-[#484f58] text-center py-2">Add fields to define the document structure</p>}
          </div>
        </div>
      ))}
    </div>
  );
};

interface DynamoDesignerProps {
  storage: StorageItem;
  onUpdate: (storage: StorageItem) => void;
}

const DynamoDesigner: React.FC<DynamoDesignerProps> = ({ storage, onUpdate }) => {
  const [tableName, setTableName] = useState('');
  const tables = (storage.tables || []) as DynamoTable[];

  const addTable = () => {
    if (!tableName.trim()) return;
    onUpdate({ ...storage, tables: [...tables, { name: tableName.trim(), partitionKey: { name: '', type: 'S' }, sortKey: { name: '', type: 'S' }, gsis: [], attributes: [] }] });
    setTableName('');
  };

  const updateTable = (ti: number, updated: DynamoTable) => {
    onUpdate({ ...storage, tables: tables.map((t, i) => (i === ti ? updated : t)) });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input value={tableName} onChange={e => setTableName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTable()}
          placeholder="Enter DynamoDB table name"
          className="flex-1 bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] outline-none focus:border-[#f59e0b] placeholder-[#484f58]" />
        <button onClick={addTable} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#f59e0b] hover:bg-[#d97706] text-white text-xs font-medium">
          <Plus size={12} /> Add Table
        </button>
      </div>

      {tables.map((table, ti) => (
        <div key={ti} data-testid={`dynamo-table-${ti}`} className="rounded-lg border border-[#2d333b] p-3 space-y-2" style={{ backgroundColor: '#161b22' }}>
          <div className="flex items-center gap-2 mb-2">
            <Key size={12} className="text-[#f59e0b]" />
            <span className="text-sm font-semibold text-white">{table.name}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-[#8b949e] uppercase tracking-wider mb-1 block">Partition Key</label>
              <div className="flex gap-1">
                <input value={table.partitionKey.name} onChange={e => updateTable(ti, { ...table, partitionKey: { ...table.partitionKey, name: e.target.value } })}
                  placeholder="key name" className="flex-1 bg-[#0d1117] border border-[#2d333b] rounded px-2 py-1 text-xs text-[#c9d1d9] outline-none placeholder-[#484f58]" />
                <select value={table.partitionKey.type} onChange={e => updateTable(ti, { ...table, partitionKey: { ...table.partitionKey, type: e.target.value } })}
                  className="bg-[#0d1117] border border-[#2d333b] rounded px-2 py-1 text-xs text-[#c9d1d9]">
                  {DYNAMO_KEY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-[#8b949e] uppercase tracking-wider mb-1 block">Sort Key (optional)</label>
              <div className="flex gap-1">
                <input value={table.sortKey.name} onChange={e => updateTable(ti, { ...table, sortKey: { ...table.sortKey, name: e.target.value } })}
                  placeholder="sort key" className="flex-1 bg-[#0d1117] border border-[#2d333b] rounded px-2 py-1 text-xs text-[#c9d1d9] outline-none placeholder-[#484f58]" />
                <select value={table.sortKey.type} onChange={e => updateTable(ti, { ...table, sortKey: { ...table.sortKey, type: e.target.value } })}
                  className="bg-[#0d1117] border border-[#2d333b] rounded px-2 py-1 text-xs text-[#c9d1d9]">
                  {DYNAMO_KEY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>
          <button onClick={() => {
            const gsis = [...(table.gsis || []), { name: '', partitionKey: '', sortKey: '' }];
            updateTable(ti, { ...table, gsis });
          }} className="text-[10px] text-[#f59e0b] hover:text-[#d97706] flex items-center gap-1"><Plus size={9} /> Add GSI</button>
          {(table.gsis || []).map((gsi, gi) => (
            <div key={gi} className="flex items-center gap-2 px-2 py-1 bg-[#0d1117] rounded">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#f59e0b]/20 text-[#f59e0b]">GSI</span>
              <input value={gsi.name} onChange={e => {
                const gsis = table.gsis.map((g, i) => (i === gi ? { ...g, name: e.target.value } : g));
                updateTable(ti, { ...table, gsis });
              }} placeholder="GSI name" className="w-24 bg-transparent border border-[#2d333b] rounded px-2 py-0.5 text-[10px] text-[#c9d1d9] outline-none placeholder-[#484f58]" />
              <input value={gsi.partitionKey} onChange={e => {
                const gsis = table.gsis.map((g, i) => (i === gi ? { ...g, partitionKey: e.target.value } : g));
                updateTable(ti, { ...table, gsis });
              }} placeholder="PK" className="w-20 bg-transparent border border-[#2d333b] rounded px-2 py-0.5 text-[10px] text-[#c9d1d9] outline-none placeholder-[#484f58]" />
              <input value={gsi.sortKey} onChange={e => {
                const gsis = table.gsis.map((g, i) => (i === gi ? { ...g, sortKey: e.target.value } : g));
                updateTable(ti, { ...table, gsis });
              }} placeholder="SK" className="w-20 bg-transparent border border-[#2d333b] rounded px-2 py-0.5 text-[10px] text-[#c9d1d9] outline-none placeholder-[#484f58]" />
              <button onClick={() => updateTable(ti, { ...table, gsis: table.gsis.filter((_, i) => i !== gi) })}
                className="text-[#484f58] hover:text-red-400"><X size={10} /></button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

interface CacheDesignerProps {
  storage: StorageItem;
  onUpdate: (storage: StorageItem) => void;
}

const CacheDesigner: React.FC<CacheDesignerProps> = ({ storage, onUpdate }) => {
  const patterns = storage.patterns || [];

  const addPattern = () => {
    onUpdate({ ...storage, patterns: [...patterns, { keyPattern: '', valueType: 'String', ttl: '', usage: '' }] });
  };

  const updatePattern = (pi: number, field: keyof CachePattern, val: string) => {
    onUpdate({ ...storage, patterns: patterns.map((p, i) => (i === pi ? { ...p, [field]: val } : p)) });
  };

  const removePattern = (pi: number) => {
    onUpdate({ ...storage, patterns: patterns.filter((_, i) => i !== pi) });
  };

  const valueTypes = storage.key === 'redis'
    ? ['String', 'Hash', 'List', 'Set', 'Sorted Set', 'Stream', 'JSON']
    : ['String', 'Serialized Object', 'JSON', 'Binary'];

  return (
    <div className="space-y-2">
      <button data-testid="cache-add-pattern" onClick={addPattern}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#ef4444] hover:bg-[#dc2626] text-white text-xs font-medium transition-colors">
        <Plus size={12} /> Add Key Pattern
      </button>

      {patterns.map((p, pi) => (
        <div key={pi} data-testid={`cache-pattern-${pi}`} className="rounded-lg border border-[#2d333b] p-3 space-y-2 group" style={{ backgroundColor: '#161b22' }}>
          <div className="flex items-center gap-2">
            <Key size={12} className="text-[#ef4444]" />
            <input value={p.keyPattern} onChange={e => updatePattern(pi, 'keyPattern', e.target.value)}
              placeholder="Key pattern (e.g., user:{id}:profile)"
              className="flex-1 bg-[#0d1117] border border-[#2d333b] rounded px-2 py-1 text-xs text-[#c9d1d9] outline-none focus:border-[#ef4444] placeholder-[#484f58]" />
            <button onClick={() => removePattern(pi)} className="opacity-0 group-hover:opacity-100 text-[#484f58] hover:text-red-400"><Trash2 size={12} /></button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[9px] text-[#8b949e] uppercase tracking-wider mb-0.5 block">Value Type</label>
              <select value={p.valueType} onChange={e => updatePattern(pi, 'valueType', e.target.value)}
                className="w-full bg-[#0d1117] border border-[#2d333b] rounded px-2 py-1 text-xs text-[#c9d1d9] outline-none">
                {valueTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-[#8b949e] uppercase tracking-wider mb-0.5 block">TTL</label>
              <input value={p.ttl} onChange={e => updatePattern(pi, 'ttl', e.target.value)}
                placeholder="e.g., 3600s"
                className="w-full bg-[#0d1117] border border-[#2d333b] rounded px-2 py-1 text-xs text-[#c9d1d9] outline-none placeholder-[#484f58]" />
            </div>
            <div>
              <label className="text-[9px] text-[#8b949e] uppercase tracking-wider mb-0.5 block">Usage</label>
              <input value={p.usage} onChange={e => updatePattern(pi, 'usage', e.target.value)}
                placeholder="Describe usage..."
                className="w-full bg-[#0d1117] border border-[#2d333b] rounded px-2 py-1 text-xs text-[#c9d1d9] outline-none placeholder-[#484f58]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

interface ElasticDesignerProps {
  storage: StorageItem;
  onUpdate: (storage: StorageItem) => void;
}

const ElasticDesigner: React.FC<ElasticDesignerProps> = ({ storage, onUpdate }) => {
  const [indexName, setIndexName] = useState('');
  const indices = storage.indices || [];

  const addIndex = () => {
    if (!indexName.trim()) return;
    onUpdate({ ...storage, indices: [...indices, { name: indexName.trim(), mappings: [], shards: '5', replicas: '1' }] });
    setIndexName('');
  };

  const updateIdx = (ii: number, updated: EsIndex) => {
    onUpdate({ ...storage, indices: indices.map((idx, i) => (i === ii ? updated : idx)) });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input value={indexName} onChange={e => setIndexName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addIndex()}
          placeholder="Enter index name"
          className="flex-1 bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] outline-none focus:border-[#f59e0b] placeholder-[#484f58]" />
        <button onClick={addIndex} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#f59e0b] hover:bg-[#d97706] text-white text-xs font-medium">
          <Plus size={12} /> Add Index
        </button>
      </div>

      {indices.map((idx, ii) => (
        <div key={ii} data-testid={`es-index-${ii}`} className="rounded-lg border border-[#2d333b] p-3 space-y-2" style={{ backgroundColor: '#161b22' }}>
          <div className="flex items-center gap-2 mb-1">
            <Search size={12} className="text-[#f59e0b]" />
            <span className="text-sm font-semibold text-white">{idx.name}</span>
            <div className="flex-1" />
            <div className="flex items-center gap-2 text-[10px] text-[#8b949e]">
              <span>Shards:</span>
              <input value={idx.shards} onChange={e => updateIdx(ii, { ...idx, shards: e.target.value })}
                className="w-8 bg-[#0d1117] border border-[#2d333b] rounded px-1 py-0.5 text-[10px] text-[#c9d1d9] text-center outline-none" />
              <span>Replicas:</span>
              <input value={idx.replicas} onChange={e => updateIdx(ii, { ...idx, replicas: e.target.value })}
                className="w-8 bg-[#0d1117] border border-[#2d333b] rounded px-1 py-0.5 text-[10px] text-[#c9d1d9] text-center outline-none" />
            </div>
          </div>
          <button onClick={() => updateIdx(ii, { ...idx, mappings: [...idx.mappings, { field: '', type: 'text' }] })}
            className="text-[10px] text-[#f59e0b] flex items-center gap-1"><Plus size={9} /> Add Mapping</button>
          {idx.mappings.map((m, mi) => (
            <div key={mi} className="flex items-center gap-2 px-2 py-1 group">
              <input value={m.field} onChange={e => {
                const mappings = idx.mappings.map((mm, i) => (i === mi ? { ...mm, field: e.target.value } : mm));
                updateIdx(ii, { ...idx, mappings });
              }} placeholder="Field name"
                className="w-36 bg-[#0d1117] border border-[#2d333b] rounded px-2 py-1 text-xs text-[#c9d1d9] outline-none placeholder-[#484f58]" />
              <select value={m.type} onChange={e => {
                const mappings = idx.mappings.map((mm, i) => (i === mi ? { ...mm, type: e.target.value } : mm));
                updateIdx(ii, { ...idx, mappings });
              }} className="bg-[#0d1117] border border-[#2d333b] rounded px-2 py-1 text-xs text-[#c9d1d9] outline-none">
                {ES_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <button onClick={() => updateIdx(ii, { ...idx, mappings: idx.mappings.filter((_, i) => i !== mi) })}
                className="opacity-0 group-hover:opacity-100 text-[#484f58] hover:text-red-400"><X size={12} /></button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

interface KafkaDesignerProps {
  storage: StorageItem;
  onUpdate: (storage: StorageItem) => void;
}

const KafkaDesigner: React.FC<KafkaDesignerProps> = ({ storage, onUpdate }) => {
  const [topicName, setTopicName] = useState('');
  const topics = storage.topics || [];

  const addTopic = () => {
    if (!topicName.trim()) return;
    onUpdate({ ...storage, topics: [...topics, { name: topicName.trim(), partitions: '3', replication: '3', retention: '7d', keyFormat: '', valueFormat: '' }] });
    setTopicName('');
  };

  const updateTopic = (ti: number, field: keyof KafkaTopic, val: string) => {
    onUpdate({ ...storage, topics: topics.map((t, i) => (i === ti ? { ...t, [field]: val } : t)) });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input value={topicName} onChange={e => setTopicName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTopic()}
          placeholder="Enter topic name"
          className="flex-1 bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] outline-none focus:border-[#22c55e] placeholder-[#484f58]" />
        <button onClick={addTopic} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-medium">
          <Plus size={12} /> Add Topic
        </button>
      </div>

      {topics.map((t, ti) => (
        <div key={ti} data-testid={`kafka-topic-${ti}`} className="rounded-lg border border-[#2d333b] p-3 space-y-2" style={{ backgroundColor: '#161b22' }}>
          <span className="text-sm font-semibold text-white">{t.name}</span>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[9px] text-[#8b949e] uppercase tracking-wider mb-0.5 block">Partitions</label>
              <input value={t.partitions} onChange={e => updateTopic(ti, 'partitions', e.target.value)}
                className="w-full bg-[#0d1117] border border-[#2d333b] rounded px-2 py-1 text-xs text-[#c9d1d9] outline-none" />
            </div>
            <div>
              <label className="text-[9px] text-[#8b949e] uppercase tracking-wider mb-0.5 block">Replication</label>
              <input value={t.replication} onChange={e => updateTopic(ti, 'replication', e.target.value)}
                className="w-full bg-[#0d1117] border border-[#2d333b] rounded px-2 py-1 text-xs text-[#c9d1d9] outline-none" />
            </div>
            <div>
              <label className="text-[9px] text-[#8b949e] uppercase tracking-wider mb-0.5 block">Retention</label>
              <input value={t.retention} onChange={e => updateTopic(ti, 'retention', e.target.value)}
                className="w-full bg-[#0d1117] border border-[#2d333b] rounded px-2 py-1 text-xs text-[#c9d1d9] outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] text-[#8b949e] uppercase tracking-wider mb-0.5 block">Key Format</label>
              <input value={t.keyFormat} onChange={e => updateTopic(ti, 'keyFormat', e.target.value)}
                placeholder="e.g., String, Avro"
                className="w-full bg-[#0d1117] border border-[#2d333b] rounded px-2 py-1 text-xs text-[#c9d1d9] outline-none placeholder-[#484f58]" />
            </div>
            <div>
              <label className="text-[9px] text-[#8b949e] uppercase tracking-wider mb-0.5 block">Value Format</label>
              <input value={t.valueFormat} onChange={e => updateTopic(ti, 'valueFormat', e.target.value)}
                placeholder="e.g., JSON, Avro"
                className="w-full bg-[#0d1117] border border-[#2d333b] rounded px-2 py-1 text-xs text-[#c9d1d9] outline-none placeholder-[#484f58]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

interface StorageSectionProps {
  storage: StorageItem;
  onUpdate: (storage: StorageItem) => void;
}

const StorageSection: React.FC<StorageSectionProps> = ({ storage, onUpdate }) => {
  switch (storage.key) {
    case 'postgresql':
      return <SqlTableDesigner storage={storage} onUpdate={onUpdate} />;
    case 'mongodb':
      return <NoSqlDesigner storage={storage} onUpdate={onUpdate} typeOptions={NOSQL_TYPES} />;
    case 'cassandra':
      return <NoSqlDesigner storage={storage} onUpdate={onUpdate} typeOptions={CASSANDRA_TYPES} />;
    case 'dynamodb':
      return <DynamoDesigner storage={storage} onUpdate={onUpdate} />;
    case 'redis':
    case 'memcache':
      return <CacheDesigner storage={storage} onUpdate={onUpdate} />;
    case 'elasticsearch':
      return <ElasticDesigner storage={storage} onUpdate={onUpdate} />;
    case 'kafka':
      return <KafkaDesigner storage={storage} onUpdate={onUpdate} />;
    default:
      return null;
  }
};

interface SessionData {
  answers?: {
    database?: {
      storages?: StorageItem[];
    };
  };
}

interface DatabaseDesignStepProps {
  session: SessionData;
  onSave: (data: { storages: StorageItem[] }) => void;
}

const DatabaseDesignStep: React.FC<DatabaseDesignStepProps> = ({ session, onSave }) => {
  const saved = session?.answers?.database || {};
  const [storages, setStorages] = useState<StorageItem[]>(saved.storages || []);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doSave = useCallback((data: StorageItem[]) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => onSave({ storages: data }), 1500);
  }, [onSave]);

  const addStorage = (item: { key: string; name: string; tag: string; icon: string }) => {
    if (storages.find(s => s.key === item.key)) return;
    const next = [...storages, { ...item }];
    setStorages(next);
    setDropdownOpen(false);
    doSave(next);
  };

  const removeStorage = (key: string) => {
    const next = storages.filter(s => s.key !== key);
    setStorages(next);
    doSave(next);
  };

  const updateStorage = (key: string, updated: StorageItem) => {
    const next = storages.map(s => (s.key === key ? updated : s));
    setStorages(next);
    doSave(next);
  };

  return (
    <div>
      <div className="relative mb-4">
        <button data-testid="db-add-storage" onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#2d333b] hover:border-[#484f58] text-sm text-white transition-colors w-full" style={{ backgroundColor: '#161b22' }}>
          <Plus size={14} className="text-[#22c55e]" />
          <span>Add Storage</span>
          <ChevronDown size={14} className={`text-[#8b949e] ml-auto transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {dropdownOpen && (
          <div data-testid="db-storage-dropdown" className="absolute z-20 top-full left-0 right-0 mt-1 rounded-lg border border-[#2d333b] shadow-xl overflow-hidden" style={{ backgroundColor: '#1c2128' }}>
            {STORAGE_CATEGORIES.map(cat => (
              <div key={cat.label}>
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: cat.color, backgroundColor: '#161b22' }}>
                  {cat.label}
                </div>
                {cat.items.map(item => {
                  const added = storages.find(s => s.key === item.key);
                  return (
                    <button key={item.key} data-testid={`db-add-${item.key}`}
                      onClick={() => !added && addStorage(item)}
                      disabled={!!added}
                      className={`w-full flex items-center gap-2 px-4 py-2 text-left text-sm transition-colors ${added ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#2d333b]'}`}>
                      <span className="text-sm">{item.icon}</span>
                      <span className="text-[#c9d1d9]">{item.name}</span>
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded ml-auto" style={{ color: cat.color, backgroundColor: `${cat.color}15` }}>
                        {item.tag}
                      </span>
                      {added && <span className="text-[9px] text-[#484f58]">Added</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {storages.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {storages.map(s => {
            const meta = ALL_STORAGES.find(a => a.key === s.key);
            return (
              <span key={s.key} data-testid={`db-tag-${s.key}`}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-white"
                style={{ backgroundColor: `${meta?.catColor || '#8b949e'}20`, border: `1px solid ${meta?.catColor || '#8b949e'}40` }}>
                <span>{meta?.icon}</span>
                {s.name}
                <span className="text-[9px] opacity-60 ml-0.5">{s.tag}</span>
                <button onClick={() => removeStorage(s.key)} className="ml-1 hover:text-red-400 transition-colors"><X size={10} /></button>
              </span>
            );
          })}
        </div>
      )}

      <div className="border-t border-dashed border-[#2d333b] my-4" />

      {storages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16" style={{ backgroundColor: '#0d1117' }}>
          <Database size={40} className="text-[#2d333b] mb-4" />
          <p className="text-sm text-[#484f58]">Use the dropdown above to add storage technologies.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {storages.map(s => {
            const meta = ALL_STORAGES.find(a => a.key === s.key);
            return (
              <div key={s.key} data-testid={`db-section-${s.key}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">{meta?.icon}</span>
                  <h4 className="text-sm font-semibold text-white">{s.name}</h4>
                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded" style={{ color: meta?.catColor, backgroundColor: `${meta?.catColor}15` }}>
                    {s.tag}
                  </span>
                </div>
                <StorageSection storage={s} onUpdate={(updated) => updateStorage(s.key, updated)} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DatabaseDesignStep;
