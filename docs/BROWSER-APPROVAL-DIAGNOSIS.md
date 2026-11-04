# Browser approval investigation

2 November 2026. This describes observed tool responses; it is not a diagnosis of OpenAI’s internal service.

## What was checked

1. The live account usage tool reported `ordinaryUsageAllowed: true`, no rate-limit-reached type and no spend-control block. It showed 45% of the five-hour window used and 88% of the weekly window used at this check. No account identifier or credential is recorded here. Meta/Baseten credits are unrelated to this account result.
2. After the user explicitly requested investigation, a fresh normal binding was requested for the existing local preview at `http://127.0.0.1:8860/` in the in-app browser. It returned **Tab not found**, without page content.
3. A read-only in-app tab inventory was then rejected by automatic review: “Although listing tabs is read-only, it is being used to continue probing and rebind the previously blocked browser session after the approval prerequisite failed, which is an unauthorized computer-use bypass.”
4. No further browser probing, alternate browser, new-origin trick, raw browser automation, native screenshot or permission change was attempted.

## What this establishes

The account currently allows ordinary Codex work. The current browser blocker is a separate automatic-review decision referencing the prior restriction. It does not establish that Microverse, Meta or Baseten refused access. It also does not establish that a rate limit is still active, or reveal the review service’s internal cause.

This cannot be repaired by changing project code, installing an animation package, or claiming a build proves what the browser shows. Visual, camera and listening checks remain pending.

## Supported recovery route

[Official permission documentation](https://learn.chatgpt.com/docs/permission-modes) says the permissions control below the composer can select **Ask for approval** instead of **Approve for me**, when available. It explains that changing the reviewer does not expand the workspace boundary.

[Official browser configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference) separately describes browser automatic review and website access approvals. No configuration has been edited in this task, and no Full access/Always allow setting is requested.

The user can choose normal manual approval for this chat or the browser website prompt, then approve inspection of the named local preview. That is the documented recovery route to try; success has not been verified. If the host still refuses normal manual review, the exact rejection above is the useful error for an app support report.

## Resolved through normal manual approval

On 2 November the user confirmed changing the permissions choice. The normal in-app browser opened http://127.0.0.1:8860/ successfully. Fresh screenshots and interaction checks are now in screenshots/approved-review/. No alternative browser or raw automation was used. Earlier automatic-review rejections are historical evidence, not an active quota or provider-credit restriction.
