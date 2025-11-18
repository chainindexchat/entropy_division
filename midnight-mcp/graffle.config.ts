import { Generator } from "graffle/generator";

const config = Generator.configure({
  schema: {
    type: "url",
    url: "https://rpc.testnet-02.midnight.network/graphql",
  },
  outputDirPath: "./src/graffle",
  methodsOrganization: {
    logical: true,
  },
});

export default config;
