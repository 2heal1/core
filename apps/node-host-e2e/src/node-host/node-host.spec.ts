describe('GET /', () => {
  it('should return a message', async () => {
    const baseUrl = process.env.NODE_HOST_BASE_URL ?? 'http://localhost:3333';
    const res = await fetch(`${baseUrl}/api`);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({
      message: 'Welcome to node-host!',
      remotes: {
        node_remote: 'module from node-remote',
        node_local_remote: 'module from node-local-remote',
      },
    });
  });
});
