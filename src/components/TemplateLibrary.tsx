'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';

interface ExcalidrawAPI {
  getAppState?: () => { scrollX: number; scrollY: number; zoom: { value: number } } | undefined;
  getSceneElements?: () => ExcalidrawElement[];
  updateScene?: (data: { elements: ExcalidrawElement[] }) => void;
}

interface ExcalidrawElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  strokeColor: string;
  backgroundColor: string;
  fillStyle: string;
  strokeWidth: number;
  roughness: number;
  opacity: number;
  groupIds: string[];
  frameId: string | null;
  index: string;
  roundness: { type: number } | null;
  isDeleted: boolean;
  boundElements: { id: string; type: string }[] | null;
  locked: boolean;
  link: string | null;
  updated: number;
  seed: number;
  version: number;
  versionNonce: number;
  [key: string]: unknown;
}

interface Provider {
  key: string;
  label: string;
  color: string;
  bg: string;
  border: string;
}

interface ConnectorItem {
  name: string;
  color: string;
  dash: number[] | null;
  startArrow: string | null;
  endArrow: string | null;
}

interface ConnectorCategory {
  cat: string;
  items: ConnectorItem[];
}

interface TemplateItem {
  name: string;
  label: string;
}

interface TemplateCategory {
  cat: string;
  items: TemplateItem[];
}

interface TemplateLibraryProps {
  excalidrawRef: React.RefObject<ExcalidrawAPI | null>;
  elementsRef: React.RefObject<ExcalidrawElement[]>;
}

const genId = (): string => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const PROVIDERS: Provider[] = [
  { key: 'aws', label: 'AWS', color: '#FF9900', bg: 'rgba(255,153,0,0.08)', border: '#FF9900' },
  { key: 'azure', label: 'Azure', color: '#0078D4', bg: 'rgba(0,120,212,0.08)', border: '#0078D4' },
  { key: 'gcp', label: 'GCP', color: '#4285F4', bg: 'rgba(66,133,244,0.08)', border: '#4285F4' },
  { key: 'generic', label: 'Generic', color: '#8b949e', bg: 'rgba(139,148,158,0.08)', border: '#8b949e' },
  { key: 'connectors', label: 'Arrows', color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: '#22c55e' },
];

const CONNECTORS: ConnectorCategory[] = [
  { cat: 'Synchronous', items: [
    { name: 'HTTP / REST', color: '#22c55e', dash: null, startArrow: null, endArrow: 'arrow' },
    { name: 'gRPC', color: '#3b82f6', dash: null, startArrow: null, endArrow: 'arrow' },
    { name: 'GraphQL', color: '#e879f9', dash: null, startArrow: null, endArrow: 'arrow' },
    { name: 'TCP', color: '#64748b', dash: null, startArrow: null, endArrow: 'arrow' },
  ]},
  { cat: 'Asynchronous', items: [
    { name: 'Async Event', color: '#f97316', dash: [12, 8], startArrow: null, endArrow: 'arrow' },
    { name: 'Pub/Sub', color: '#eab308', dash: [12, 8], startArrow: null, endArrow: 'arrow' },
    { name: 'Webhook', color: '#a3e635', dash: [8, 6], startArrow: null, endArrow: 'arrow' },
    { name: 'Queue', color: '#fb923c', dash: [12, 8], startArrow: null, endArrow: 'arrow' },
  ]},
  { cat: 'Data Flow', items: [
    { name: 'Read', color: '#06b6d4', dash: [4, 4], startArrow: null, endArrow: 'arrow' },
    { name: 'Write', color: '#ef4444', dash: null, startArrow: null, endArrow: 'arrow' },
    { name: 'Read/Write', color: '#a855f7', dash: null, startArrow: 'arrow', endArrow: 'arrow' },
    { name: 'Replication', color: '#14b8a6', dash: [8, 6], startArrow: null, endArrow: 'arrow' },
    { name: 'Cache Hit', color: '#22d3ee', dash: [4, 4], startArrow: null, endArrow: 'arrow' },
  ]},
  { cat: 'Real-time', items: [
    { name: 'WebSocket', color: '#ec4899', dash: [12, 8], startArrow: 'arrow', endArrow: 'arrow' },
    { name: 'SSE', color: '#f472b6', dash: [8, 6], startArrow: null, endArrow: 'arrow' },
    { name: 'Streaming', color: '#c084fc', dash: [12, 8], startArrow: null, endArrow: 'arrow' },
  ]},
  { cat: 'Infrastructure', items: [
    { name: 'DNS Resolve', color: '#94a3b8', dash: [4, 4], startArrow: null, endArrow: 'arrow' },
    { name: 'Load Balance', color: '#fb7185', dash: null, startArrow: null, endArrow: 'arrow' },
    { name: 'CDN Fetch', color: '#fbbf24', dash: [8, 6], startArrow: null, endArrow: 'arrow' },
    { name: 'Health Check', color: '#4ade80', dash: [4, 4], startArrow: 'arrow', endArrow: 'arrow' },
  ]},
];

const TEMPLATES: Record<string, TemplateCategory[]> = {
  aws: [
    { cat: 'Compute', items: [
      { name: 'EC2', label: 'EC2 Instance' },
      { name: 'Lambda', label: 'Lambda' },
      { name: 'ECS', label: 'ECS Cluster' },
      { name: 'EKS', label: 'EKS (K8s)' },
      { name: 'Fargate', label: 'Fargate' },
    ]},
    { cat: 'Storage', items: [
      { name: 'S3', label: 'S3 Bucket' },
      { name: 'EBS', label: 'EBS Volume' },
      { name: 'EFS', label: 'EFS' },
    ]},
    { cat: 'Database', items: [
      { name: 'RDS', label: 'RDS' },
      { name: 'DynamoDB', label: 'DynamoDB' },
      { name: 'ElastiCache', label: 'ElastiCache' },
      { name: 'Redshift', label: 'Redshift' },
      { name: 'Aurora', label: 'Aurora' },
    ]},
    { cat: 'Networking', items: [
      { name: 'ELB', label: 'Elastic LB' },
      { name: 'CloudFront', label: 'CloudFront' },
      { name: 'Route53', label: 'Route 53' },
      { name: 'API GW', label: 'API Gateway' },
      { name: 'VPC', label: 'VPC' },
    ]},
    { cat: 'Messaging', items: [
      { name: 'SQS', label: 'SQS' },
      { name: 'SNS', label: 'SNS' },
      { name: 'Kinesis', label: 'Kinesis' },
      { name: 'EventBridge', label: 'EventBridge' },
    ]},
  ],
  azure: [
    { cat: 'Compute', items: [
      { name: 'VM', label: 'Virtual Machine' },
      { name: 'Functions', label: 'Functions' },
      { name: 'AKS', label: 'AKS (K8s)' },
      { name: 'App Service', label: 'App Service' },
    ]},
    { cat: 'Storage', items: [
      { name: 'Blob', label: 'Blob Storage' },
      { name: 'Disk', label: 'Managed Disk' },
      { name: 'Files', label: 'Azure Files' },
    ]},
    { cat: 'Database', items: [
      { name: 'SQL DB', label: 'SQL Database' },
      { name: 'Cosmos DB', label: 'Cosmos DB' },
      { name: 'Redis', label: 'Cache for Redis' },
      { name: 'PostgreSQL', label: 'PostgreSQL' },
    ]},
    { cat: 'Networking', items: [
      { name: 'Load Bal.', label: 'Load Balancer' },
      { name: 'CDN', label: 'Azure CDN' },
      { name: 'DNS', label: 'DNS Zone' },
      { name: 'API Mgmt', label: 'API Mgmt' },
      { name: 'Front Door', label: 'Front Door' },
    ]},
    { cat: 'Messaging', items: [
      { name: 'Service Bus', label: 'Service Bus' },
      { name: 'Event Hubs', label: 'Event Hubs' },
      { name: 'Event Grid', label: 'Event Grid' },
    ]},
  ],
  gcp: [
    { cat: 'Compute', items: [
      { name: 'GCE', label: 'Compute Engine' },
      { name: 'Cloud Fn', label: 'Cloud Functions' },
      { name: 'GKE', label: 'GKE (K8s)' },
      { name: 'Cloud Run', label: 'Cloud Run' },
      { name: 'App Engine', label: 'App Engine' },
    ]},
    { cat: 'Storage', items: [
      { name: 'GCS', label: 'Cloud Storage' },
      { name: 'Filestore', label: 'Filestore' },
    ]},
    { cat: 'Database', items: [
      { name: 'Cloud SQL', label: 'Cloud SQL' },
      { name: 'Firestore', label: 'Firestore' },
      { name: 'Bigtable', label: 'Bigtable' },
      { name: 'Memorystore', label: 'Memorystore' },
      { name: 'Spanner', label: 'Spanner' },
    ]},
    { cat: 'Networking', items: [
      { name: 'Cloud LB', label: 'Cloud LB' },
      { name: 'Cloud CDN', label: 'Cloud CDN' },
      { name: 'Cloud DNS', label: 'Cloud DNS' },
      { name: 'API GW', label: 'API Gateway' },
    ]},
    { cat: 'Messaging', items: [
      { name: 'Pub/Sub', label: 'Pub/Sub' },
      { name: 'Tasks', label: 'Cloud Tasks' },
    ]},
  ],
  generic: [
    { cat: 'Compute', items: [
      { name: 'Web Server', label: 'Web Server' },
      { name: 'App Server', label: 'App Server' },
      { name: 'Microservice', label: 'Microservice' },
      { name: 'Worker', label: 'Worker' },
      { name: 'Scheduler', label: 'Scheduler' },
    ]},
    { cat: 'Storage', items: [
      { name: 'Database', label: 'Database' },
      { name: 'Cache', label: 'Cache' },
      { name: 'Object Store', label: 'Object Store' },
      { name: 'Search Index', label: 'Search Index' },
    ]},
    { cat: 'Networking', items: [
      { name: 'Load Balancer', label: 'Load Balancer' },
      { name: 'API Gateway', label: 'API Gateway' },
      { name: 'CDN', label: 'CDN' },
      { name: 'DNS', label: 'DNS' },
      { name: 'Reverse Proxy', label: 'Reverse Proxy' },
    ]},
    { cat: 'Messaging', items: [
      { name: 'Message Queue', label: 'Message Queue' },
      { name: 'Event Bus', label: 'Event Bus' },
      { name: 'Notification', label: 'Notification' },
      { name: 'Stream', label: 'Stream' },
    ]},
    { cat: 'Client', items: [
      { name: 'Browser', label: 'Browser' },
      { name: 'Mobile App', label: 'Mobile App' },
      { name: 'IoT Device', label: 'IoT Device' },
    ]},
  ],
};

const SHAPE_MAP: Record<string, string> = {
  Database: 'diamond', RDS: 'diamond', DynamoDB: 'diamond', Aurora: 'diamond',
  ElastiCache: 'diamond', Redshift: 'diamond', 'SQL DB': 'diamond',
  'Cosmos DB': 'diamond', Redis: 'diamond', PostgreSQL: 'diamond',
  'Cloud SQL': 'diamond', Firestore: 'diamond', Bigtable: 'diamond',
  Memorystore: 'diamond', Spanner: 'diamond', Cache: 'diamond', 'Search Index': 'diamond',
};

function buildTemplateElements(name: string, provider: string, x: number, y: number): ExcalidrawElement[] {
  const p = PROVIDERS.find(pr => pr.key === provider);
  const strokeColor = p?.color || '#8b949e';
  const bgColor = p?.bg || 'rgba(139,148,158,0.08)';
  const isDiamond = SHAPE_MAP[name];

  const shapeW = 150;
  const shapeH = 55;
  const shapeId = genId();
  const textId = genId();

  const shapeEl: ExcalidrawElement = {
    id: shapeId,
    type: isDiamond ? 'diamond' : 'rectangle',
    x, y,
    width: shapeW,
    height: shapeH,
    angle: 0,
    strokeColor,
    backgroundColor: bgColor,
    fillStyle: 'solid',
    strokeWidth: 1,
    roughness: 0,
    opacity: 100,
    groupIds: [],
    frameId: null,
    index: 'a0',
    roundness: isDiamond ? null : { type: 3 },
    isDeleted: false,
    boundElements: [{ id: textId, type: 'text' }],
    locked: false,
    link: null,
    updated: Date.now(),
    seed: Math.floor(Math.random() * 2e9),
    version: 1,
    versionNonce: Math.floor(Math.random() * 2e9),
  };

  const textEl: ExcalidrawElement = {
    id: textId,
    type: 'text',
    x: x + 10,
    y: y + shapeH / 2 - 8,
    width: shapeW - 20,
    height: 16,
    angle: 0,
    strokeColor: '#c9d1d9',
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 1,
    roughness: 0,
    opacity: 100,
    groupIds: [],
    frameId: null,
    index: 'a1',
    roundness: null,
    isDeleted: false,
    boundElements: null,
    locked: false,
    link: null,
    updated: Date.now(),
    seed: Math.floor(Math.random() * 2e9),
    version: 1,
    versionNonce: Math.floor(Math.random() * 2e9),
    text: name,
    fontSize: 14,
    fontFamily: 3,
    textAlign: 'center',
    verticalAlign: 'middle',
    autoResize: true,
    containerId: shapeId,
    originalText: name,
    lineHeight: 1.2,
  };

  return [shapeEl, textEl];
}

function buildArrowElement(connector: ConnectorItem, x: number, y: number): ExcalidrawElement[] {
  const arrowLen = 200;
  const arrowId = genId();
  const labelId = genId();

  const arrowEl: ExcalidrawElement = {
    id: arrowId,
    type: 'arrow',
    x, y,
    width: arrowLen,
    height: 0,
    angle: 0,
    strokeColor: connector.color,
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 2,
    roughness: 0,
    opacity: 100,
    groupIds: [],
    frameId: null,
    index: 'a0',
    roundness: { type: 2 },
    isDeleted: false,
    boundElements: [{ id: labelId, type: 'text' }],
    locked: false,
    link: null,
    updated: Date.now(),
    seed: Math.floor(Math.random() * 2e9),
    version: 1,
    versionNonce: Math.floor(Math.random() * 2e9),
    points: [[0, 0], [arrowLen, 0]],
    startBinding: null,
    endBinding: null,
    startArrowhead: connector.startArrow || null,
    endArrowhead: connector.endArrow || 'arrow',
    strokeStyle: connector.dash ? 'dashed' as const : 'solid' as const,
    elbowed: false,
  };

  const labelEl: ExcalidrawElement = {
    id: labelId,
    type: 'text',
    x: x + arrowLen / 2 - (connector.name.length * 3.5),
    y: y - 14,
    width: connector.name.length * 7,
    height: 14,
    angle: 0,
    strokeColor: connector.color,
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 1,
    roughness: 0,
    opacity: 80,
    groupIds: [],
    frameId: null,
    index: 'a1',
    roundness: null,
    isDeleted: false,
    boundElements: null,
    locked: false,
    link: null,
    updated: Date.now(),
    seed: Math.floor(Math.random() * 2e9),
    version: 1,
    versionNonce: Math.floor(Math.random() * 2e9),
    text: connector.name,
    fontSize: 12,
    fontFamily: 3,
    textAlign: 'center',
    verticalAlign: 'middle',
    autoResize: true,
    containerId: arrowId,
    originalText: connector.name,
    lineHeight: 1.2,
  };

  return [arrowEl, labelEl];
}

const TemplateLibrary = ({ excalidrawRef, elementsRef }: TemplateLibraryProps) => {
  const [activeTab, setActiveTab] = useState('aws');
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  const toggleCat = (cat: string) => {
    setExpandedCats(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const addTemplate = (name: string) => {
    const api = excalidrawRef.current;
    if (!api) return;

    const appState = api.getAppState?.();
    const scrollX = appState?.scrollX || 0;
    const scrollY = appState?.scrollY || 0;
    const zoom = appState?.zoom?.value || 1;

    const existing = api.getSceneElements?.() || elementsRef.current || [];
    const count = existing.filter(e => !e.isDeleted && e.type !== 'text').length;
    const col = count % 3;
    const row = Math.floor(count / 3);
    const cx = (-scrollX + 40) / zoom + col * 170;
    const cy = (-scrollY + 40) / zoom + row * 80;

    const newEls = buildTemplateElements(name, activeTab, cx, cy);
    api.updateScene?.({ elements: [...existing.map(e => ({ ...e })), ...newEls] });
  };

  const addConnector = (connector: ConnectorItem) => {
    const api = excalidrawRef.current;
    if (!api) return;

    const appState = api.getAppState?.();
    const scrollX = appState?.scrollX || 0;
    const scrollY = appState?.scrollY || 0;
    const zoom = appState?.zoom?.value || 1;

    const existing = api.getSceneElements?.() || elementsRef.current || [];
    const arrowCount = existing.filter(e => !e.isDeleted && e.type === 'arrow').length;
    const cx = (-scrollX + 40) / zoom;
    const cy = (-scrollY + 60) / zoom + arrowCount * 50;

    const newEls = buildArrowElement(connector, cx, cy);
    api.updateScene?.({ elements: [...existing.map(e => ({ ...e })), ...newEls] });
  };

  const isConnectors = activeTab === 'connectors';
  const provider = PROVIDERS.find(p => p.key === activeTab);
  const categories = isConnectors ? CONNECTORS : (TEMPLATES[activeTab] || []);

  return (
    <div className="flex flex-col h-full" data-testid="template-library">
      <div className="flex border-b border-[#2d333b] shrink-0">
        {PROVIDERS.map(p => (
          <button
            key={p.key}
            data-testid={`template-tab-${p.key}`}
            onClick={() => setActiveTab(p.key)}
            className={`flex-1 px-1 py-1.5 text-[9px] font-semibold transition-colors border-b-2 ${
              activeTab === p.key
                ? 'border-current text-white'
                : 'border-transparent text-[#484f58] hover:text-[#8b949e]'
            }`}
            style={activeTab === p.key ? { color: p.color, borderColor: p.color } : {}}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-1.5 space-y-0.5" style={{ scrollbarWidth: 'thin' }}>
        {(categories as (ConnectorCategory | TemplateCategory)[]).map(cat => {
          const isExpanded = expandedCats[`${activeTab}-${cat.cat}`] !== false;
          return (
            <div key={cat.cat}>
              <button
                onClick={() => toggleCat(`${activeTab}-${cat.cat}`)}
                className="w-full flex items-center gap-1 px-1 py-1 text-[10px] font-semibold text-[#8b949e] hover:text-white uppercase tracking-wider transition-colors"
              >
                {isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                {cat.cat}
              </button>
              {isExpanded && (
                <div className={isConnectors ? 'flex flex-col gap-1 pb-1' : 'grid grid-cols-2 gap-1 pb-1'}>
                  {cat.items.map(item => isConnectors ? (
                    <button
                      key={(item as ConnectorItem).name}
                      data-testid={`connector-${(item as ConnectorItem).name.replace(/[\s\/]+/g,'-').toLowerCase()}`}
                      onClick={() => addConnector(item as ConnectorItem)}
                      className="group flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-all hover:scale-[1.02]"
                      style={{
                        backgroundColor: `${(item as ConnectorItem).color}0d`,
                        border: `1px solid ${(item as ConnectorItem).color}22`,
                      }}
                      title={(item as ConnectorItem).name}
                    >
                      <div className="flex items-center shrink-0 w-8">
                        {(item as ConnectorItem).startArrow && (
                          <div className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-r-[5px]" style={{ borderRightColor: (item as ConnectorItem).color }} />
                        )}
                        <div className="flex-1 h-[2px] rounded" style={{
                          backgroundColor: (item as ConnectorItem).color,
                          backgroundImage: (item as ConnectorItem).dash ? `repeating-linear-gradient(90deg, ${(item as ConnectorItem).color} 0px, ${(item as ConnectorItem).color} ${(item as ConnectorItem).dash![0]/2}px, transparent ${(item as ConnectorItem).dash![0]/2}px, transparent ${((item as ConnectorItem).dash![0]+(item as ConnectorItem).dash![1])/2}px)` : undefined,
                          minWidth: (item as ConnectorItem).startArrow ? '14px' : '22px',
                        }} />
                        {(item as ConnectorItem).endArrow && (
                          <div className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[5px]" style={{ borderLeftColor: (item as ConnectorItem).color }} />
                        )}
                      </div>
                      <span className="text-[10px] text-[#c9d1d9] truncate leading-tight group-hover:text-white">
                        {(item as ConnectorItem).name}
                      </span>
                    </button>
                  ) : (
                    <button
                      key={(item as TemplateItem).name}
                      data-testid={`template-${activeTab}-${(item as TemplateItem).name.replace(/\s+/g,'-').toLowerCase()}`}
                      onClick={() => addTemplate((item as TemplateItem).name)}
                      className="group flex items-center gap-1.5 px-2 py-1.5 rounded-md text-left transition-all hover:scale-[1.02]"
                      style={{
                        backgroundColor: provider!.bg,
                        border: `1px solid ${provider!.color}22`,
                      }}
                      title={(item as TemplateItem).label}
                    >
                      <Plus size={9} style={{ color: provider!.color }} className="shrink-0 opacity-60 group-hover:opacity-100" />
                      <span className="text-[10px] text-[#c9d1d9] truncate leading-tight group-hover:text-white">
                        {(item as TemplateItem).name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { TemplateLibrary, buildTemplateElements, buildArrowElement };
export default TemplateLibrary;
