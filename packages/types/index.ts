// System Metrics Types
export interface SystemMetrics {
  timestamp: number;
  hostname: string;
  os: string;
  platform: string;
  kernelVersion: string;
  uptime: number; // in seconds
  cpu: {
    model: string;
    cores: number;
    usagePercent: number;
    temperature?: number;
    loadAverage: [number, number, number]; // 1m, 5m, 15m
  };
  memory: {
    total: number; // bytes
    used: number; // bytes
    free: number; // bytes
    usagePercent: number;
    swapTotal: number;
    swapUsed: number;
    swapPercent: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
    drives: MountedDrive[];
  };
  network: {
    rxBytesSec: number;
    txBytesSec: number;
    totalRx: number;
    totalTx: number;
    interfaces: NetworkInterface[];
  };
  processes: {
    total: number;
    running: number;
    topCpu: ProcessInfo[];
    topMemory: ProcessInfo[];
  };
  dockerSummary?: {
    containersTotal: number;
    containersRunning: number;
    imagesTotal: number;
  };
}

export interface MountedDrive {
  device: string;
  mountPoint: string;
  fsType: string;
  total: number;
  used: number;
  free: number;
  usagePercent: number;
}

export interface NetworkInterface {
  name: string;
  ipAddress: string;
  macAddress: string;
  isUp: boolean;
  rxBytes: number;
  txBytes: number;
}

export interface ProcessInfo {
  pid: number;
  name: string;
  user: string;
  cpuPercent: number;
  memPercent: number;
  memUsage: number;
  status: string;
}

// System Detailed Info
export interface SystemDetailedInfo {
  hostname: string;
  timezone: string;
  kernelVersion: string;
  osVersion: string;
  cpuModel: string;
  cpuCores: number;
  cpuThreads: number;
  ramTotal: number;
  swapTotal: number;
  disks: {
    name: string;
    size: number;
    type: string;
    model: string;
    used?: number;
  }[];
  partitions: {
    device: string;
    mountPoint: string;
    fsType: string;
    size: number;
  }[];
  pciDevices: string[];
  usbDevices: string[];
  gpu?: string;
  bios?: string;
  motherboard?: string;
}

// File Manager Types
export interface FileItem {
  name: string;
  path: string;
  isDir: boolean;
  size: number;
  permissions: string;
  mode: number;
  owner: string;
  group: string;
  modTime: string;
  extension?: string;
}

// Services Types
export interface SystemService {
  name: string;
  description: string;
  loadState: string;
  activeState: string; // 'active' | 'inactive' | 'failed'
  subState: string;
  isEnabled: boolean;
  pid?: number;
  memoryUsage?: number;
}

// Docker Types
export interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: string; // e.g. "running", "exited"
  state: string;
  created: string;
  ports: string[];
  cpuUsage: number;
  memoryUsage: number;
  memoryLimit: number;
}

export interface DockerImage {
  id: string;
  repository: string;
  tag: string;
  size: number;
  created: string;
}

export interface DockerVolume {
  name: string;
  driver: string;
  mountpoint: string;
  created: string;
}

export interface DockerNetwork {
  id: string;
  name: string;
  driver: string;
  scope: string;
}

// Network Page Types
export interface OpenPort {
  port: number;
  protocol: string; // 'tcp' | 'udp'
  processName: string;
  pid: number;
  state: string; // 'LISTEN'
  user: string;
}

export interface FirewallRule {
  id: string;
  action: 'ALLOW' | 'DENY' | 'REJECT';
  from: string;
  toPort: string;
  protocol: string;
  comment?: string;
}

// Log Entry Types
export interface LogEntry {
  id: string;
  timestamp: string;
  source: 'system' | 'kernel' | 'auth' | 'docker' | 'service';
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  serviceName?: string;
}

// User Management Types
export interface SystemUser {
  username: string;
  uid: number;
  gid: number;
  homeDir: string;
  shell: string;
  groups: string[];
  isLocked: boolean;
}

export interface PanelUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'operator' | 'readonly';
  twoFactorEnabled: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface SSHKey {
  id: string;
  name: string;
  fingerprint: string;
  publicKey: string;
  addedAt: string;
}

// Plugin Types
export interface PluginItem {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  isEnabled: boolean;
  icon?: string;
}

// Auth API Types
export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: PanelUser;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// App Store & GitHub Types
export interface CuratedApp {
  id: string;
  name: string;
  repoUrl: string;
  category: string;
  description: string;
  icon: string;
  stars: number;
  defaultPort: string;
  dockerImage: string;
  envVars: string;
  tags: string[];
}

export interface GitHubRepoItem {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  topics: string[];
  owner: {
    login: string;
    avatar_url: string;
  };
  updated_at: string;
}

export interface InstalledApp {
  id: string;
  name: string;
  repoUrl: string;
  description: string;
  category: string;
  icon: string;
  containerName: string;
  status: string;
  port: string;
  envVars: string;
  createdAt: string;
}

export interface DeployAppPayload {
  name: string;
  repoUrl?: string;
  category?: string;
  description?: string;
  icon?: string;
  dockerImage: string;
  port?: string;
  envVars?: string;
}

