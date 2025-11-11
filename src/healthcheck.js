/**
 * Returns a simple readiness snapshot for CI smoke tests.
 * Keeping this in src isolates test logic from the art engine runtime.
 */
function getHealthStatus() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  getHealthStatus
};
