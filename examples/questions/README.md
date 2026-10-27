# Ecology question routing fixture

`routing.json` contains 20 synthetic, labelled prompts: exact prepared matches, clarification, unsupported topics and wording that requires a model or manual controls. No teacher or learner data is included.

Run `node --test tests/investigation.test.mjs`. The routing test checks **local behaviour only**, with no API key or cost. `expectedModelStatus` and `expectedModelChange` describe intended outcomes for later provider evaluation; the offline test does not measure model accuracy on those fields. A single live Meta proposal at 70% rainfall for 26 weeks was validated during integration. The remaining custom examples have not been evaluated live. No benchmark or educational effectiveness claim is made.
