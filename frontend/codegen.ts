import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: '../backend/gateway/supergraph-schema.graphql',
  documents: ['src/graphql/**/*.graphql', 'src/**/*.tsx'],
  generates: {
    'src/graphql/generated/': {
      preset: 'client',
      plugins: [],
    },
  },
  ignoreNoDocuments: true,
};

export default config;
