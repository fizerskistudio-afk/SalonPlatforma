import type {
  NormalizedAiContentAssistRequest,
} from "@/lib/ai/content-assist/domain";
import {
  AiContentAssistProviderError,
} from "@/lib/ai/content-assist/provider";

export const GROQ_CONTENT_ASSIST_ENDPOINT =
  "https://api.groq.com/openai/v1/chat/completions" as const;

export const GROQ_CONTENT_ASSIST_MODEL =
  "openai/gpt-oss-20b" as const;

export const GROQ_CONTENT_ASSIST_REASONING_EFFORT =
  "low" as const;

export const GROQ_CONTENT_ASSIST_MAX_COMPLETION_TOKENS =
  1_200 as const;

export const GROQ_CONTENT_ASSIST_TIMEOUT_MS =
  15_000 as const;

type GroqContentAssistRequestBody = {
  model:
    typeof GROQ_CONTENT_ASSIST_MODEL;
  messages: [
    {
      role:
        "system";
      content: string;
    },
    {
      role:
        "user";
      content: string;
    },
  ];
  temperature: number;
  max_completion_tokens:
    typeof GROQ_CONTENT_ASSIST_MAX_COMPLETION_TOKENS;
  reasoning_effort:
    typeof GROQ_CONTENT_ASSIST_REASONING_EFFORT;
  include_reasoning:
    false;
  response_format: {
    type:
      "json_schema";
    json_schema: {
      name:
        "content_assist_draft";
      strict:
        true;
      schema: {
        type:
          "object";
        additionalProperties:
          false;
        properties: {
          draftText: {
            type:
              "string";
            minLength:
              1;
          };
        };
        required: [
          "draftText",
        ];
      };
    };
  };
};

export type ParsedGroqContentAssistResponse = {
  draftText: string;
  usage: {
    inputTokens: number | null;
    outputTokens: number | null;
    totalTokens: number | null;
  };
};

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value ===
      "object" &&
    value !==
      null &&
    !Array.isArray(
      value
    )
  );
}

function readTokenCount(
  value: unknown
): number | null {
  return (
    typeof value ===
      "number" &&
    Number.isInteger(
      value
    ) &&
    value >=
      0
  )
    ? value
    : null;
}

export function buildGroqContentAssistRequestBody(
  request:
    NormalizedAiContentAssistRequest
): GroqContentAssistRequestBody {
  const taskInstruction =
    request.task ===
    "content_translation"
      ? "Prevedi izvorni tekst na ciljni jezik. Sačuvaj značenje, činjenice, brand ton i format. Ne dodaj nove tvrdnje."
      : "Napiši nacrt odgovora salona na recenziju. Ne izmišljaj događaje, obećanja, popuste ili činjenice koje nisu u ulazu.";

  const systemContent = [
    "Ti si AI pomoćnik za beauty i wellness SaaS platformu.",
    taskInstruction,
    "Vrati isključivo JSON objekat koji odgovara zadatoj šemi.",
    "Ne vraćaj reasoning, chain-of-thought, markdown ili dodatna objašnjenja.",
    "Rezultat je samo nacrt i nikada nije automatski odobren za objavu.",
  ].join(
    " "
  );

  const userContent =
    JSON.stringify({
      task:
        request.task,
      sourceLocale:
        request.sourceLocale,
      targetLocale:
        request.targetLocale,
      tone:
        request.tone,
      sourceText:
        request.sourceText,
      context:
        request.context,
    });

  return {
    model:
      GROQ_CONTENT_ASSIST_MODEL,
    messages: [
      {
        role:
          "system",
        content:
          systemContent,
      },
      {
        role:
          "user",
        content:
          userContent,
      },
    ],
    temperature:
      0.2,
    max_completion_tokens:
      GROQ_CONTENT_ASSIST_MAX_COMPLETION_TOKENS,
    reasoning_effort:
      GROQ_CONTENT_ASSIST_REASONING_EFFORT,
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
        schema: {
          type:
            "object",
          additionalProperties:
            false,
          properties: {
            draftText: {
              type:
                "string",
              minLength:
                1,
            },
          },
          required: [
            "draftText",
          ],
        },
      },
    },
  };
}

export function parseGroqContentAssistResponse(
  value: unknown
): ParsedGroqContentAssistResponse {
  if (
    !isRecord(
      value
    )
  ) {
    throw new AiContentAssistProviderError({
      code:
        "AI_PROVIDER_RESPONSE_INVALID",
      message:
        "AI provider odgovor nije validan.",
    });
  }

  const choices =
    value.choices;

  const firstChoice =
    Array.isArray(
      choices
    )
      ? choices[0]
      : null;

  if (
    !isRecord(
      firstChoice
    ) ||
    !isRecord(
      firstChoice.message
    ) ||
    typeof firstChoice.message.content !==
      "string"
  ) {
    throw new AiContentAssistProviderError({
      code:
        "AI_PROVIDER_RESPONSE_INVALID",
      message:
        "AI provider nije vratio očekivani draft sadržaj.",
    });
  }

  let parsedContent:
    unknown;

  try {
    parsedContent =
      JSON.parse(
        firstChoice.message.content
      );
  } catch (
    error
  ) {
    throw new AiContentAssistProviderError({
      code:
        "AI_PROVIDER_RESPONSE_INVALID",
      message:
        "AI provider draft nije validan JSON.",
      cause:
        error,
    });
  }

  if (
    !isRecord(
      parsedContent
    ) ||
    typeof parsedContent.draftText !==
      "string" ||
    parsedContent.draftText.trim().length ===
      0
  ) {
    throw new AiContentAssistProviderError({
      code:
        "AI_PROVIDER_RESPONSE_INVALID",
      message:
        "AI provider draft nema validan tekst.",
    });
  }

  const usage =
    isRecord(
      value.usage
    )
      ? value.usage
      : {};

  return {
    draftText:
      parsedContent.draftText,
    usage: {
      inputTokens:
        readTokenCount(
          usage.prompt_tokens
        ),
      outputTokens:
        readTokenCount(
          usage.completion_tokens
        ),
      totalTokens:
        readTokenCount(
          usage.total_tokens
        ),
    },
  };
}
