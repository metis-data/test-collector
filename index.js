module.exports = async ({ github, context, core, axios }) => {
  const octokit = github.getOctokit(process.env.GITHUB_TOKEN);
  const { pull_request, issue } = context.payload;

  const commentPr = async (testName) => {
    const urlPrefix = process.env.TARGET_URL;
    const apiKey = process.env.METIS_API_KEY;
    await octokit.rest.issues.createComment({
      ...context.repo,
      issue_number: pull_request ? pull_request.number : issue ? issue.number : 0,
      body: `Metis test results are available in the link: ${encodeURI(`${urlPrefix}/projects/${apiKey}/test/${testName}`)}`,
    });
  };

  const createNewTest = async (prName, prId, prUrl) => {
    const urlPrefix = process.env.TARGET_URL;
    const apiKey = process.env.METIS_API_KEY;
    await axios.post(
      `${urlPrefix}/api/tests/create`,
      { prName, prId, prUrl, apiKey },
      { headers: { 'x-api-key': apiKey } }
    );
  };

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
