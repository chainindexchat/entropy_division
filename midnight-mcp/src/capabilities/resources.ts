import { Data, Effect } from "effect";

export const readResourceRequestHandler = (
  graffleClient: any,
) =>
  Effect.promise(() =>
    graffleClient.document().select({ block: { height: true } }).send()
  ).pipe(
    Effect.map((data: any) =>
      Data.struct({
        contents: Data.array([
          Data.struct({
            mimeType: "application/json",
            text: JSON.stringify({
              status: "active",
              blockHeight: data.block.height,
            }),
            uri: "midnight://ledger/status",
          }),
        ]),
      })
    ),
  );
