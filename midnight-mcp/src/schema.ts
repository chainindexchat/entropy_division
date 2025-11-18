import { Data, ParseResult, Schema } from "effect";
import { ParseError } from "effect/Cron";
import _ from "lodash";

export const EchoSchema = Schema.Struct({ message: Schema.String });

export const LatestBlockSchema = Schema.Undefined;

export const BlockSchema = Schema.Struct({
  height: Schema.optional(Schema.Number),
  hash: Schema.optional(Schema.String),
}).pipe(
  Schema.filter((args) => !_.isEmpty(_.omitBy(args, _.isUndefined))),
);

export const TransactionSchema = Schema.Struct({
  hash: Schema.optional(Schema.String),
  identifier: Schema.optional(Schema.String),
}).pipe(
  Schema.filter((args) => !_.isEmpty(_.omitBy(args, _.isUndefined))),
);

export const ContractActionSchema = Schema.Struct({
  address: Schema.String,
  block_height: Schema.optional(Schema.Number),
  block_hash: Schema.optional(Schema.String),
  tx_hash: Schema.optional(Schema.String),
  tx_identifier: Schema.optional(Schema.String),
}).pipe(
  Schema.filter((args) => !_.isEmpty(_.omitBy(args, _.isUndefined))),
  Schema.transformOrFail(
    Schema.Struct({
      address: Schema.String,
      offset: Schema.Union(
        Schema.Struct({
          blockOffset: Schema.Union(
            Schema.Struct({ height: Schema.Number }),
            Schema.Struct({ hash: Schema.String }),
          ),
        }),
        Schema.Struct({
          transactionOffset: Schema.Union(
            Schema.Struct({ hash: Schema.String }),
            Schema.Struct({ identifier: Schema.String }),
          ),
        }),
      ),
    }),
    {
      decode: (enc, _opts, _ast) =>
        ParseResult.succeed(Data.struct({
          address: enc.address,
          offset: enc.block_height || enc.block_hash
            ? Data.struct({
              blockOffset: enc.block_height
                ? Data.struct({ height: enc.block_height! })
                : Data.struct({ hash: enc.block_hash! }),
            })
            : Data.struct({
              transactionOffset: enc.tx_hash
                ? Data.struct({ hash: enc.tx_hash! })
                : Data.struct({ identifier: enc.tx_identifier! }),
            }),
        })),
      encode: (dec, _opts, ast) =>
        ParseResult.fail(
          new ParseResult.Forbidden(
            ast,
            dec,
            "Cannot encode offset to arguments",
          ),
        ),
    },
  ),
);

export const DustGenerationStatusSchema = Schema.Struct({
  stake_keys: Schema.NonEmptyArray(Schema.String),
});

export const DeployContractSchema = Schema.Struct({
  contract_type: Schema.String,
  wallet_seed: Schema.String,
  network_config: Schema.Struct({
    indexer: Schema.String,
    indexer_ws: Schema.String,
    node: Schema.String,
    proof_server: Schema.String,
  }),
});

export const CallContractSchema = Schema.Struct({
  contract_address: Schema.String,
  method: Schema.String,
  args: Schema.optional(Schema.Unknown),
  wallet_seed: Schema.String,
  network_config: Schema.Struct({
    indexer: Schema.String,
    indexer_ws: Schema.String,
    node: Schema.String,
    proof_server: Schema.String,
  }),
});
