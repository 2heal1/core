import type { RslibConfig } from '@rslib/core';

export interface RemoteOptions {
  moduleFederationConfig: any;
  additionalBundlerConfig?: Partial<RslibConfig>;
  distFolder?: string;
  testsFolder?: string;
  deleteTestsFolder?: boolean;
}
