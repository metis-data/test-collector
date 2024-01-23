/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 280:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ }),

/***/ 383:
/***/ ((module) => {

module.exports = eval("require")("axios");


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
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const github = __nccwpck_require__(280);
const axios = __nccwpck_require__(383);
const { context } = __nccwpck_require__(280);
const octokit = github.getOctokit(process.env.GITHUB_TOKEN);

const { pull_request, issue } = context.payload;

const commentPr = async (testName) => {
  try {
    const urlPrefix = process.env.TARGET_URL;
    const apiKey = process.env.METIS_API_KEY;
    await octokit.rest.issues.createComment({
      ...context.repo,
      issue_number: pull_request ? pull_request.number : issue ? issue.number : 0,
      body: `Metis test results are available in the link: ${encodeURI(`${urlPrefix}/projects/${apiKey}/test/${testName}`)}`,
    });
  } catch (error) {
    console.error(error);
  }
};

const createNewTest = async (prName, prId, prUrl) => {
  try {
    const urlPrefix = core.getInput('target-url');
    const apiKey = core.getInput('metis-api-key');
    await axios.post(
      `${urlPrefix}/api/tests/create`,
      { prName, prId, prUrl, apiKey },
      {
        headers: { 'x-api-key': apiKey },
      }
    );
  } catch (error) {
    console.error(error);
  }
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
  }
}

main();

})();

module.exports = __webpack_exports__;
/******/ })()
;