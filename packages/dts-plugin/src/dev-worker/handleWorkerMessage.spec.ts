import { rstest } from '@rstest/core';

import { RpcGMCallTypes } from '../core/rpc/types';
import { handleDevWorkerMessage } from './handleWorkerMessage';

describe('handleDevWorkerMessage', () => {
  afterEach(() => {
    rstest.restoreAllMocks();
  });

  it('does not throw when EXIT arrives before module server is initialized', () => {
    const processExit = rstest.fn();

    expect(() =>
      handleDevWorkerMessage(
        {
          type: RpcGMCallTypes.EXIT,
          id: 'exit-before-init',
        },
        { processExit, log: rstest.fn() },
      ),
    ).not.toThrow();

    expect(processExit).toHaveBeenCalledWith(0);
  });

  it('calls module server exit when present', () => {
    const processExit = rstest.fn();
    const moduleServer = {
      exit: rstest.fn(),
    };

    handleDevWorkerMessage(
      {
        type: RpcGMCallTypes.EXIT,
        id: 'exit-with-server',
      },
      { moduleServer, processExit, log: rstest.fn() },
    );

    expect(moduleServer.exit).toHaveBeenCalledTimes(1);
    expect(processExit).toHaveBeenCalledWith(0);
  });

  it('ignores non-exit messages', () => {
    const processExit = rstest.fn();
    const moduleServer = {
      exit: rstest.fn(),
    };

    handleDevWorkerMessage(
      {
        type: RpcGMCallTypes.CALL,
        id: 'message',
        args: [],
      },
      { moduleServer, processExit, log: rstest.fn() },
    );

    expect(moduleServer.exit).not.toHaveBeenCalled();
    expect(processExit).not.toHaveBeenCalled();
  });
});
