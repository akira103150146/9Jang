import { Injectable, Logger } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Controller } from '@nestjs/common/interfaces';
import { PATH_METADATA, METHOD_METADATA } from '@nestjs/common/constants';

/**
 * API 資源結構
 */
export interface ApiResource {
  path: string;
  method: string;
  controller: string;
  handler: string;
}

/**
 * API 資源樹狀結構
 */
export interface ApiResourceTree {
  module: string;
  resources: {
    path: string;
    methods: string[];
    controller: string;
  }[];
}

@Injectable()
export class ApiResourcesService {
  private readonly logger = new Logger(ApiResourcesService.name);

  constructor(
    private discoveryService: DiscoveryService,
    private metadataScanner: MetadataScanner,
    private reflector: Reflector,
  ) {}

  /**
   * 發現所有 API 資源
   */
  async discoverApiResources(): Promise<ApiResource[]> {
    const controllers = this.discoveryService.getControllers();
    const apiResources: ApiResource[] = [];

    for (const wrapper of controllers) {
      if (!wrapper.metatype) continue;

      const controllerPath = this.getControllerPath(wrapper.metatype);
      if (!controllerPath) continue;

      const controllerName = wrapper.metatype.name;
      const prototype = Object.getPrototypeOf(wrapper.instance);

      // 取得 controller 的所有方法
      const methodNames = this.metadataScanner.getAllMethodNames(prototype);

      for (const methodName of methodNames) {
        const methodPath = this.getMethodPath(prototype, methodName);
        const httpMethod = this.getHttpMethod(prototype, methodName);

        if (!httpMethod) continue;

        // 組合完整路徑
        const fullPath = this.normalizePath(`/${controllerPath}/${methodPath}`);

        apiResources.push({
          path: fullPath,
          method: httpMethod,
          controller: controllerName,
          handler: methodName,
        });
      }
    }

    // 排序: 先按路徑,再按方法
    apiResources.sort((a, b) => {
      if (a.path === b.path) {
        return this.compareHttpMethod(a.method, b.method);
      }
      return a.path.localeCompare(b.path);
    });

    this.logger.log(`發現 ${apiResources.length} 個 API 資源`);

    return apiResources;
  }

  /**
   * 取得樹狀結構的 API 資源
   */
  async getApiResourcesTree(): Promise<ApiResourceTree[]> {
    const resources = await this.discoverApiResources();
    const treeMap = new Map<string, Map<string, Set<string>>>();

    for (const resource of resources) {
      // 解析模組名稱 (從路徑的第一段)
      const pathParts = resource.path.split('/').filter(p => p);
      const moduleName = pathParts[0] || 'root';

      if (!treeMap.has(moduleName)) {
        treeMap.set(moduleName, new Map());
      }

      const moduleMap = treeMap.get(moduleName)!;
      
      // 標準化路徑: 將參數替換為 *
      const normalizedPath = this.normalizeRoutePath(resource.path);

      if (!moduleMap.has(normalizedPath)) {
        moduleMap.set(normalizedPath, new Set());
      }

      moduleMap.get(normalizedPath)!.add(resource.method);
    }

    // 轉換為陣列格式
    const tree: ApiResourceTree[] = [];

    for (const [moduleName, moduleMap] of treeMap) {
      const resources = Array.from(moduleMap.entries()).map(([path, methods]) => ({
        path,
        methods: Array.from(methods).sort(this.compareHttpMethod),
        controller: '', // 可以從原始資料中取得
      }));

      // 路徑排序
      resources.sort((a, b) => a.path.localeCompare(b.path));

      tree.push({
        module: moduleName,
        resources,
      });
    }

    // 模組排序
    tree.sort((a, b) => a.module.localeCompare(b.module));

    return tree;
  }

  /**
   * 取得 Controller 路徑
   */
  private getControllerPath(controller: any): string | null {
    const path = Reflect.getMetadata(PATH_METADATA, controller);
    return path || null;
  }

  /**
   * 取得方法路徑
   */
  private getMethodPath(prototype: any, methodName: string): string {
    const path = Reflect.getMetadata(PATH_METADATA, prototype[methodName]);
    return path || '';
  }

  /**
   * 取得 HTTP 方法
   */
  private getHttpMethod(prototype: any, methodName: string): string | null {
    const method = Reflect.getMetadata(METHOD_METADATA, prototype[methodName]);
    return method || null;
  }

  /**
   * 標準化路徑
   */
  private normalizePath(path: string): string {
    // 移除多餘的斜線
    let normalized = path.replace(/\/+/g, '/');
    
    // 確保開頭有斜線
    if (!normalized.startsWith('/')) {
      normalized = '/' + normalized;
    }
    
    // 移除結尾的斜線
    if (normalized.endsWith('/') && normalized.length > 1) {
      normalized = normalized.slice(0, -1);
    }

    return normalized;
  }

  /**
   * 標準化路由路徑 (將參數替換為 *)
   */
  private normalizeRoutePath(path: string): string {
    // 將 /students/:id 轉換為 /students/*
    return path.replace(/:\w+/g, '*');
  }

  /**
   * HTTP 方法排序比較
   */
  private compareHttpMethod(a: string, b: string): number {
    const order = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'];
    const indexA = order.indexOf(a);
    const indexB = order.indexOf(b);
    
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    
    return indexA - indexB;
  }
}
