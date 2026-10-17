interface MetricRecord {
  totalRequests: number;
  successfulRequests: number;
  errorRequests: number;
  rateLimitHits: number;
  aiRequests: number;
  aiFallbacks: number;
  latencies: number[];
  startTime: number;
}

const metricsState: MetricRecord = {
  totalRequests: 0,
  successfulRequests: 0,
  errorRequests: 0,
  rateLimitHits: 0,
  aiRequests: 0,
  aiFallbacks: 0,
  latencies: [],
  startTime: Date.now(),
};

export const metrics = {
  recordRequest(status: number, durationMs: number): void {
    metricsState.totalRequests += 1;
    if (status >= 200 && status < 400) {
      metricsState.successfulRequests += 1;
    } else {
      metricsState.errorRequests += 1;
    }

    if (status === 429) {
      metricsState.rateLimitHits += 1;
    }

    // Keep rolling window of last 200 latencies
    metricsState.latencies.push(durationMs);
    if (metricsState.latencies.length > 200) {
      metricsState.latencies.shift();
    }
  },

  recordAiCall(success: boolean): void {
    metricsState.aiRequests += 1;
    if (!success) {
      metricsState.aiFallbacks += 1;
    }
  },

  getSnapshot(): {
    uptimeSeconds: number;
    totalRequests: number;
    successRatePercent: number;
    rateLimitHits: number;
    aiFallbackRatePercent: number;
    latencyMs: {
      avg: number;
      p95: number;
    };
  } {
    const uptimeSeconds = Math.floor((Date.now() - metricsState.startTime) / 1000);
    const successRatePercent =
      metricsState.totalRequests > 0
        ? ((metricsState.successfulRequests / metricsState.totalRequests) * 100)
        : 100;

    const aiFallbackRatePercent =
      metricsState.aiRequests > 0
        ? ((metricsState.aiFallbacks / metricsState.aiRequests) * 100)
        : 0;

    let avgLatency = 0;
    let p95Latency = 0;

    if (metricsState.latencies.length > 0) {
      const sorted = [...metricsState.latencies].sort((a, b) => a - b);
      const sum = sorted.reduce((acc, curr) => acc + curr, 0);
      avgLatency = Math.round(sum / sorted.length);
      const p95Idx = Math.floor(sorted.length * 0.95);
      p95Latency = sorted[p95Idx] || sorted[sorted.length - 1];
    }

    return {
      uptimeSeconds,
      totalRequests: metricsState.totalRequests,
      successRatePercent: Number(successRatePercent.toFixed(1)),
      rateLimitHits: metricsState.rateLimitHits,
      aiFallbackRatePercent: Number(aiFallbackRatePercent.toFixed(1)),
      latencyMs: {
        avg: avgLatency,
        p95: p95Latency,
      },
    };
  },

  reset(): void {
    metricsState.totalRequests = 0;
    metricsState.successfulRequests = 0;
    metricsState.errorRequests = 0;
    metricsState.rateLimitHits = 0;
    metricsState.aiRequests = 0;
    metricsState.aiFallbacks = 0;
    metricsState.latencies = [];
    metricsState.startTime = Date.now();
  },
};
