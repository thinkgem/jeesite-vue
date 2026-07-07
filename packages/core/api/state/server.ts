/**
 * Copyright (c) 2013-Now https://jeesite.com All rights reserved.
 * No deletion without permission, or be held responsible to law.
 * @author ThinkGem
 */
import { defHttp } from '@jeesite/core/utils/http/axios';
import { useGlobSetting } from '@jeesite/core/hooks/setting';

const { adminPath } = useGlobSetting();

export interface ServerInfo {
  hostAddress?: string;
  hostName?: string;
  osName?: string;
  osVersion?: string;
  osArch?: string;
  javaName?: string;
  javaVersion?: string;
  javaVendor?: string;
  javaHome?: string;
  javaArgs?: string[];
  startTime?: string;
  uptime?: string;
  userDir?: string;
  logPath?: string;
  userfilesDir?: string;
}

export interface DiskInfo {
  name?: string;
  mount?: string;
  type?: string;
  total?: string;
  avail?: string;
  used?: string;
  usedPerc?: string;
}

export interface ServerData {
  server?: ServerInfo;
  diskList?: DiskInfo[];
}

export interface RtCpuInfo {
  cpuNum?: number;
  cpuLogicalNum?: number;
  maxGhz?: string;
  sysPerc?: string;
  userPerc?: string;
  usedPerc?: string;
}

export interface RtMemInfo {
  total?: string;
  free?: string;
  used?: string;
  usedPerc?: string;
}

export interface RtJvmInfo {
  total?: string;
  free?: string;
  used?: string;
  usedPerc?: string;
  heapInit?: string;
  heapMax?: string;
  heapUsed?: string;
  heapAvailable?: string;
  nonHeapInit?: string;
  nonHeapMax?: string;
  nonHeapUsed?: string;
  nonHeapAvailable?: string;
}

export interface RtInfo {
  cpu?: RtCpuInfo;
  mem?: RtMemInfo;
  jvm?: RtJvmInfo;
}

/**
 * 获取服务器静态信息和磁盘列表
 */
export const stateServerInfo = (params?: Recordable | any) =>
  defHttp.get<ServerData>({ url: adminPath + '/state/server/index', params });

/**
 * 获取实时 CPU/内存/JVM 信息
 */
export const stateServerRtInfo = (params?: Recordable | any) =>
  defHttp.get<RtInfo>({ url: adminPath + '/state/server/rtInfo', params });

/**
 * 执行 JVM 垃圾回收
 */
export const stateServerGc = (params?: Recordable | any) =>
  defHttp.get<{ result: string; message: string }>({ url: adminPath + '/state/server/gc', params });
