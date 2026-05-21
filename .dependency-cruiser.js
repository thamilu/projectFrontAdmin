/**
 * Dependency Cruiser Configuration
 * Enforces architectural boundary rules statically at the dependency-graph level.
 */
module.exports = {
  forbidden: [
    {
      name: 'domain-cannot-import-react',
      comment: 'Pure Domain layer must not import React or any UI-related packages.',
      severity: 'error',
      from: { path: '^domain/' },
      to: {
        dependencyTypes: ['npm'],
        path: ['^react$', '^react-dom$', '^lucide-react$', '^next/']
      }
    },
    {
      name: 'domain-cannot-import-other-layers',
      comment: 'Pure Domain layer must not depend on core, infrastructure, shared, or features.',
      severity: 'error',
      from: { path: '^domain/' },
      to: {
        path: ['^core/', '^infrastructure/', '^shared/', '^features/', '^app/']
      }
    },
    {
      name: 'ui-cannot-import-infrastructure',
      comment: 'Shared UI and components must not access infrastructure or database layers directly.',
      severity: 'error',
      from: { path: '^shared/' },
      to: {
        path: ['^infrastructure/']
      }
    },
    {
      name: 'no-cross-feature-imports',
      comment: 'Modular admin features are encapsulated and must not import from other features.',
      severity: 'error',
      from: { path: '^features/admin/(?!hooks/)([^/]+)/' },
      to: {
        path: '^features/admin/(?!hooks/)([^/]+)/',
        pathNot: '^features/admin/$1/'
      }
    },
    {
      name: 'core-cannot-import-features-or-infra',
      comment: 'Core application setup cannot depend on ephemeral feature models or database connections.',
      severity: 'error',
      from: { path: '^core/' },
      to: {
        path: ['^features/', '^infrastructure/']
      }
    }
  ],
  options: {
    doNotFollow: {
      path: 'node_modules'
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json'
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default']
    },
    reporterOptions: {
      archi: {
        collapsePattern: '^(node_modules|packages|src|lib|app|bin|test)\\/[^\\/]+'
      }
    }
  }
};
