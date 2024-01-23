/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 716:
/***/ ((module) => {

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


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __nccwpck_require__(716);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;