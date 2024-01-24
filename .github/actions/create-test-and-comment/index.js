const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');
const { context } = require('@actions/github');
const octokit = github.getOctokit(core.getInput('github-token'));

const { pull_request, issue } = context.payload;

const commentPr = async (testName) => {
  const urlPrefix = core.getInput('target-url');
  const apiKey = core.getInput('metis-api-key');
  await octokit.rest.issues.createComment({
    ...context.repo,
    issue_number: pull_request ? pull_request.number : issue ? issue.number : 0,
    body: `Metis test results are available in the link: ${encodeURI(`${urlPrefix}/projects/${apiKey}/test/${testName}`)}`,
  });
};

const createNewTest = async (prName, prId, prUrl) => {
  const urlPrefix = core.getInput('target-url');
  const apiKey = core.getInput('metis-api-key');
  await axios.post(
    `${urlPrefix}/api/tests/create`,
    { prName, prId, prUrl, apiKey },
    { headers: { 'x-api-key': apiKey } }
  );
};

async function main() {
  try {
    const testName = pull_request?.title ? `pr:${pull_request.title}` : `commit:${context.sha}`;
    const prId = `${pull_request?.number}`;
    const prUrl = pull_request?.html_url;
    await createNewTest(testName, prId, prUrl);

    if (pull_request?.title !== undefined) {
      await commentPr(testName);
    }
  } catch (error) {
    console.error(error);
    core.setFailed(error);
  }
}

main();
