import { execSync, StdioOptions } from 'child_process';
import { Stream } from 'stream';

function run(
  cmd: string,
  options: {
    shell?: string;
    passthrough?: boolean;
    out?: Stream | number;
  } = {},
) {
  let stdio: StdioOptions;

  if (options.passthrough) {
    stdio = 'inherit';
  } else if (options.out) {
    stdio = ['pipe', options.out, options.out];
  } else {
    stdio = 'pipe';
  }

  return execSync(cmd, {
    shell: options.shell,
    encoding: 'utf-8',
    env: process.env,
    stdio,
  });
}

export function setupCollector(
  network: string,
  connectionString: string,
  metisApiKey: string,
  exporterTargetUrl: string,
  appTagPr: string,
  logLevel: string,
  options: { shell?: string } = {},
): string {
  const runCmd = `        
      docker run -d \\
        --name collector \\
        --network ${network} \\
        -e CONNECTION_STRING=${connectionString} \\
        -e METIS_API_KEY=${metisApiKey} \\
        -e METIS_EXPORTER_URL=${exporterTargetUrl} \\
        -e APP_TAG_PR="${appTagPr}" \\
        -e LOG_LEVEL=${logLevel} \\
        -p 4317:4317 -p 4318:4318 \\
        public.ecr.aws/o2c0x5x8/metis-otel-collector:latest`;

  const collectorId = run(runCmd, { shell: options.shell });

  const healthCmd = `
    while ! curl -s http://localhost:4318/health > /dev/null; do \\
      echo "Waiting for collector..." \\
      sleep 5 \\
    done;`;

  run(healthCmd, { shell: options.shell });

  return collectorId.trim();
}

export function stopCollector(
  collectorId: string,
  options: { shell?: string } = {},
) {
  const stopCmd = `docker rm -f ${collectorId}`;

  run(stopCmd, { shell: options.shell });
}

export function dumpCollectorLogs(
  collectorId: string,
  options: { shell?: string } = {},
) {
  const logsCmd = `docker logs ${collectorId}`;

  run(logsCmd, { shell: options.shell, passthrough: true });
}