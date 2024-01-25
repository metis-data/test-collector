"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dumpCollectorLogs = exports.stopCollector = exports.setupCollector = void 0;
const child_process_1 = require("child_process");
function run(cmd, options = {}) {
    let stdio;
    if (options.passthrough) {
        stdio = 'inherit';
    }
    else if (options.out) {
        stdio = ['pipe', options.out, options.out];
    }
    else {
        stdio = 'pipe';
    }
    return (0, child_process_1.execSync)(cmd, {
        shell: options.shell,
        encoding: 'utf-8',
        env: process.env,
        stdio,
    });
}
function setupCollector(network, connectionString, metisApiKey, exporterTargetUrl, appTagPr, logLevel, options = {}) {
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
    WAIT_SECONDS=5
    MAX_RETRIES=12
    RETRY_COUNT=0

    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
      if curl -s http://localhost:4318/health > /dev/null; then
        echo "Collector is ready."
        break
      else
        echo "Waiting for collector..."
        sleep $WAIT_SECONDS
        RETRY_COUNT=$((RETRY_COUNT + 1))
      fi
    done

    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
      echo "Collector did not become ready within the given retries."
      exit 1
    fi
  `;
    run(healthCmd, { shell: options.shell });
    return collectorId.trim();
}
exports.setupCollector = setupCollector;
function stopCollector(collectorId, options = {}) {
    const stopCmd = `docker rm -f ${collectorId}`;
    run(stopCmd, { shell: options.shell });
}
exports.stopCollector = stopCollector;
function dumpCollectorLogs(collectorId, options = {}) {
    const logsCmd = `docker logs ${collectorId}`;
    run(logsCmd, { shell: options.shell, passthrough: true });
}
exports.dumpCollectorLogs = dumpCollectorLogs;
