import {
  describe,
  expect,
  it,
} from "vitest";

import {
  normalizeAiContentAssistRequest,
} from "./domain";
import {
  buildGroqContentAssistRequestBody,
  GROQ_CONTENT_ASSIST_ENDPOINT,
  GROQ_CONTENT_ASSIST_MODEL,
  parseGroqContentAssistResponse,
} from "./groq-contract";
import {
  AiContentAssistProviderError,
} from "./provider";

function request() {
  return normalizeAiContentAssistRequest({
    task:
      "content_translation",
    requestId:
      "request-1",
    sourceLocale:
      "sr-Latn",
    targetLocale:
      "fr",
    sourceText:
      "Moderan salon u centru grada.",
    context:
      "Kratak hero opis.",
    tone:
      "warm",
  });
}

describe(
  "Groq content assist contract",
  () => {
    it(
      "locks the official Groq endpoint and model identifier",
      () => {
        expect(
          GROQ_CONTENT_ASSIST_ENDPOINT
        ).toBe(
          "https://api.groq.com/openai/v1/chat/completions"
        );

        expect(
          GROQ_CONTENT_ASSIST_MODEL
        ).toBe(
          "openai/gpt-oss-20b"
        );
      }
    );

    it(
      "requests a strict JSON-schema draft without model reasoning",
      () => {
        const body =
          buildGroqContentAssistRequestBody(
            request()
          );

        expect(
          body
        ).toMatchObject({
          model:
            "openai/gpt-oss-20b",
          reasoning_effort:
            "low",
          include_reasoning:
            false,
          response_format: {
            type:
              "json_schema",
            json_schema: {
              name:
                "content_assist_draft",
              strict:
                true,
            },
          },
        });

        expect(
          body.messages[0].content
        ).toContain(
          "Ne vraćaj reasoning"
        );

        expect(
          JSON.parse(
            body.messages[1].content
          )
        ).toEqual({
          task:
            "content_translation",
          sourceLocale:
            "sr-Latn",
          targetLocale:
            "fr",
          tone:
            "warm",
          sourceText:
            "Moderan salon u centru grada.",
          context:
            "Kratak hero opis.",
        });
      }
    );

    it(
      "parses the structured draft and token usage",
      () => {
        expect(
          parseGroqContentAssistResponse({
            choices: [
              {
                message: {
                  content:
                    JSON.stringify({
                      draftText:
                        "Salon moderne au centre-ville.",
                    }),
                },
              },
            ],
            usage: {
              prompt_tokens:
                50,
              completion_tokens:
                12,
              total_tokens:
                62,
            },
          })
        ).toEqual({
          draftText:
            "Salon moderne au centre-ville.",
          usage: {
            inputTokens:
              50,
            outputTokens:
              12,
            totalTokens:
              62,
          },
        });
      }
    );

    it(
      "rejects malformed provider output",
      () => {
        expect(
          () =>
            parseGroqContentAssistResponse({
              choices: [
                {
                  message: {
                    content:
                      "not-json",
                  },
                },
              ],
            })
        ).toThrowError(
          AiContentAssistProviderError
        );

        try {
          parseGroqContentAssistResponse({
            choices: [],
          });
        } catch (
          error
        ) {
          expect(
            error
          ).toMatchObject({
            code:
              "AI_PROVIDER_RESPONSE_INVALID",
          });
        }
      }
    );
  }
);
