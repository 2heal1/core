import AdmZip from 'adm-zip';
import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'fs';
import os from 'os';
import { join } from 'path';
import { afterAll, describe, expect, it, vi } from 'vitest';

import { RemoteOptions } from '../interfaces/RemoteOptions';
import { createTypesArchive, downloadTypesArchive } from './archiveHandler';

describe('archiveHandler', () => {
  const tmpDir = mkdtempSync(join(os.tmpdir(), 'archive-handler'));
  const tsConfig = {
    outDir: join(tmpDir, 'typesRemoteFolder', 'compiledTypesFolder'),
  };

  mkdirSync(tsConfig.outDir, { recursive: true });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true });
  });

  describe('createTypesArchive', () => {
    const remoteOptions = {
      additionalFilesToCompile: [],
      compiledTypesFolder: 'compiledTypesFolder',
      typesFolder: 'typesRemoteFolder',
      moduleFederationConfig: {},
      tsConfigPath: './tsconfig.json',
      deleteTypesFolder: false,
    } as unknown as Required<RemoteOptions>;

    it('correctly creates archive', async () => {
      const archivePath = join(tmpDir, `${remoteOptions.typesFolder}.zip`);

      const archiveCreated = await createTypesArchive(tsConfig, remoteOptions);

      expect(archiveCreated).toBeTruthy();
      expect(existsSync(archivePath)).toBeTruthy();
    });

    it('throws for unexisting outDir', async () => {
      expect(
        createTypesArchive({ ...tsConfig, outDir: '/foo' }, remoteOptions),
      ).rejects.toThrowError();
    });
  });

  describe('downloadTypesArchive', () => {
    const hostOptions = {
      moduleFederationConfig: {},
      typesFolder: tmpDir,
      deleteTypesFolder: true,
      maxRetries: 3,
    };

    const destinationFolder = 'typesHostFolder';
    const fileToDownload = 'https://foo.it';

    it('correctly extracts downloaded archive', async () => {
      const archivePath = join(tmpDir, destinationFolder);
      const zip = new AdmZip();
      zip.addLocalFolder(tmpDir);

      const buf = zip.toBuffer();
      const ab = buf.buffer.slice(
        buf.byteOffset,
        buf.byteOffset + buf.byteLength,
      );
      (globalThis as any).fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        arrayBuffer: vi.fn().mockResolvedValueOnce(ab),
      });

      await downloadTypesArchive(hostOptions)([
        destinationFolder,
        fileToDownload,
      ]);
      expect(existsSync(archivePath)).toBeTruthy();
      expect((globalThis as any).fetch).toHaveBeenCalledTimes(1);
      expect((globalThis as any).fetch).toHaveBeenCalledWith(fileToDownload);
    });

    it('correctly extracts downloaded archive - skips same zip file', async () => {
      const archivePath = join(tmpDir, destinationFolder);

      const zip = new AdmZip();
      zip.addLocalFolder(tmpDir);

      const buf = zip.toBuffer();
      const ab = buf.buffer.slice(
        buf.byteOffset,
        buf.byteOffset + buf.byteLength,
      );
      (globalThis as any).fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        arrayBuffer: vi.fn().mockResolvedValue(ab),
      });

      const downloader = downloadTypesArchive(hostOptions);

      await downloader([destinationFolder, fileToDownload]);
      await downloader([destinationFolder, fileToDownload]);

      expect(existsSync(archivePath)).toBeTruthy();
      expect((globalThis as any).fetch).toHaveBeenCalledTimes(2);
      expect((globalThis as any).fetch.mock.calls[0]).toStrictEqual([
        fileToDownload,
      ]);
      expect((globalThis as any).fetch.mock.calls[1]).toStrictEqual([
        fileToDownload,
      ]);
    });

    it('correctly handles exception', async () => {
      const message = 'Rejected value';

      (globalThis as any).fetch = vi.fn().mockRejectedValue(new Error(message));

      await expect(() =>
        downloadTypesArchive(hostOptions)([destinationFolder, fileToDownload]),
      ).rejects.toThrowError(
        `Network error: Unable to download federated mocks for '${destinationFolder}' from '${fileToDownload}' because '${message}'`,
      );
      expect((globalThis as any).fetch).toHaveBeenCalledTimes(
        hostOptions.maxRetries,
      );
      expect((globalThis as any).fetch).toHaveBeenCalledWith(fileToDownload);
    });
  });
});
