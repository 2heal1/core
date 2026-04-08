/* eslint-disable */

module.exports = async function () {
  const host = process.env.HOST ?? 'localhost';
  const port = process.env.PORT ?? '3333';
  process.env.NODE_HOST_BASE_URL = `http://${host}:${port}`;
};
