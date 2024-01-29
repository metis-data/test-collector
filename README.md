[![metis](https://static-asserts-public.s3.eu-central-1.amazonaws.com/metis-min-logo.png)](https://www.metisdata.io/)

# Metis Test Collector
Github action for collecting tests traces

## metis-otel-collector
An action to set up OTEL collector for tests flows. The traces data is being sent to Metis platform to get analyzed 
and derive insights.

> :warning: **Note:** Currently support Mocha for Node and was not tested on other frameworks.

## Usage
1. Add the following step to your workflow:
```shell
  - name: Initialize metis collector
    uses: metis-data/test-collector@v1
    with:
      connection-string: <YOUR_CONNECTION_STRING>
      metis-api-key: <YOUR_API_KEY>
      github-token: ${{ github.token }}
```
> :warning:  Metis collector will try to connect to the database so make sure to add the step after database initialization is done.
### Parameters
  - `connection-string`: Connection string to your tests database
  - `metis_api_key`: Metis Api Key generated at [Metis](https://app.metisdata.io/)
  - `github-token`: Github token with permissions to publish to pull requests, as noted in the next step

2. Add the following permissions to your workflow, to allow the action to post a comment on the pull request, having a link to Metis platform:
```shell
  permissions:
    pull-requests: write
```

3. Apply auto instrumentation to your tests (use --save-dev if opentelemetry is used in tests only):
```shell
npm install --save-dev @opentelemetry/auto-instrumentations-node @opentelemetry/instrumentation
```

4. Add the auto instrumentation flags to your test command:
```shell
OTEL_SERVICE_NAME=<YOUR_TEST_FLAG> NODE_OPTIONS="--require @opentelemetry/auto-instrumentations-node/register" ... <your-original-test-command>
```
> :warning:  It is recommended to set OTEL_SERVICE_NAME so tests results can be grouped by it.

### Full working example
```shell
# workflow.yaml
name: Test application on pull request with Metis
on:
  pull_request:
    types: [opened, reopened, edited, synchronize, ready_for_review]

jobs:
  run-tests-with-metis-on-pull-request:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
    services:
      postgres:
        image: postgres
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Initialize metis collector
        uses: metis-data/test-collector@v1
        with:
          connection-string: <YOUR_CONNECTION_STRING>
          metis-api-key: <YOR_API_KEY>
          github-token: ${{ secrets.GITHUB_TOKEN }}

      - name: Check out repository code
        uses: actions/checkout@v3
      - name: Install modules
        run: npm install
      - name: Run tests

        run: npm run test
```
```shell
# package.json
  ...
  "scripts": {
    ...
    "test": "OTEL_SERVICE_NAME=<YOUR_TEST_NAME> NODE_OPTIONS="--require @opentelemetry/auto-instrumentations-node/register" mocha --recursive './src/**/*.spec.js'"
  },
```

* If you like to get logs from the collector, set the next parameters to the action:
```shell
  with:
    ...
    metis-log-level: debug
    dump-logs: 'true'
```
This will dump the collector logs into the post action for you to review

## License Summary
This code is made available under the MIT license.

## Issues
If you would like to report a potential issue please use [Issues](https://github.com/metis-data/test-collector/issues)