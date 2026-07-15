import {
  describe,
  expect,
  it,
} from "vitest";

import {
  AI_CONTENT_ASSIST_MAX_CONTEXT_CHARACTERS,
  AI_CONTENT_ASSIST_MAX_SOURCE_CHARACTERS,
  AiContentAssistValidationError,
  createAiContentAssistDraftResult,
  getAiContentAssistEntitlement,
  normalizeAiContentAssistRequest,
} from "./domain";

function translationRequest() {
  return {
    task:
      "content_translation" as const,
    requestId:
      "request-123",
    sourceLocale:
      "sr-Latn" as const,
    targetLocale:
      "de" as const,
    sourceText:
      "  Premium frizerski studio.  ",
    context:
      "  Hero opis.  ",
    tone:
      "professional" as const,
  };
}

describe(
  "AI content assist domain",
  () => {
    it(
      "normalizes explicit text input without adding tenant or actor data",
      () => {
        expect(
          normalizeAiContentAssistRequest(
            translationRequest()
          )
        ).toEqual({
          ...translationRequest(),
          sourceText:
            "Premium frizerski studio.",
          context:
            "Hero opis.",
        });
      }
    );

    it(
      "maps tasks to existing product entitlements",
      () => {
        expect(
          getAiContentAssistEntitlement(
            "content_translation"
          )
        ).toBe(
          "ai.content_translation"
        );

        expect(
          getAiContentAssistEntitlement(
            "review_reply_draft"
          )
        ).toBe(
          "ai.review_reply_drafts"
        );
      }
    );

    it(
      "rejects a translation to the same locale",
      () => {
        expect(
          () =>
            normalizeAiContentAssistRequest({
              ...translationRequest(),
              targetLocale:
                "sr-Latn",
            })
        ).toThrowError(
          AiContentAssistValidationError
        );

        try {
          normalizeAiContentAssistRequest({
            ...translationRequest(),
            targetLocale:
              "sr-Latn",
          });
        } catch (
          error
        ) {
          expect(
            error
          ).toMatchObject({
            code:
              "SAME_TRANSLATION_LOCALE",
          });
        }
      }
    );

    it(
      "enforces bounded source and context input",
      () => {
        try {
          normalizeAiContentAssistRequest({
            ...translationRequest(),
            sourceText:
              "x".repeat(
                AI_CONTENT_ASSIST_MAX_SOURCE_CHARACTERS +
                  1
              ),
          });

          throw new Error(
            "Expected source length validation to fail."
          );
        } catch (
          error
        ) {
          expect(
            error
          ).toMatchObject({
            code:
              "SOURCE_TEXT_TOO_LONG",
          });
        }

        try {
          normalizeAiContentAssistRequest({
            ...translationRequest(),
            context:
              "x".repeat(
                AI_CONTENT_ASSIST_MAX_CONTEXT_CHARACTERS +
                  1
              ),
          });

          throw new Error(
            "Expected context length validation to fail."
          );
        } catch (
          error
        ) {
          expect(
            error
          ).toMatchObject({
            code:
              "CONTEXT_TOO_LONG",
          });
        }
      }
    );

    it(
      "always returns an approval-required non-auto-applicable draft",
      () => {
        const request =
          normalizeAiContentAssistRequest(
            translationRequest()
          );

        expect(
          createAiContentAssistDraftResult({
            request,
            draftText:
              " Premium-Friseursalon. ",
            provider:
              "groq",
            model:
              "openai/gpt-oss-20b",
            usage: {
              inputTokens:
                100,
              outputTokens:
                20,
              totalTokens:
                120,
            },
          })
        ).toEqual({
          contractVersion:
            1,
          status:
            "draft",
          task:
            "content_translation",
          requestId:
            "request-123",
          draftText:
            "Premium-Friseursalon.",
          provider:
            "groq",
          model:
            "openai/gpt-oss-20b",
          requiresHumanApproval:
            true,
          autoApplyAllowed:
            false,
          usage: {
            inputTokens:
              100,
            outputTokens:
              20,
            totalTokens:
              120,
          },
        });
      }
    );
  }
);
