import AdmZip from 'adm-zip';
import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'fs';
import os from 'os';
import { join } from 'path';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';

import { RemoteOptions } from '../interfaces/RemoteOptions';
import { createTestsArchive, downloadTypesArchive } from './archiveHandler';

describe('archiveHandler', () => {
  const tmpDir = mkdtempSync(join(os.tmpdir(), 'archive-handler'));
  const outDir = join(tmpDir, 'testsRemoteFolder', 'compiledTypesFolder');

  mkdirSync(outDir, { recursive: true });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('createTypesArchive', () => {
    const remoteOptions = {
      moduleFederationConfig: {},
      distFolder: tmpDir,
      testsFolder: '@mf-tests',
      deleteTestsFolder: false,
    } as unknown as Required<RemoteOptions>;

    it('correctly creates archive', async () => {
      const archivePath = join(tmpDir, `${remoteOptions.testsFolder}.zip`);

      const archiveCreated = await createTestsArchive(remoteOptions, outDir);

      expect(archiveCreated).toBeTruthy();
      expect(existsSync(archivePath)).toBeTruthy();
    });

    it('throws for unexisting outDir', async () => {
      await expect(
        createTestsArchive(remoteOptions, '/foo'),
      ).rejects.toThrowError();
    });
  });

  describe('downloadTypesArchive', () => {
    const destinationFolder = 'testsHostFolder';
    const archivePath = join(tmpDir, destinationFolder);
    const fileToDownload = 'https://foo.it';
    const hostOptions = {
      moduleFederationConfig: {},
      mocksFolder: archivePath,
      testsFolder: tmpDir,
      deleteTestsFolder: true,
      maxRetries: 3,
    };

    it('throws for unexisting url', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new Error('getaddrinfo ENOTFOUND foo.it')),
      );
      await expect(
        downloadTypesArchive(hostOptions)([tmpDir, 'https://foo.it']),
      ).rejects.toThrowError(
        'Network error: Unable to download federated mocks',
      );
      // .rejects.toThrowError('getaddrinfo ENOTFOUND foo.it')
    });

    it('correctly extract downloaded archive', async () => {
      const zip = new AdmZip();
      zip.addLocalFolder(tmpDir);

      const buf = zip.toBuffer();
      const ab = buf.buffer.slice(
        buf.byteOffset,
        buf.byteOffset + buf.byteLength,
      );
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
          arrayBuffer: vi.fn().mockResolvedValueOnce(ab),
        }),
      );
      await downloadTypesArchive(hostOptions)([
        destinationFolder,
        fileToDownload,
      ]);
      expect(existsSync(archivePath)).toBeTruthy();
    });

    it('correctly extracts downloaded archive - skips same zip file', async () => {
      const zip = new AdmZip();
      zip.addLocalFolder(tmpDir);

      const buf = zip.toBuffer();
      const ab = buf.buffer.slice(
        buf.byteOffset,
        buf.byteOffset + buf.byteLength,
      );
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          statusText: 'OK',
          arrayBuffer: vi.fn().mockResolvedValue(ab),
        }),
      );

      const downloader = downloadTypesArchive(hostOptions);

      await downloader([destinationFolder, fileToDownload]);
      await downloader([destinationFolder, fileToDownload]);

      expect(existsSync(archivePath)).toBeTruthy();
      expect(vi.mocked(globalThis.fetch as any)).toHaveBeenCalledTimes(2);
      expect(vi.mocked(globalThis.fetch as any).mock.calls[0]).toStrictEqual([
        fileToDownload,
      ]);
      expect(vi.mocked(globalThis.fetch as any).mock.calls[1]).toStrictEqual([
        fileToDownload,
      ]);
    });

    it('fails when response is not ok (covers non-2xx branch)', async () => {
      const opts = { ...hostOptions, maxRetries: 1 };
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          arrayBuffer: vi.fn(),
        }),
      );

      await expect(
        downloadTypesArchive(opts)([destinationFolder, fileToDownload]),
      ).rejects.toThrowError('Request failed: 404 Not Found');
      expect(vi.mocked(globalThis.fetch as any)).toHaveBeenCalledTimes(1);
    });
  });
});
